import json
import urllib.request
import urllib.parse
import re
import time

def run():
    print("Starting validation using Python (single queries)...")
    with open('src/data/pi_data.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    match = re.search(r'export const commodities = (\[.*?\]);', content, re.DOTALL)
    if not match:
        print("Could not find commodities array")
        return
        
    array_str = match.group(1)
    
    names = re.findall(r'name:\s*"([^"]+)"', array_str)
    names = list(set(names))
    
    name_to_id = {}
    
    # Fetch 1 by 1
    for name in names:
        query = urllib.parse.quote(name)
        url = f"https://www.fuzzwork.co.uk/api/typeid.php?typename={query}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                # Should be like {"typename":"Water","typeID":3645}
                if isinstance(data, dict) and data.get('typeID'):
                    name_to_id[name] = data['typeID']
        except Exception as e:
            print(f"Failed to fetch {name}: {e}")
        time.sleep(0.1)
            
    print(f"Fetched {len(name_to_id)} correct IDs.")
    
    mismatch_count = 0
    lines = content.split('\n')
    
    for idx, line in enumerate(lines):
        if 'name: "' in line and 'tier:' in line:
            name_match = re.search(r'name:\s*"([^"]+)"', line)
            if name_match:
                name = name_match.group(1)
                correct_id = name_to_id.get(name)
                if correct_id:
                    current_id_match = re.search(r'\{\s*id:\s*(\d+)', line)
                    if current_id_match:
                        current_id = int(current_id_match.group(1))
                        if current_id != correct_id:
                            print(f"FIXED: {name} ({current_id} -> {correct_id})")
                            # Safely replace only the first { id: \d+
                            lines[idx] = re.sub(r'\{\s*id:\s*\d+', f'{{ id: {correct_id}', line, count=1)
                            mismatch_count += 1
                            
    # Now fix inputs inside the lines
    for idx, line in enumerate(lines):
        if 'inputs: [{' in line:
            # line might have multiple inputs
            # e.g., inputs: [{ id: 123, quantity: 40 }, { id: 456, quantity: 40 }]
            # This is tricky because we only have IDs, we need to know what ID maps to what name to replace it safely.
            pass

    if mismatch_count > 0:
        with open('src/data/pi_data.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Saved {mismatch_count} fixes to pi_data.js!")
    else:
        print("All IDs match!")

if __name__ == "__main__":
    run()
