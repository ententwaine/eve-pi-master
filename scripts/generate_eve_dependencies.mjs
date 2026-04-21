import fs from 'fs';
import { parse } from 'csv-parse/sync';

// We need to parse the CSVs
console.log("Loading CSV files...");
const materialsRecords = parse(fs.readFileSync('materials.csv', 'utf8'), { columns: true, skip_empty_lines: true });
const productsRecords = parse(fs.readFileSync('products.csv', 'utf8'), { columns: true, skip_empty_lines: true });
const invTypesRecords = parse(fs.readFileSync('invTypes.csv', 'utf8'), { columns: true, skip_empty_lines: true });

console.log(`Loaded ${materialsRecords.length} materials, ${productsRecords.length} products, ${invTypesRecords.length} types`);

const typeNames = {};
invTypesRecords.forEach(row => {
    typeNames[row.typeID] = row.typeName;
});

const bpToProducts = {};
// Store array of products for each blueprint because reactions might have multiple outputs, or we just take the first one.
productsRecords.forEach(row => {
    // Only care about Manufacturing (1) and Reactions (11)
    if (row.activityID === '1' || row.activityID === '11') {
        if (!bpToProducts[row.typeID]) bpToProducts[row.typeID] = [];
        bpToProducts[row.typeID].push(row.productTypeID);
    }
});

// Load commodities dynamically (need to bypass ES modules issue or just use regex since it's a simple script)
const piDataContent = fs.readFileSync('src/data/pi_data.js', 'utf8');
const ids = [];
const idMatches = piDataContent.matchAll(/{ id: (\d+), name: "([^"]+)"/g);
for (const match of idMatches) {
    ids.push(parseInt(match[1]));
}

console.log(`Tracking dependencies for ${ids.length} PI commodities...`);

const reverseMap = {};
ids.forEach(id => reverseMap[id] = new Set());

materialsRecords.forEach(row => {
    if (row.activityID === '1' || row.activityID === '11') {
        const matId = parseInt(row.materialTypeID);
        if (reverseMap[matId]) {
            const bpId = row.typeID;
            const prods = bpToProducts[bpId] || [];
            prods.forEach(prodId => {
                if (typeNames[prodId]) {
                    reverseMap[matId].add(typeNames[prodId]);
                }
            });
        }
    }
});

// Clean up sets into sorted arrays
const finalData = {};
for (const id of ids) {
    const list = Array.from(reverseMap[id]).sort();
    finalData[id] = list;
}

fs.writeFileSync('src/data/pi_used_in_eve.json', JSON.stringify(finalData, null, 2));
console.log("Successfully generated src/data/pi_used_in_eve.json");
