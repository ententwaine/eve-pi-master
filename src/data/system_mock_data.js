// Mock data for Systems and Planets to avoid loading the entire EVE SDE into the browser.
export const mockSystems = [
    {
        name: 'Jita',
        security: 0.9,
        planets: [
            { name: 'Jita I', type: 'Barren' },
            { name: 'Jita II', type: 'Temperate' },
            { name: 'Jita III', type: 'Gas' },
            { name: 'Jita IV', type: 'Barren' }
        ]
    },
    {
        name: 'Amamake',
        security: 0.4,
        planets: [
            { name: 'Amamake I', type: 'Lava' },
            { name: 'Amamake II', type: 'Lava' },
            { name: 'Amamake III', type: 'Barren' },
            { name: 'Amamake IV', type: 'Plasma' },
            { name: 'Amamake V', type: 'Gas' }
        ]
    },
    {
        name: 'Tama',
        security: 0.3,
        planets: [
            { name: 'Tama I', type: 'Barren' },
            { name: 'Tama II', type: 'Ice' },
            { name: 'Tama III', type: 'Gas' },
            { name: 'Tama IV', type: 'Storm' }
        ]
    },
    {
        name: 'Hek',
        security: 0.8,
        planets: [
            { name: 'Hek I', type: 'Barren' },
            { name: 'Hek II', type: 'Temperate' },
            { name: 'Hek III', type: 'Ocean' },
            { name: 'Hek IV', type: 'Gas' }
        ]
    },
    {
        name: 'Dodixie',
        security: 0.9,
        planets: [
            { name: 'Dodixie I', type: 'Barren' },
            { name: 'Dodixie II', type: 'Gas' }
        ]
    }
];

export const extractablePlanetsMap = {
    'Aqueous Liquids': ['Barren', 'Gas', 'Ice', 'Oceanic', 'Temperate', 'Storm'],
    'Autotrophs': ['Temperate'],
    'Base Metals': ['Barren', 'Gas', 'Ice', 'Lava', 'Oceanic', 'Plasma', 'Storm', 'Temperate'],
    'Carbon Compounds': ['Barren', 'Oceanic', 'Temperate'],
    'Complex Organisms': ['Oceanic', 'Temperate'],
    'Felsic Magma': ['Lava'],
    'Heavy Metals': ['Ice', 'Lava', 'Plasma'],
    'Ionic Solutions': ['Gas', 'Storm'],
    'Microorganisms': ['Barren', 'Ice', 'Oceanic', 'Temperate'],
    'Noble Gas': ['Gas', 'Storm'],
    'Noble Metals': ['Barren', 'Plasma'],
    'Non-CS Crystals': ['Lava', 'Plasma'],
    'Planktic Colonies': ['Oceanic'],
    'Reactive Gas': ['Gas'],
    'Suspended Plasma': ['Plasma', 'Storm']
};
