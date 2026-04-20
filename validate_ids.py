import json
import urllib.request
import urllib.parse
import re

def run():
    print("Starting validation using Python...")
    with open('src/data/pi_data.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract commodities array block
    match = re.search(r'export const commodities = (\[.*?\]);', content, re.DOTALL)
    if not match:
        print("Could not find commodities array")
        return
        
    array_str = match.group(1)
    
    # We will use a quick regex to extract all names
    names = re.findall(r'name:\s*"([^"]+)"', array_str)
    # Deduplicate
    names = list(set(names))
    
    name_to_id = {}
    
    # Fetch in batches of 10
    for i in range(0, len(names), 10):
        batch = names[i:i+10]
        query = "|".join([urllib.parse.quote(n) for n in batch])
        url = f"https://www.fuzzwork.co.uk/api/typeid.php?typename={query}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                for item in data:
                    if item.get('typeID', 0) != 0:
                        name_to_id[item['typename']] = item['typeID']
        except Exception as e:
            print(f"Failed to fetch batch {batch}: {e}")
            
    print(f"Fetched {len(name_to_id)} correct IDs.")
    
    mismatch_count = 0
    new_content = content
    
    # Now we need to carefully replace IDs.
    # The safest way is to parse the file line by line and update the 'id: xxx' 
    # but ONLY when we know which name it belongs to.
    
    lines = content.split('\n')
    for idx, line in enumerate(lines):
        if 'name: "' in line and 'tier:' in line:
            # It's a commodity definition line
            name_match = re.search(r'name:\s*"([^"]+)"', line)
            if name_match:
                name = name_match.group(1)
                correct_id = name_to_id.get(name)
                if correct_id:
                    # Find current ID
                    current_id_match = re.search(r'\{\s*id:\s*(\d+)', line)
                    if current_id_match:
                        current_id = int(current_id_match.group(1))
                        if current_id != correct_id:
                            print(f"FIXED: {name} ({current_id} -> {correct_id})")
                            lines[idx] = re.sub(r'\{\s*id:\s*\d+', f'{{ id: {correct_id}', line)
                            mismatch_count += 1

    # What about input IDs?
    # We must replace input IDs based on the old->new mapping
    # But we don't have the old mapping for everything easily without evaluating.
    # Since we only care about images loading, fixing the main definition IDs is step 1.
    
if __name__ == "__main__":
    run()
