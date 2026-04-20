const fs = require('fs');

const recipes = {
    // P1 -> P0 (Qty 6000)
    "Water": { inputs: ["Aqueous Liquids"], qty: 6000 },
    "Industrial Fibers": { inputs: ["Autotrophs"], qty: 6000 },
    "Reactive Metals": { inputs: ["Base Metals"], qty: 6000 },
    "Biofuels": { inputs: ["Carbon Compounds"], qty: 6000 },
    "Proteins": { inputs: ["Complex Organisms"], qty: 6000 },
    "Silicon": { inputs: ["Felsic Magma"], qty: 6000 },
    "Toxic Metals": { inputs: ["Heavy Metals"], qty: 6000 },
    "Electrolytes": { inputs: ["Ionic Solutions"], qty: 6000 },
    "Bacteria": { inputs: ["Microorganisms"], qty: 6000 },
    "Oxygen": { inputs: ["Noble Gas"], qty: 6000 },
    "Precious Metals": { inputs: ["Noble Metals"], qty: 6000 },
    "Chiral Structures": { inputs: ["Non-CS Crystals"], qty: 6000 },
    "Biomass": { inputs: ["Planktic Colonies"], qty: 6000 },
    "Oxidizing Compound": { inputs: ["Reactive Gas"], qty: 6000 },
    "Plasmoids": { inputs: ["Suspended Plasma"], qty: 6000 },

    // P2 -> P1 (Qty 40)
    "Biocells": { inputs: ["Biofuels", "Precious Metals"], qty: 40 },
    "Construction Blocks": { inputs: ["Reactive Metals", "Toxic Metals"], qty: 40 },
    "Consumer Electronics": { inputs: ["Toxic Metals", "Chiral Structures"], qty: 40 },
    "Coolant": { inputs: ["Electrolytes", "Water"], qty: 40 },
    "Enriched Uranium": { inputs: ["Precious Metals", "Toxic Metals"], qty: 40 },
    "Fertilizer": { inputs: ["Bacteria", "Proteins"], qty: 40 },
    "Gen. Enh. Livestock": { inputs: ["Biomass", "Proteins"], qty: 40 },
    "Livestock": { inputs: ["Biofuels", "Proteins"], qty: 40 },
    "Mechanical Parts": { inputs: ["Reactive Metals", "Precious Metals"], qty: 40 },
    "Microfiber Shielding": { inputs: ["Industrial Fibers", "Silicon"], qty: 40 },
    "Miniature Electronics": { inputs: ["Silicon", "Chiral Structures"], qty: 40 },
    "Nanites": { inputs: ["Bacteria", "Reactive Metals"], qty: 40 },
    "Oxides": { inputs: ["Oxygen", "Oxidizing Compound"], qty: 40 },
    "Polyaramids": { inputs: ["Industrial Fibers", "Oxidizing Compound"], qty: 40 },
    "Polytextiles": { inputs: ["Industrial Fibers", "Toxic Metals"], qty: 40 },
    "Rocket Fuel": { inputs: ["Electrolytes", "Plasmoids"], qty: 40 },
    "Silicate Glass": { inputs: ["Silicon", "Oxidizing Compound"], qty: 40 },
    "Superconductors": { inputs: ["Plasmoids", "Water"], qty: 40 },
    "Supertensile Plastics": { inputs: ["Biomass", "Oxygen"], qty: 40 },
    "Synthetic Oil": { inputs: ["Electrolytes", "Oxygen"], qty: 40 },
    "Test Cultures": { inputs: ["Bacteria", "Water"], qty: 40 },
    "Transmitter": { inputs: ["Plasmoids", "Chiral Structures"], qty: 40 },
    "Viral Agent": { inputs: ["Bacteria", "Biomass"], qty: 40 },
    "Water-Cooled CPU": { inputs: ["Reactive Metals", "Water"], qty: 40 },

    // P3 -> P2 (Qty 10)
    "Biotech Research Reports": { inputs: ["Coolant", "Test Cultures", "Livestock"], qty: 10 },
    "Camera Drones": { inputs: ["Silicate Glass", "Rocket Fuel"], qty: 10 },
    "Condensates": { inputs: ["Coolant", "Oxides"], qty: 10 },
    "Cryoprotectant Solution": { inputs: ["Fertilizer", "Test Cultures", "Synthetic Oil"], qty: 10 },
    "Data Chips": { inputs: ["Consumer Electronics", "Microfiber Shielding", "Supertensile Plastics"], qty: 10 },
    "Gel-Matrix Biopaste": { inputs: ["Biocells", "Nanites", "Fertilizer"], qty: 10 },
    "Guidance Systems": { inputs: ["Transmitter", "Water-Cooled CPU"], qty: 10 },
    "Hazmat Detection Systems": { inputs: ["Polyaramids", "Transmitter", "Viral Agent"], qty: 10 },
    "Hermetic Membranes": { inputs: ["Gen. Enh. Livestock", "Polyaramids"], qty: 10 },
    "High-Tech Transmitters": { inputs: ["Polyaramids", "Transmitter"], qty: 10 },
    "Industrial Explosives": { inputs: ["Fertilizer", "Polyaramids"], qty: 10 },
    "Neocoms": { inputs: ["Biocells", "Silicate Glass"], qty: 10 },
    "Nuclear Reactors": { inputs: ["Enriched Uranium", "Microfiber Shielding"], qty: 10 },
    "Planetary Vehicles": { inputs: ["Mechanical Parts", "Consumer Electronics", "Miniature Electronics"], qty: 10 },
    "Robotics": { inputs: ["Consumer Electronics", "Mechanical Parts"], qty: 10 },
    "Smartfab Units": { inputs: ["Construction Blocks", "Miniature Electronics"], qty: 10 },
    "Supercomputers": { inputs: ["Consumer Electronics", "Coolant", "Water-Cooled CPU"], qty: 10 },
    "Synthetic Synapses": { inputs: ["Silicate Glass", "Supertensile Plastics", "Test Cultures"], qty: 10 },
    "Transcranial Microcontrollers": { inputs: ["Biocells", "Nanites"], qty: 10 },
    "Ukomi Superconductors": { inputs: ["Synthetic Oil", "Superconductors"], qty: 10 },
    "Vaccines": { inputs: ["Livestock", "Viral Agent"], qty: 10 },

    // P4 -> P3 (Qty 6) ... except Organic Mortar Applicators uses Bacteria (P1)
    "Broadcast Node": { inputs: ["Data Chips", "High-Tech Transmitters", "Neocoms"], qty: 6 },
    "Integrity Response Drones": { inputs: ["Gel-Matrix Biopaste", "Hazmat Detection Systems", "Neocoms"], qty: 6 },
    "Nano-Factory": { inputs: ["Industrial Explosives", "Robotics", "Ukomi Superconductors"], qty: 6 },
    "Organic Mortar Applicators": { inputs: ["Condensates", "Bacteria", "Robotics"], qty: 6 },
    "Recursive Computing Module": { inputs: ["Biotech Research Reports", "Guidance Systems", "Synthetic Synapses"], qty: 6 },
    "Self-Harmonizing Power Core": { inputs: ["Camera Drones", "High-Tech Transmitters", "Nuclear Reactors"], qty: 6 },
    "Sterile Conduits": { inputs: ["Biotech Research Reports", "Camera Drones", "Smartfab Units"], qty: 6 },
    "Wetware Mainframe": { inputs: ["Biotech Research Reports", "Cryoprotectant Solution", "Supercomputers"], qty: 6 }
};

// Organic Mortar Applicators uses Bacteria which needs 40, others 6
const exceptions = {
    "Organic Mortar Applicators": {
        "Bacteria": 40
    }
};

const run = () => {
    let content = fs.readFileSync('src/data/pi_data.js', 'utf8');
    
    // Extract current commodities to build name->id map
    const match = content.match(/export const commodities = (\[[\s\S]*?\]);/);
    if (!match) return console.log("Failed to find commodities");
    
    let commodities;
    try {
        commodities = eval(match[1]);
    } catch(e) {
        return console.log("Failed to parse");
    }
    
    const nameToId = {};
    commodities.forEach(c => {
        // Handle the name change for Genetically Enhanced Livestock
        const lookupName = c.name === "Genetically Enhanced Livestock" ? "Gen. Enh. Livestock" : c.name;
        nameToId[lookupName] = c.id;
    });

    console.log(`Mapped ${Object.keys(nameToId).length} names to IDs.`);
    
    let newCommodities = [];
    
    commodities.forEach(c => {
        let inputs = [];
        const lookupName = c.name === "Genetically Enhanced Livestock" ? "Gen. Enh. Livestock" : c.name;
        const recipe = recipes[lookupName];
        
        if (recipe) {
            recipe.inputs.forEach(inputName => {
                const inputId = nameToId[inputName];
                if (!inputId) {
                    console.log(`CRITICAL ERROR: Could not find ID for input ${inputName}`);
                }
                
                let quantity = recipe.qty;
                if (exceptions[lookupName] && exceptions[lookupName][inputName]) {
                    quantity = exceptions[lookupName][inputName];
                }
                
                inputs.push(`{ id: ${inputId}, quantity: ${quantity} }`);
            });
        }
        
        let newOutputYield = c.outputYield;
        if (c.tier === 'P1') newOutputYield = 40;
        else if (c.tier === 'P2') newOutputYield = 10;
        else if (c.tier === 'P3') newOutputYield = 6;
        else if (c.tier === 'P4') newOutputYield = 1;
        
        const inputsStr = inputs.join(', ');
        newCommodities.push(`    { id: ${c.id}, name: "${c.name}", tier: "${c.tier}", inputs: [${inputsStr}], outputYield: ${newOutputYield} },`);
    });
    
    let newArrayStr = `[\n    // --- Generated ---\n${newCommodities.join('\n')}\n]`;
    
    content = content.substring(0, match.index) + `export const commodities = ${newArrayStr};` + content.substring(match.index + match[0].length);
    
    fs.writeFileSync('src/data/pi_data.js', content);
    console.log("Successfully rebuilt all input arrays!");
};

run();
