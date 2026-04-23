export const planets = [
    {
        id: 1,
        name: "Jita IV - Moon 4 - Caldari Navy Assembly Plant",
        type: "Barren",
        system: "Jita",
        security: 0.9,
        upgradeLevel: 4,
        status: "Active",
        output: "Construction Blocks",
        cycleEnd: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: 2,
        name: "Amamake II",
        type: "Lava",
        system: "Amamake",
        security: 0.4,
        upgradeLevel: 5,
        status: "Idle",
        output: "None",
        cycleEnd: null
    },
    {
        id: 3,
        name: "Hek V",
        type: "Temperate",
        system: "Hek",
        security: 0.8,
        upgradeLevel: 3,
        status: "Extraction",
        output: "Water",
        cycleEnd: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString()
    },
    {
        id: 4,
        name: "Renser VI",
        type: "Gas",
        system: "Renser",
        security: 0.9,
        upgradeLevel: 2,
        status: "Full",
        output: "Oxygen",
        cycleEnd: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }
];

export const commodities = [
    // --- Generated ---
    { id: 2073, name: "Microorganisms", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2267, name: "Base Metals", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2268, name: "Aqueous Liquids", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2305, name: "Autotrophs", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2288, name: "Carbon Compounds", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2287, name: "Complex Organisms", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2307, name: "Felsic Magma", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2272, name: "Heavy Metals", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2309, name: "Ionic Solutions", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2310, name: "Noble Gas", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2270, name: "Noble Metals", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2306, name: "Non-CS Crystals", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2286, name: "Planktic Colonies", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2311, name: "Reactive Gas", tier: "P0", inputs: [], outputYield: 1 },
    { id: 2308, name: "Suspended Plasma", tier: "P0", inputs: [], outputYield: 1 },
    { id: 3645, name: "Water", tier: "P1", inputs: [{ id: 2268, quantity: 6000 }], outputYield: 40 },
    { id: 2397, name: "Industrial Fibers", tier: "P1", inputs: [{ id: 2305, quantity: 6000 }], outputYield: 40 },
    { id: 2398, name: "Reactive Metals", tier: "P1", inputs: [{ id: 2267, quantity: 6000 }], outputYield: 40 },
    { id: 2396, name: "Biofuels", tier: "P1", inputs: [{ id: 2288, quantity: 6000 }], outputYield: 40 },
    { id: 2395, name: "Proteins", tier: "P1", inputs: [{ id: 2287, quantity: 6000 }], outputYield: 40 },
    { id: 9828, name: "Silicon", tier: "P1", inputs: [{ id: 2307, quantity: 6000 }], outputYield: 40 },
    { id: 2400, name: "Toxic Metals", tier: "P1", inputs: [{ id: 2272, quantity: 6000 }], outputYield: 40 },
    { id: 2390, name: "Electrolytes", tier: "P1", inputs: [{ id: 2309, quantity: 6000 }], outputYield: 40 },
    { id: 2393, name: "Bacteria", tier: "P1", inputs: [{ id: 2073, quantity: 6000 }], outputYield: 40 },
    { id: 3683, name: "Oxygen", tier: "P1", inputs: [{ id: 2310, quantity: 6000 }], outputYield: 40 },
    { id: 2399, name: "Precious Metals", tier: "P1", inputs: [{ id: 2270, quantity: 6000 }], outputYield: 40 },
    { id: 2401, name: "Chiral Structures", tier: "P1", inputs: [{ id: 2306, quantity: 6000 }], outputYield: 40 },
    { id: 3779, name: "Biomass", tier: "P1", inputs: [{ id: 2286, quantity: 6000 }], outputYield: 40 },
    { id: 2392, name: "Oxidizing Compound", tier: "P1", inputs: [{ id: 2311, quantity: 6000 }], outputYield: 40 },
    { id: 2389, name: "Plasmoids", tier: "P1", inputs: [{ id: 2308, quantity: 6000 }], outputYield: 40 },
    { id: 2329, name: "Biocells", tier: "P2", inputs: [{ id: 2396, quantity: 40 }, { id: 2399, quantity: 40 }], outputYield: 10 },
    { id: 3828, name: "Construction Blocks", tier: "P2", inputs: [{ id: 2398, quantity: 40 }, { id: 2400, quantity: 40 }], outputYield: 10 },
    { id: 9836, name: "Consumer Electronics", tier: "P2", inputs: [{ id: 2400, quantity: 40 }, { id: 2401, quantity: 40 }], outputYield: 10 },
    { id: 9832, name: "Coolant", tier: "P2", inputs: [{ id: 2390, quantity: 40 }, { id: 3645, quantity: 40 }], outputYield: 10 },
    { id: 44, name: "Enriched Uranium", tier: "P2", inputs: [{ id: 2399, quantity: 40 }, { id: 2400, quantity: 40 }], outputYield: 10 },
    { id: 3693, name: "Fertilizer", tier: "P2", inputs: [{ id: 2393, quantity: 40 }, { id: 2395, quantity: 40 }], outputYield: 10 },
    { id: 15317, name: "Genetically Enhanced Livestock", tier: "P2", inputs: [{ id: 3779, quantity: 40 }, { id: 2395, quantity: 40 }], outputYield: 10 },
    { id: 3725, name: "Livestock", tier: "P2", inputs: [{ id: 2396, quantity: 40 }, { id: 2395, quantity: 40 }], outputYield: 10 },
    { id: 3689, name: "Mechanical Parts", tier: "P2", inputs: [{ id: 2398, quantity: 40 }, { id: 2399, quantity: 40 }], outputYield: 10 },
    { id: 2327, name: "Microfiber Shielding", tier: "P2", inputs: [{ id: 2397, quantity: 40 }, { id: 9828, quantity: 40 }], outputYield: 10 },
    { id: 9842, name: "Miniature Electronics", tier: "P2", inputs: [{ id: 9828, quantity: 40 }, { id: 2401, quantity: 40 }], outputYield: 10 },
    { id: 2463, name: "Nanites", tier: "P2", inputs: [{ id: 2393, quantity: 40 }, { id: 2398, quantity: 40 }], outputYield: 10 },
    { id: 2317, name: "Oxides", tier: "P2", inputs: [{ id: 3683, quantity: 40 }, { id: 2392, quantity: 40 }], outputYield: 10 },
    { id: 2321, name: "Polyaramids", tier: "P2", inputs: [{ id: 2397, quantity: 40 }, { id: 2392, quantity: 40 }], outputYield: 10 },
    { id: 3695, name: "Polytextiles", tier: "P2", inputs: [{ id: 2397, quantity: 40 }, { id: 2400, quantity: 40 }], outputYield: 10 },
    { id: 9830, name: "Rocket Fuel", tier: "P2", inputs: [{ id: 2390, quantity: 40 }, { id: 2389, quantity: 40 }], outputYield: 10 },
    { id: 3697, name: "Silicate Glass", tier: "P2", inputs: [{ id: 9828, quantity: 40 }, { id: 2392, quantity: 40 }], outputYield: 10 },
    { id: 9838, name: "Superconductors", tier: "P2", inputs: [{ id: 2389, quantity: 40 }, { id: 3645, quantity: 40 }], outputYield: 10 },
    { id: 2312, name: "Supertensile Plastics", tier: "P2", inputs: [{ id: 3779, quantity: 40 }, { id: 3683, quantity: 40 }], outputYield: 10 },
    { id: 3691, name: "Synthetic Oil", tier: "P2", inputs: [{ id: 2390, quantity: 40 }, { id: 3683, quantity: 40 }], outputYield: 10 },
    { id: 2319, name: "Test Cultures", tier: "P2", inputs: [{ id: 2393, quantity: 40 }, { id: 3645, quantity: 40 }], outputYield: 10 },
    { id: 9840, name: "Transmitter", tier: "P2", inputs: [{ id: 2389, quantity: 40 }, { id: 2401, quantity: 40 }], outputYield: 10 },
    { id: 3775, name: "Viral Agent", tier: "P2", inputs: [{ id: 2393, quantity: 40 }, { id: 3779, quantity: 40 }], outputYield: 10 },
    { id: 2328, name: "Water-Cooled CPU", tier: "P2", inputs: [{ id: 2398, quantity: 40 }, { id: 3645, quantity: 40 }], outputYield: 10 },
    { id: 2358, name: "Biotech Research Reports", tier: "P3", inputs: [{ id: 9832, quantity: 10 }, { id: 2319, quantity: 10 }, { id: 3725, quantity: 10 }], outputYield: 6 },
    { id: 2345, name: "Camera Drones", tier: "P3", inputs: [{ id: 3697, quantity: 10 }, { id: 9830, quantity: 10 }], outputYield: 6 },
    { id: 2344, name: "Condensates", tier: "P3", inputs: [{ id: 9832, quantity: 10 }, { id: 2317, quantity: 10 }], outputYield: 6 },
    { id: 2367, name: "Cryoprotectant Solution", tier: "P3", inputs: [{ id: 3693, quantity: 10 }, { id: 2319, quantity: 10 }, { id: 3691, quantity: 10 }], outputYield: 6 },
    { id: 17392, name: "Data Chips", tier: "P3", inputs: [{ id: 9836, quantity: 10 }, { id: 2327, quantity: 10 }, { id: 2312, quantity: 10 }], outputYield: 6 },
    { id: 2348, name: "Gel-Matrix Biopaste", tier: "P3", inputs: [{ id: 2329, quantity: 10 }, { id: 2463, quantity: 10 }, { id: 3693, quantity: 10 }], outputYield: 6 },
    { id: 9834, name: "Guidance Systems", tier: "P3", inputs: [{ id: 9840, quantity: 10 }, { id: 2328, quantity: 10 }], outputYield: 6 },
    { id: 2366, name: "Hazmat Detection Systems", tier: "P3", inputs: [{ id: 2321, quantity: 10 }, { id: 9840, quantity: 10 }, { id: 3775, quantity: 10 }], outputYield: 6 },
    { id: 2361, name: "Hermetic Membranes", tier: "P3", inputs: [{ id: 15317, quantity: 10 }, { id: 2321, quantity: 10 }], outputYield: 6 },
    { id: 17898, name: "High-Tech Transmitters", tier: "P3", inputs: [{ id: 2321, quantity: 10 }, { id: 9840, quantity: 10 }], outputYield: 6 },
    { id: 2360, name: "Industrial Explosives", tier: "P3", inputs: [{ id: 3693, quantity: 10 }, { id: 2321, quantity: 10 }], outputYield: 6 },
    { id: 2354, name: "Neocoms", tier: "P3", inputs: [{ id: 2329, quantity: 10 }, { id: 3697, quantity: 10 }], outputYield: 6 },
    { id: 2352, name: "Nuclear Reactors", tier: "P3", inputs: [{ id: 44, quantity: 10 }, { id: 2327, quantity: 10 }], outputYield: 6 },
    { id: 9846, name: "Planetary Vehicles", tier: "P3", inputs: [{ id: 3689, quantity: 10 }, { id: 9836, quantity: 10 }, { id: 9842, quantity: 10 }], outputYield: 6 },
    { id: 9848, name: "Robotics", tier: "P3", inputs: [{ id: 9836, quantity: 10 }, { id: 3689, quantity: 10 }], outputYield: 6 },
    { id: 2351, name: "Smartfab Units", tier: "P3", inputs: [{ id: 3828, quantity: 10 }, { id: 9842, quantity: 10 }], outputYield: 6 },
    { id: 2349, name: "Supercomputers", tier: "P3", inputs: [{ id: 9836, quantity: 10 }, { id: 9832, quantity: 10 }, { id: 2328, quantity: 10 }], outputYield: 6 },
    { id: 2346, name: "Synthetic Synapses", tier: "P3", inputs: [{ id: 3697, quantity: 10 }, { id: 2312, quantity: 10 }, { id: 2319, quantity: 10 }], outputYield: 6 },
    { id: 12836, name: "Transcranial Microcontrollers", tier: "P3", inputs: [{ id: 2329, quantity: 10 }, { id: 2463, quantity: 10 }], outputYield: 6 },
    { id: 17136, name: "Ukomi Superconductors", tier: "P3", inputs: [{ id: 3691, quantity: 10 }, { id: 9838, quantity: 10 }], outputYield: 6 },
    { id: 28974, name: "Vaccines", tier: "P3", inputs: [{ id: 3725, quantity: 10 }, { id: 3775, quantity: 10 }], outputYield: 6 },
    { id: 2867, name: "Broadcast Node", tier: "P4", inputs: [{ id: 17392, quantity: 6 }, { id: 17898, quantity: 6 }, { id: 2354, quantity: 6 }], outputYield: 1 },
    { id: 2868, name: "Integrity Response Drones", tier: "P4", inputs: [{ id: 2348, quantity: 6 }, { id: 2366, quantity: 6 }, { id: 2354, quantity: 6 }], outputYield: 1 },
    { id: 2869, name: "Nano-Factory", tier: "P4", inputs: [{ id: 2360, quantity: 6 }, { id: 9848, quantity: 6 }, { id: 17136, quantity: 6 }], outputYield: 1 },
    { id: 2870, name: "Organic Mortar Applicators", tier: "P4", inputs: [{ id: 2344, quantity: 6 }, { id: 2393, quantity: 40 }, { id: 9848, quantity: 6 }], outputYield: 1 },
    { id: 2871, name: "Recursive Computing Module", tier: "P4", inputs: [{ id: 2358, quantity: 6 }, { id: 9834, quantity: 6 }, { id: 2346, quantity: 6 }], outputYield: 1 },
    { id: 2872, name: "Self-Harmonizing Power Core", tier: "P4", inputs: [{ id: 2345, quantity: 6 }, { id: 17898, quantity: 6 }, { id: 2352, quantity: 6 }], outputYield: 1 },
    { id: 2875, name: "Sterile Conduits", tier: "P4", inputs: [{ id: 2358, quantity: 6 }, { id: 2345, quantity: 6 }, { id: 2351, quantity: 6 }], outputYield: 1 },
    { id: 2876, name: "Wetware Mainframe", tier: "P4", inputs: [{ id: 2358, quantity: 6 }, { id: 2367, quantity: 6 }, { id: 2349, quantity: 6 }], outputYield: 1 },
];

export const RESOURCE_TO_PLANETS = {
    2268: ["Barren", "Gas", "Ice", "Oceanic", "Storm", "Temperate"], // Aqueous Liquids
    2305: ["Temperate"], // Autotrophs
    2267: ["Barren", "Gas", "Ice", "Lava", "Oceanic", "Plasma", "Storm"], // Base Metals
    2288: ["Barren", "Oceanic", "Temperate"], // Carbon Compounds
    2287: ["Oceanic", "Temperate"], // Complex Organisms
    2307: ["Lava", "Plasma"], // Felsic Magma
    2272: ["Ice", "Lava", "Plasma"], // Heavy Metals
    2309: ["Gas", "Storm"], // Ionic Solutions
    2073: ["Barren", "Ice", "Oceanic", "Temperate"], // Microorganisms
    2310: ["Gas", "Ice", "Storm"], // Noble Gas
    2270: ["Barren", "Plasma"], // Noble Metals
    2306: ["Lava", "Plasma"], // Non-CS Crystals
    2286: ["Ice", "Oceanic"], // Planktic Colonies
    2311: ["Gas", "Storm"], // Reactive Gas
    2308: ["Lava", "Plasma", "Storm"], // Suspended Plasma
};

export const planetTypes = [
    { id: 2015, name: "Barren", color: "var(--color-primary)", description: "Desolate and lifeless, featuring minimal atmospheric conditions.", resources: [2268, 2267, 2288, 2073, 2270] },
    { id: 13, name: "Gas", color: "#66ffcc", description: "Vast gas giants with dense, stormy atmospheres.", resources: [2268, 2267, 2309, 2310, 2311] },
    { id: 12, name: "Ice", color: "#ccffff", description: "Frozen worlds covered entirely by thick glacial sheets.", resources: [2268, 2272, 2073, 2306, 2286] },
    { id: 2014, name: "Lava", color: "#ff6600", description: "Volcanically hyper-active worlds with oceans of molten rock.", resources: [2267, 2307, 2272, 2306, 2308] },
    { id: 14, name: "Oceanic", color: "#3399ff", description: "Worlds entirely enveloped by deep global oceans.", resources: [2268, 2288, 2287, 2073, 2286] },
    { id: 2017, name: "Plasma", color: "#ff33cc", description: "Scorched planets bathed in intense radiation and plasma storms.", resources: [2267, 2272, 2270, 2306, 2308] },
    { id: 2016, name: "Storm", color: "#ffcc00", description: "Turbulent worlds defined by violent global weather systems.", resources: [2268, 2267, 2309, 2310, 2308] },
    { id: 11, name: "Temperate", color: "#66ff66", description: "Lush, life-bearing worlds with stable climates.", resources: [2268, 2305, 2288, 2287, 2073] }
];
