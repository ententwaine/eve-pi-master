#!/usr/bin/env python3
"""
EVE Online - Systems & Planets Compiler
========================================
Downloads the EVE SDE (Static Data Export) from sde.riftforeve.online
and produces a CSV with every solar system and its planets.

Output columns:
  region_id, system_id, system_name, security_status,
  planet_id, planet_name, planet_type, celestial_index

Usage:
  python eve_systems_planets.py

Requirements:
  pip install requests

Output:
  eve_systems_planets.csv   (~8 000 systems, ~65 000 planet rows)
"""

import json
import zipfile
import io
import csv
import sys
import os

try:
    import requests
except ImportError:
    sys.exit("Please install requests:  pip install requests")

# ── Download URLs ─────────────────────────────────────────────────────────────
# The *enhanced* SDE from riftforeve.online adds planet names to mapPlanets.jsonl
# (the original CCP export omits them). Use the enhanced version when possible.
ENHANCED_URL = "https://sde.riftforeve.online/assets/eve-online-static-data-latest-enhanced-jsonl.zip"
FALLBACK_URL  = "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip"

# Planet typeID → human-readable type name
# (typeID comes from mapPlanets.jsonl → typeID field, or derived from shaderPreset)
# We map the well-known group/type names used in the SDE:
PLANET_TYPE_NAMES = {
    11: "Temperate",
    12: "Ice",
    13: "Gas",
    2014: "Oceanic",
    2015: "Lava",
    2016: "Barren",
    2017: "Storm",
    2063: "Plasma",
    30889: "Shattered",
    73911: "Barren",
}


def download_sde(url: str) -> zipfile.ZipFile:
    print(f"Downloading SDE from:\n  {url}\n  (this may take a minute, ~150 MB) ...")
    resp = requests.get(url, stream=True, timeout=120)
    resp.raise_for_status()

    total = int(resp.headers.get("content-length", 0))
    downloaded = 0
    chunks = []
    for chunk in resp.iter_content(chunk_size=1024 * 256):
        chunks.append(chunk)
        downloaded += len(chunk)
        if total:
            pct = downloaded / total * 100
            print(f"\r  {pct:.1f}%  ({downloaded // 1_048_576} MB / {total // 1_048_576} MB)", end="", flush=True)
    print()

    data = b"".join(chunks)
    return zipfile.ZipFile(io.BytesIO(data))


def read_jsonl(zf: zipfile.ZipFile, filename: str) -> list[dict]:
    """Read a .jsonl file from the zip and return list of dicts."""
    # File may be at root or inside a folder
    candidates = [n for n in zf.namelist() if n.endswith(filename)]
    if not candidates:
        raise FileNotFoundError(f"{filename} not found in zip. Files: {zf.namelist()[:20]}")
    name = candidates[0]
    print(f"  Reading {name} ...")
    with zf.open(name) as f:
        return [json.loads(line) for line in f if line.strip()]


def main():
    # Try enhanced first, fall back to official
    zf = None
    for url in [ENHANCED_URL, FALLBACK_URL]:
        try:
            zf = download_sde(url)
            break
        except Exception as e:
            print(f"  Warning: could not download from {url}: {e}")

    if zf is None:
        sys.exit("Could not download SDE from any source. Check your internet connection.")

    print("\nParsing SDE files ...")

    systems_raw  = read_jsonl(zf, "mapSolarSystems.jsonl")
    planets_raw  = read_jsonl(zf, "mapPlanets.jsonl")

    # Also load types.jsonl so we can resolve typeID → planet type name
    try:
        types_raw = read_jsonl(zf, "types.jsonl")
        type_names = {}
        for t in types_raw:
            tid = t.get("_key") or t.get("typeID")
            name_obj = t.get("name", {})
            en_name = name_obj.get("en", "") if isinstance(name_obj, dict) else str(name_obj)
            if tid:
                type_names[tid] = en_name
    except Exception:
        print("  (types.jsonl not available, using built-in planet type map)")
        type_names = {}

    # Merge built-in map with types.jsonl names (built-in wins for planet types)
    for tid, name in PLANET_TYPE_NAMES.items():
        type_names[tid] = name

    # Build planet lookup: planetID → planet record
    print("\nBuilding lookup tables ...")
    planet_lookup: dict[int, dict] = {}
    for p in planets_raw:
        pid = p.get("_key") or p.get("planetID")
        if pid:
            planet_lookup[pid] = p

    # ── Write CSV ──────────────────────────────────────────────────────────────
    output_file = "eve_systems_planets.csv"
    print(f"\nWriting {output_file} ...")

    row_count = 0
    with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "region_id",
            "system_id",
            "system_name",
            "security_status",
            "planet_id",
            "planet_name",
            "planet_type",
            "celestial_index",
        ])

        for sys_rec in systems_raw:
            sys_id      = sys_rec.get("_key") or sys_rec.get("solarSystemID")
            region_id   = sys_rec.get("regionID")
            name_obj    = sys_rec.get("name", {})
            sys_name    = name_obj.get("en", "") if isinstance(name_obj, dict) else str(name_obj)
            sec_status  = round(sys_rec.get("securityStatus", 0.0), 2)
            planet_ids  = sys_rec.get("planetIDs", [])

            if not planet_ids:
                # Write the system with no planets (e.g., shattered / no colony)
                writer.writerow([region_id, sys_id, sys_name, sec_status, "", "", "", ""])
                row_count += 1
                continue

            for pid in planet_ids:
                p = planet_lookup.get(pid, {})

                # Planet name: enhanced SDE adds a 'name' field directly
                p_name_raw = p.get("name", "")
                if isinstance(p_name_raw, dict):
                    p_name = p_name_raw.get("en", "")
                else:
                    p_name = str(p_name_raw) if p_name_raw else ""

                # If name still empty, synthesise it (e.g. "Jita IV")
                if not p_name:
                    celestial_index = p.get("celestialIndex", "?")
                    p_name = f"{sys_name} {roman(celestial_index)}" if celestial_index != "?" else f"Planet {pid}"

                # Planet type from typeID
                type_id   = p.get("typeID")
                p_type    = type_names.get(type_id, f"typeID:{type_id}" if type_id else "Unknown")

                celestial = p.get("celestialIndex", "")

                writer.writerow([region_id, sys_id, sys_name, sec_status, pid, p_name, p_type, celestial])
                row_count += 1

    print(f"\nDone!  {row_count:,} rows written to: {os.path.abspath(output_file)}")
    print(f"  Systems processed: {len(systems_raw):,}")
    print(f"  Planets indexed:   {len(planet_lookup):,}")


def roman(n) -> str:
    """Convert integer 1-18 to Roman numeral (for planet names)."""
    try:
        n = int(n)
    except (TypeError, ValueError):
        return str(n)
    vals = [(10,"X"),(9,"IX"),(8,"VIII"),(7,"VII"),(6,"VI"),
            (5,"V"),(4,"IV"),(3,"III"),(2,"II"),(1,"I")]
    result = ""
    for value, numeral in vals:
        while n >= value:
            result += numeral
            n -= value
    return result


if __name__ == "__main__":
    main()
