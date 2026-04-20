import bz2
import csv
import re
import json

def run():
    print("Reading invTypes from BZ2...")
    name_to_id = {}
    with bz2.open('invTypes.bz2', 'rt', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name_to_id[row['typeName']] = int(row['typeID'])
            
    print(f"Loaded {len(name_to_id)} types from SDE.")
    
    with open('src/data/pi_data.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    match = re.search(r'export const commodities = (\[.*?\]);', content, re.DOTALL)
    if not match:
        print("Could not find commodities array")
        return
        
    array_str = match.group(1)
    
    # Simple regex to fix lines
    mismatch_count = 0
    lines = content.split('\n')
    
    old_id_to_new_id = {}
    
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
                        
                        # Save mapping
                        old_id_to_new_id[current_id] = correct_id
                        
                        if current_id != correct_id:
                            print(f"FIXED MAIN ID: {name} ({current_id} -> {correct_id})")
                            lines[idx] = re.sub(r'\{\s*id:\s*\d+', f'{{ id: {correct_id}', line, count=1)
                            mismatch_count += 1
                else:
                    print(f"Could not find SDE ID for {name}")

    # Now fix inputs
    for idx, line in enumerate(lines):
        if 'inputs: [{' in line:
            # line might have multiple inputs
            # e.g., inputs: [{ id: 123, quantity: 40 }, { id: 456, quantity: 40 }]
            
            # Find all IDs inside the inputs array block
            inputs_match = re.search(r'inputs:\s*\[(.*?)\]', line)
            if inputs_match:
                inner = inputs_match.group(1)
                new_inner = inner
                
                # Replace each `{ id: XXX` with `{ id: NEW_XXX`
                for old_id, new_id in old_id_to_new_id.items():
                    if old_id != new_id:
                        # Need word boundaries or exact matches
                        # e.g., { id: 2398, -> { id: 2309,
                        new_inner = re.sub(rf'id:\s*{old_id}\b', f'id: {new_id}', new_inner)
                        
                if inner != new_inner:
                    print(f"FIXED INPUTS on line {idx+1}")
                    lines[idx] = line.replace(inner, new_inner)
                    mismatch_count += 1

    if mismatch_count > 0:
        with open('src/data/pi_data.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Saved {mismatch_count} fixes to pi_data.js!")
    else:
        print("All IDs match perfectly!")

if __name__ == "__main__":
    run()
