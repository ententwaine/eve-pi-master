const fs = require('fs');

async function run() {
    console.log("Starting strict ID validation using Fuzzwork API...");
    
    // Read current data
    const fileContent = fs.readFileSync('src/data/pi_data.js', 'utf8');
    const commoditiesMatch = fileContent.match(/export const commodities = (\[[\s\S]*?\]);/);
    if (!commoditiesMatch) {
        console.error("Could not find commodities array");
        return;
    }
    
    let commodities;
    try {
        commodities = eval(commoditiesMatch[1]);
    } catch(e) {
        console.error("Failed to parse commodities");
        return;
    }

    // Collect all names to verify
    const names = commodities.map(c => c.name);
    
    // Fuzzwork allows multiple typenames separated by |
    // But let's be safe and do batches of 20
    const nameToNewId = {};
    const oldIdToName = {};

    for (let i = 0; i < names.length; i += 20) {
        const batch = names.slice(i, i + 20);
        const queryStr = batch.map(n => encodeURIComponent(n)).join('|');
        const url = `https://www.fuzzwork.co.uk/api/typeid.php?typename=${queryStr}`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            
            for (const item of data) {
                if (item.typeID && item.typeID !== 0) {
                    nameToNewId[item.typename] = item.typeID;
                } else {
                    console.log(`WARNING: Fuzzwork returned 0 or null for ${item.typename}`);
                }
            }
        } catch (e) {
            console.error("Fetch failed for batch", batch);
        }
    }

    let mismatchCount = 0;

    // Apply new IDs
    for (const item of commodities) {
        oldIdToName[item.id] = item.name;
        
        const correctId = nameToNewId[item.name];
        if (correctId) {
            if (item.id !== correctId) {
                console.log(`FIXED: ${item.name} (${item.id} -> ${correctId})`);
                item.id = correctId;
                mismatchCount++;
            }
        } else {
            console.log(`ERROR: Could not resolve ID for ${item.name}`);
        }
    }

    // Update inputs using the name mapping to ensure references don't break
    for (const item of commodities) {
        if (item.inputs) {
            for (const input of item.inputs) {
                const inputName = oldIdToName[input.id];
                if (inputName && nameToNewId[inputName]) {
                    const correctInputId = nameToNewId[inputName];
                    if (input.id !== correctInputId) {
                        input.id = correctInputId;
                        mismatchCount++;
                    }
                }
            }
        }
    }

    if (mismatchCount === 0) {
        console.log("SUCCESS: All commodities already have the correct official SDE Type IDs!");
        return;
    }

    // Reconstruct the file string
    let newCommoditiesString = "[\n";
    let currentTier = "";

    for (const item of commodities) {
        if (item.tier !== currentTier) {
            currentTier = item.tier;
            newCommoditiesString += `\n    // --- ${currentTier} Commodities ---\n`;
        }
        const inputsStr = item.inputs.map(i => `{ id: ${i.id}, quantity: ${i.quantity} }`).join(', ');
        newCommoditiesString += `    { id: ${item.id}, name: "${item.name}", tier: "${item.tier}", inputs: [${inputsStr}], outputYield: ${item.outputYield} },\n`;
    }
    newCommoditiesString += "];";

    const beforeStr = fileContent.substring(0, commoditiesMatch.index);
    const afterStr = fileContent.substring(commoditiesMatch.index + commoditiesMatch[0].length);
    
    fs.writeFileSync('src/data/pi_data.js', beforeStr + `export const commodities = ${newCommoditiesString}` + afterStr);
    
    console.log(`Done! Fixed ${mismatchCount} total ID mismatches in pi_data.js!`);
}

run();
