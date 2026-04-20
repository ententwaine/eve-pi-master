const fs = require('fs');
const https = require('https');

const fetchId = (name) => {
    return new Promise((resolve, reject) => {
        const url = `https://esi.evetech.net/latest/search/?categories=inventory_type&search=${encodeURIComponent(name)}&strict=true`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.inventory_type && parsed.inventory_type.length > 0) {
                        resolve(parsed.inventory_type[0]);
                    } else {
                        console.log(`Not found: ${name}`);
                        resolve(null);
                    }
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
};

const run = async () => {
    console.log("Starting ID fix...");
    // Read the file as text
    const fileContent = fs.readFileSync('src/data/pi_data.js', 'utf8');
    
    // We will extract the commodities array using regex or simple eval
    // To be safe, we'll extract the commodities array string, evaluate it, fix it, and write it back
    
    const commoditiesMatch = fileContent.match(/export const commodities = (\[[\s\S]*?\]);/);
    if (!commoditiesMatch) {
        console.error("Could not find commodities array");
        return;
    }
    
    // Evaluate to get the array of objects
    let commodities;
    try {
        commodities = eval(commoditiesMatch[1]);
    } catch(e) {
        console.error("Failed to parse commodities");
        return;
    }

    // De-duplicate Base Metals (there's an extra one)
    commodities = commodities.filter((c, index, self) => 
        index === self.findIndex((t) => t.name === c.name)
    );
    
    const nameToNewId = {};
    const oldIdToName = {};

    // First pass: get correct IDs for all items
    for (let i = 0; i < commodities.length; i++) {
        const item = commodities[i];
        oldIdToName[item.id] = item.name;
        
        console.log(`Fetching ${item.name}...`);
        const correctId = await fetchId(item.name);
        
        if (correctId) {
            nameToNewId[item.name] = correctId;
        } else {
            console.log(`Failed to fetch ID for ${item.name}`);
        }
        
        // Add a small delay to respect ESI rate limits
        await new Promise(r => setTimeout(r, 50));
    }

    // Second pass: Update IDs and Input IDs
    for (let i = 0; i < commodities.length; i++) {
        const item = commodities[i];
        if (nameToNewId[item.name]) {
            item.id = nameToNewId[item.name];
        }
        
        // Update inputs
        if (item.inputs) {
            for (let j = 0; j < item.inputs.length; j++) {
                const input = item.inputs[j];
                const inputName = oldIdToName[input.id];
                if (inputName && nameToNewId[inputName]) {
                    input.id = nameToNewId[inputName];
                }
            }
        }
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

    const newFileContent = fileContent.replace(/export const commodities = \[\s\S]*?\];/, `export const commodities = ${newCommoditiesString}`);

    // Wait, regex replace might fail with \s\S. Let's do it safely
    const beforeStr = fileContent.substring(0, commoditiesMatch.index);
    const afterStr = fileContent.substring(commoditiesMatch.index + commoditiesMatch[0].length);
    
    fs.writeFileSync('src/data/pi_data.js', beforeStr + `export const commodities = ${newCommoditiesString}` + afterStr);
    
    console.log("Done updating pi_data.js!");
};

run();
