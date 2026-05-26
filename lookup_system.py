#!/usr/bin/env python3
import sys
import os
import csv
import json

def run():
    if len(sys.argv) < 2:
        print(json.dumps([]))
        return

    query = sys.argv[1].strip().lower()
    if not query:
        print(json.dumps([]))
        return

    csv_path = "eve_systems_planets.csv"
    if not os.path.exists(csv_path):
        # Return empty list if database has not been compiled yet
        print(json.dumps([]))
        return

    # Map system_name -> { name: system_name, security: sec_status, planets: [] }
    systems = {}

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sys_name = row["system_name"]
            if query in sys_name.lower():
                if sys_name not in systems:
                    # Parse security status, default to 0.0
                    try:
                        sec = float(row["security_status"])
                    except (ValueError, TypeError):
                        sec = 0.0
                    
                    systems[sys_name] = {
                        "name": sys_name,
                        "security": sec,
                        "planets": []
                    }
                
                # If there's a planet in this row, add it
                p_name = row["planet_name"]
                p_type = row["planet_type"]
                if p_name and p_type:
                    # Clean type if needed (e.g. Temperate, Gas, etc.)
                    systems[sys_name]["planets"].append({
                        "name": p_name,
                        "type": p_type
                    })

    # Sort matching systems by name
    sorted_system_names = sorted(systems.keys(), key=lambda x: x.lower())
    
    # Cap at 20 matching systems
    results = [systems[name] for name in sorted_system_names[:20]]
    
    # Print as JSON output for stdout consumption
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run()
