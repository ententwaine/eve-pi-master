// EVE Online Planetary Interaction Structures Data

export const COMMAND_CENTER_UPGRADES = [
    { level: 0, power: 6000, cpu: 1675, name: 'Command Center' },
    { level: 1, power: 9000, cpu: 7050, name: 'Command Center Upgrade 1' },
    { level: 2, power: 12000, cpu: 12150, name: 'Command Center Upgrade 2' },
    { level: 3, power: 15000, cpu: 17250, name: 'Command Center Upgrade 3' },
    { level: 4, power: 17000, cpu: 21350, name: 'Command Center Upgrade 4' },
    { level: 5, power: 19000, cpu: 25450, name: 'Command Center Upgrade 5' },
];

export const PI_STRUCTURES = {
    'extractor_control_unit': {
        name: 'Extractor Control Unit',
        power: 2600,
        cpu: 400,
        icon: 'https://images.evetech.net/types/2545/icon?size=64', // Base ECU icon, actual types vary by planet (e.g., Gas, Barren)
    },
    'extractor_head': {
        name: 'Extractor Head',
        power: 550,
        cpu: 110,
        icon: 'https://images.evetech.net/types/2545/icon?size=64',
    },
    'basic_industry_facility': {
        name: 'Basic Industry Facility',
        power: 800,
        cpu: 200,
        icon: 'https://images.evetech.net/types/2533/icon?size=64',
    },
    'advanced_industry_facility': {
        name: 'Advanced Industry Facility',
        power: 700,
        cpu: 500,
        icon: 'https://images.evetech.net/types/2544/icon?size=64',
    },
    'high_tech_industry_facility': {
        name: 'High-Tech Industry Facility',
        power: 400,
        cpu: 520,
        icon: 'https://images.evetech.net/types/2563/icon?size=64',
    },
    'storage_facility': {
        name: 'Storage Facility',
        power: 700,
        cpu: 500,
        capacity: 12000,
        icon: 'https://images.evetech.net/types/2536/icon?size=64',
    },
    'launchpad': {
        name: 'Launchpad',
        power: 700,
        cpu: 3600,
        capacity: 10000,
        icon: 'https://images.evetech.net/types/2542/icon?size=64',
    },
    'command_center': {
        name: 'Command Center',
        power: 0, // Handled by upgrades
        cpu: 0,
        icon: 'https://images.evetech.net/types/2524/icon?size=64',
    }
};

// Helper function to map ESI type_id to our internal structure mapping
export const getStructureDataByTypeId = (typeId) => {
    // There are many specific typeIDs for structures based on planet type (e.g. Barren CC vs Gas CC)
    // Here we map known ranges or groups to our general structures for UI purposes.
    
    // Command Centers (types around 2524, 2525, 2530, etc.)
    if ([2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(typeId)) return PI_STRUCTURES.command_center;
    
    // Extractors (types around 2545, etc.)
    if ([2545, 2546, 2547, 2552, 2553, 2556, 2557, 2560, 2561, 2562, 3060, 3061, 3062, 3063, 3064, 3067, 3068].includes(typeId)) return PI_STRUCTURES.extractor_control_unit;
    
    // Basic Industry
    if ([2533, 2534, 2543, 2550, 2554, 2558, 2589, 3065].includes(typeId)) return PI_STRUCTURES.basic_industry_facility;
    
    // Advanced Industry
    if ([2544, 2548, 2551, 2564, 2565, 2566, 2575, 2580].includes(typeId)) return PI_STRUCTURES.advanced_industry_facility;
    
    // High-Tech
    if ([2563].includes(typeId)) return PI_STRUCTURES.high_tech_industry_facility;
    
    // Storage
    if ([2536, 2538, 2541, 2573, 2583, 2586, 2588, 3066].includes(typeId)) return PI_STRUCTURES.storage_facility;
    
    // Launchpad
    if ([2542, 2567, 2568, 2569, 2572, 2578, 2584, 2585].includes(typeId)) return PI_STRUCTURES.launchpad;

    // Fallback
    return { name: `Unknown Structure (${typeId})`, power: 0, cpu: 0, icon: `https://images.evetech.net/types/${typeId}/icon?size=64` };
};
