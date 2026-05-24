import { planetTypes, commodities } from '../../data/pi_data';

export const academyModules = [
    {
        id: "module-1",
        num: 1,
        title: "What Is PI and Is It Worth Your Time?",
        subtitle: "Addresses the #1 question: \"Is PI even profitable?\"",
        summary: "Planetary Interaction (PI) is one of the most reliable passive income streams in EVE Online, allowing capsuleers to build planetary colonies that extract raw resources and refine them into commodities.",
        keyConcepts: [
            {
                term: "Planetary Industry (PI)",
                desc: "An assembly-line system consisting of Command Centers, Extractor Control Units, Storage Facilities, and Processing Plants operating on planet surfaces to produce tradeable items from raw planetary materials."
            },
            {
                term: "Passive Income",
                desc: "PI runs in the background 24/7. Once set up, it requires only a few minutes every few days to restart extractors and haul commodities to market."
            },
            {
                term: "Alpha vs. Omega",
                desc: "Alpha clones are limited to 1 planet, cannot train advanced skills, and cannot export via Customs Offices (must launch space containers manually, 500m³ at a time). Omega clones can run up to 6 planets per character, build advanced chains, and export easily."
            }
        ],
        sections: [
            {
                title: "PI as a Supply Chain System",
                paragraphs: [
                    "Planetary Interaction fits into the EVE Online economy as the foundational source of materials for almost all advanced structures, ships, and consumables. Fuel blocks, sovereignty structures, tech 2 components, and Nanite Repair Paste all require planetary commodities.",
                    "Your planet is a miniature factory. Extractor Control Units (ECUs) draw raw resources (P0) from the ground. Basic Industry Facilities refine these into P1 commodities. Advanced Industry Facilities combine P1 inputs into P2, and further up to P3 and P4. Managing this flow is a game of balancing CPU, Power Grid, and routing pathways."
                ]
            },
            {
                title: "High-Sec vs. Low-Sec, Null-Sec, and Wormholes",
                paragraphs: [
                    "High-security space (high-sec) is excellent for learning the ropes and testing configurations without risk. However, it is not viable for long-term profit. High-sec planets have low resource density, high player competition, and a mandatory 10% NPC export tax on top of any player-owned Customs Office (POCO) taxes.",
                    "Low-sec, null-sec, and wormholes feature vastly superior resource deposits. Furthermore, there is no NPC tax layer in these areas, and player-owned POCOs often feature lower tax rates set by your alliance or corporation."
                ]
            },
            {
                title: "Realistic Income Expectations",
                paragraphs: [
                    "With a single character in high-sec, you might make 20M–50M ISK/month. However, in null-sec or wormhole space, a single optimized character can generate 150M–300M ISK/month with moderate effort.",
                    "If you scale this up to a standard setup of 3 characters on a single account (utilizing Multiple Character Training or simple passive PI alts), you can realistically expect 500M–1B+ ISK/month in null/wormhole space. Many veterans scale this across multiple accounts to fund their PLEX and combat ships entirely through PI."
                ]
            }
        ],
        quickTips: [
            "Start in high-sec to understand how links, routing, and command centers work, but plan your move to low/null/wh as soon as you want serious income.",
            "As an Alpha clone, your output is capped and logistically painful. Upgrade to Omega to unlock the full potential of PI."
        ]
    },
    {
        id: "module-2",
        num: 2,
        title: "Skills You Actually Need",
        subtitle: "\"What skills should I train first?\" is one of the most repeated questions",
        summary: "Training the right skills saves you CPU/PG bottlenecks and lets you manage more colonies simultaneously. Knowing what to prioritize is key to saving training time.",
        keyConcepts: [
            {
                term: "Command Center Upgrades",
                desc: "Determines the quality of Command Center you can deploy, giving you a larger CPU and Power Grid budget for more factories and extractors."
            },
            {
                term: "Interplanetary Consolidation",
                desc: "Unlocks the ability to run more planet colonies. Each rank allows +1 planet, up to a maximum of 6 planets at Rank V."
            },
            {
                term: "Customs Code Expertise",
                desc: "Reduces the NPC import/export tax in high-sec by 10% per level (down to a minimum tax rate of 5% at Rank V)."
            }
        ],
        sections: [
            {
                title: "Core Skill Progression",
                paragraphs: [
                    "Before setting foot on a planet, you should aim for this critical target setup:",
                    "• **Command Center Upgrades IV** — Unlocks higher-quality command centers for your colony networks, giving you more CPU and Power Grid budget for extractors, factories, and links.",
                    "• **Interplanetary Consolidation IV** — Unlocks the ability to manage up to 5 planets simultaneously (base 1 + 4 additional colonies).",
                    "• **The Sweet Spot Milestone** — Operating 5 planets with Level 4 Command Centers is the highly recommended baseline for new players. It balances ease of management with excellent passive income yields.",
                    "Planetology and Advanced Planetology are also important. They improve the accuracy of your scanner overlays when searching for resources. Without these, you will see 'hotspots' that are actually depleted, wasting extractor efficiency."
                ]
            },
            {
                title: "Logistical Infrastructure: The Epithal and Upwell Squall",
                paragraphs: [
                    "Planetary commodities are bulky — a standard industrial hauler fills up after a single planet pickup. For years, the Epithal (Gallente Industrial) was the go-to choice for PI logistics. It has a dedicated Planetary Commodities Hold starting at 45,000m³, scaling to 67,500m³ at Gallente Industrial Level V, plus a separate 6,000m³ Command Center hold that fits up to six command centers at once. It's cheap, quick to train into, and easy to fit for survivability.",
                    "With the Equinox expansion, CCP introduced a strong alternative: the Squall, built by the Upwell Consortium. It matches the Epithal's 45,000m³ base capacity but through a more flexible Infrastructure Hold that accepts PI materials, moon goo, fuel, reagents, and Upwell structure components all at once — a genuine upgrade if your hauling runs involve more than just planetary goods.",
                    "The other key difference is combat capability. The Epithal is a soft target with no real offensive options, but the Squall can fit weapons — enough to handle NPC light tackle at Skyhooks, which matters now that Skyhooks have replaced POCOs as the primary export point in Equinox space. For high-sec or simple setups, the Epithal still gets the job done. For null-sec, wormhole operations, or mixed cargo runs, the Squall is worth serious consideration."
                ]
            }
        ],
        quickTips: [
            "Do not train Command Center Upgrades or Interplanetary Consolidation to V immediately. The jump from IV to V takes weeks; get your other skills to IV first.",
            "Fit your Epithal with Warp Core Stabilizers, Shield Extenders, and Inertial Stabilizers to escape tackle in low-sec and null-sec."
        ]
    },
    {
        id: "module-3",
        num: 3,
        title: "Planet Types and Choosing What to Make",
        subtitle: "Players consistently struggle with \"which planets should I use?\"",
        summary: "Planets come in 8 distinct varieties, each containing a different set of five raw materials. Knowing how to combine resources locally is the secret to high efficiency.",
        keyConcepts: [
            {
                term: "8 Planet Types",
                desc: "Barren, Gas, Ice, Lava, Oceanic, Plasma, Storm, and Temperate. Each planet type has its own set of 5 native raw resources."
            },
            {
                term: "Planet Radius",
                desc: "The physical size of the planet. Larger planets (like Gas giants) require longer planetary links, which cost more CPU and Power Grid, reducing your structural budget."
            },
            {
                term: "System Logistics",
                desc: "Keep your PI chain inside a single solar system. Transporting goods between systems introduces risk, jump fatigue, and wasted time."
            }
        ],
        sections: [
            {
                title: "Planning Your Production Chains",
                paragraphs: [
                    "To produce high-tier P4 goods (like Broadcast Nodes or Self-Harmonizing Power Cores), you must cover all input materials. While you could theoretically cover all P4 requirements using a minimum of five planet types, you will realistically need more to balance the extraction volumes.",
                    "P4 assembly lines require Barren or Temperate planets specifically. High-Tech factories (which manufacture P4 items) can only be built on these two temperate/habitable planet types. Therefore, you will always need at least one Barren or Temperate planet in your colony network."
                ]
            },
            {
                title: "Using Third-Party Tools",
                paragraphs: [
                    "EVE players do not plan PI in their heads. Use external tools like hanns.io/pi and eve-webtools.com/Planetary/ to map out what you can produce based on the planet types in your home system.",
                    "These tools show you exactly which raw materials combine into which P1, P2, and P3 commodities, and help you scan for optimal setups without placing structures first."
                ]
            }
        ],
        quickTips: [
            "Temperate and Barren planets are highly sought after because they host P4 High-Tech factories. Plan your chain to end on one of these.",
            "Avoid gas giants if possible for complex setups; their massive radius eats up CPU/Power Grid through long links."
        ]
    },
    {
        id: "module-4",
        num: 4,
        title: "Setting Up Your First Colony",
        subtitle: "The hands-on basics that trip up every new player",
        summary: "Placing your first structures requires a plan. Placing them out of order or routing them incorrectly will cause your colony to jam or sit idle.",
        keyConcepts: [
            {
                term: "Command Center (CC)",
                desc: "The core node. It does not store items or process anything, but it feeds power and CPU to your entire colony. It must be upgraded before placing other buildings."
            },
            {
                term: "Extractor Control Unit (ECU)",
                desc: "The mining structure. You attach extractor heads to it, which you place over colored hotspots on the planet scanning overlay."
            },
            {
                term: "Routing",
                desc: "The virtual links telling resources where to go. Structures do not move items automatically; you must manually route every input and output."
            }
        ],
        sections: [
            {
                title: "Colony Setup Checklist",
                paragraphs: [
                    "First, buy the correct Command Center from the market (e.g. Lava Command Center for a Lava planet) and place it. Upgrade it immediately to its maximum level before building anything else. This defines your total CPU and Power Grid budget.",
                    "Next, place your Extractor Control Unit (ECU) close to rich resource nodes. Place your launchpad or storage facility nearby. Run links from the ECU to the storage, and from the storage to your factories."
                ]
            },
            {
                title: "The Buffer Rule: Always Route to Storage",
                paragraphs: [
                    "Never route directly from an Extractor to a Factory, or from Factory to Factory. If a factory is full, or its cycle timer mismatches the extractor's extraction spikes, you will lose materials due to routing overflows.",
                    "Always route: Extractor -> Storage/Launchpad -> Factory -> Storage/Launchpad. Your storage facility or launchpad acts as a buffer. It holds the raw material and feeds it to the factories as needed, then collects the output safely."
                ]
            },
            {
                title: "The Survey Cycle",
                paragraphs: [
                    "When starting your extractor, you choose a cycle time (e.g., 1 day, 3 days, or 1 week). Shorter cycles yield far more resources per hour but decay faster and require you to click and restart them constantly.",
                    "Over time, resources directly under your extractor heads will deplete. You will occasionally need to open the planetary screen, move your extractor heads to nearby hot areas, and submit the changes."
                ]
            }
        ],
        quickTips: [
            "Keep links short. The longer the link between structures, the more Power Grid it consumes.",
            "Use the Launchpad as your primary storage buffer. It has a solid volume (10,000m³) and allows you to launch goods into orbit."
        ]
    },
    {
        id: "module-5",
        num: 5,
        title: "The Commodity Tiers (P0 → P4)",
        subtitle: "The most technically confusing part for new players",
        summary: "Planetary Interaction involves 5 tiers of commodities. Understanding how they compress and what they are used for is essential for market optimization.",
        keyConcepts: [
            {
                term: "P0 (Raw)",
                desc: "Raw planetary resources directly extracted from the ground. Bulky and low-value. E.g., Aqueous Liquids, Base Metals."
            },
            {
                term: "P1 (Processed)",
                desc: "Refined from P0 in Basic Industry Facilities. Compresses volume by 4x and adds taxable value. E.g., Water, Reactive Metals."
            },
            {
                term: "P2 (Refined)",
                desc: "Manufactured from two different P1 inputs. E.g., Coolant, Mechanical Parts. This is the baseline trading tier."
            }
        ],
        sections: [
            {
                title: "Understanding Tiers P0 to P2",
                paragraphs: [
                    "P0 materials are extracted directly by ECUs. They have a high volume (0.01m³ each) and low unit value. Refine these into P1 immediately on the same planet. A Basic Industry Facility consumes 3,000 P0 every 30 minutes to produce 20 P1.",
                    "P2 materials are produced in Advanced Industry Facilities. They consume two P1 materials (usually 40 units of each) to produce 5 units of P2 every hour. This compresses volume to about 25% of the original P1 inputs, making it much easier to haul."
                ]
            },
            {
                title: "Advanced Tiers: P3 and P4",
                paragraphs: [
                    "P3 (Specialized) requires two or three P2 inputs. Due to CPU and Power Grid limits on planets, it is extremely difficult to extract and process P3 on a single planet. Players usually extract P2 on multiple planets, haul them to a dedicated factory world, and compile them there.",
                    "P4 (Advanced) represents the pinnacle of PI. These are massive high-tech items (50m³ each) constructed from three P3 components (or two P3 + one P1). They are used to manufacture structure modules, fuel blocks, nanite paste, and capital ship parts. Volume compression is low, but the ISK value per cubic meter is massive."
                ]
            }
        ],
        quickTips: [
            "P2 commodities are the most popular item for new players to produce, balancing easy single-planet setups with decent export value.",
            "Nanite Repair Paste (a P4 commodity) is highly active in trade hubs and a great target for steady local market sales."
        ]
    },
    {
        id: "module-6",
        num: 6,
        title: "Factory Planets and Multi-Planet Chains",
        subtitle: "\"When do I build a factory world?\" is constantly asked",
        summary: "Extraction planets draw resources, but Factory Planets do not mine at all—they import materials, run massive production lines, and export higher-tier products.",
        keyConcepts: [
            {
                term: "Factory Planet",
                desc: "A planet dedicated entirely to processing. It features no extractors, only multiple Launchpads, Storage, and a grid of Advanced and High-Tech Factories."
            },
            {
                term: "Scale Threshold",
                desc: "Do not build factory planets if you operate fewer than 8 total colonies. They require a large volume of raw inputs to stay active."
            },
            {
                term: "High-Tech Setup",
                desc: "A P4 factory setup uses a hierarchical layout: High Tech Factories in the center, flanked by Advanced Factories for P3/P2 chains."
            }
        ],
        sections: [
            {
                title: "Designing a Factory Colony",
                paragraphs: [
                    "A standard factory planet consists of a Launchpad acting as the import buffer. You dump P1 or P2 commodities into the launchpad from space, which routes them to a ring of Advanced Industry Facilities.",
                    "Because there are no extractors consuming Power Grid, you can build 20+ factories on a single world. A maxed-out Command Center can support 28–36 factories, depending on link distances."
                ]
            },
            {
                title: "Scale Limits and Setup Stages",
                paragraphs: [
                    "For a single character with 5 planets: The best setup is 5 extraction planets producing P2 commodities, exporting them directly to the market.",
                    "If you have 2 characters (10 planets): You can have 9 planets extracting P1, and 1 dedicated factory planet importing those P1s and assembling them into P3 specialized goods.",
                    "If you have multiple accounts: You can build a P4 pipeline, where dozens of extraction planets feed a centralized High-Tech Factory planet to produce high-value Broadcast Nodes or Self-Harmonizing Power Cores."
                ]
            }
        ],
        quickTips: [
            "Place structures as close together as humanly possible to minimize link overhead, allowing you to squeeze one extra factory onto the grid.",
            "Use two launchpads: one for raw inputs, and one for finished products, to prevent cargo jams."
        ]
    },
    {
        id: "module-7",
        num: 7,
        title: "Customs Offices, Taxes, and Logistics",
        subtitle: "Export logistics confuse players constantly",
        summary: "Getting your materials off the planet surface and into space requires Customs Offices. Understanding how taxes and hauling work is the key to preserving your margins.",
        keyConcepts: [
            {
                term: "POCO",
                desc: "Player-Owned Customs Office. A structure orbiting a planet. It facilitates the import/export of planetary materials."
            },
            {
                term: "NPC Tax",
                desc: "A mandatory tax charged in high-sec (10% export, 5% import). This tax can be mitigated by training Customs Code Expertise."
            },
            {
                term: "Command Center Launch",
                desc: "If a POCO is blocked, tax is too high, or you are an Alpha clone, you can launch a rocket from your Command Center directly. It holds 500m³."
            }
        ],
        sections: [
            {
                title: "Customs Office Operations",
                paragraphs: [
                    "To export items, you route them to your planetary Launchpad, access the planet view, and transfer them to the Customs Office. You then warp your hauler to the Customs Office in space and drag the items into your cargo hold.",
                    "Every transfer is taxed based on the estimated value of the commodity. In null-sec, player alliances own these POCOs and set custom tax rates (usually 1% to 5%). In high-sec, you pay a player tax plus the mandatory NPC tax."
                ]
            },
            {
                title: "Direct Command Center Launches",
                paragraphs: [
                    "If a POCO is destroyed or has a 100% tax rate, you can use the 'Launch' option on your Command Center. This shoots a cargo container into orbit.",
                    "The container persists in space for 5 days. It is visible only to you in the planetary UI, and you can warp directly to it to retrieve your goods. However, it is limited to 500m³ per launch and has a cooldown timer."
                ]
            }
        ],
        quickTips: [
            "Check corporate and alliance standings; many groups offer 0% or 1% tax rates to active members.",
            "Always check POCO tax rates before setting up a colony. High taxes (above 15%) will completely eat your profit margin."
        ]
    },
    {
        id: "module-8",
        num: 8,
        title: "Space Type Considerations",
        subtitle: "\"Is high-sec PI worth it?\" — asked on nearly every forum",
        summary: "Security space dictates both the risk and the reward of PI. Understanding the trade-offs of each region is critical.",
        keyConcepts: [
            {
                term: "High-Sec",
                desc: "Safe but low profit. Rich nodes are rare, competition is fierce, and NPC tax rates are high. Good only for learning."
            },
            {
                term: "Low-Sec / Null-Sec",
                desc: "High risk, high profit. Resource nodes are rich, and POCO taxes are low. Requires scouting and gate-camp awareness."
            },
            {
                term: "Wormholes",
                desc: "Extreme profit, extreme risk. Resource nodes are pristine. However, lack of local chat intel and shifting exit paths require constant vigilance."
            }
        ],
        sections: [
            {
                title: "Hauling Safely in Dangerous Space",
                paragraphs: [
                    "Hauling your PI commodities is the most dangerous part of the job. Since the Epithal is fragile, a single gate-camp can destroy a week's worth of profit.",
                    "In null-sec, utilize alliance jump freighters or transport goods during quiet off-peak hours. In wormholes, scan down a direct exit to high-sec or low-sec before moving your cargo. Never warp your Epithal directly to a gate without scouting first."
                ]
            }
        ],
        quickTips: [
            "If hauling in low-sec or null-sec, fit a Cloaking Device and a Shield Buffer to buy time if caught.",
            "Join a corporate group in null-sec or a wormhole corporation to gain access to safe local logistics networks."
        ]
    },
    {
        id: "module-9",
        num: 9,
        title: "Optimizing and Scaling Up",
        subtitle: "For players who have the basics down and want to grow",
        summary: "Once you understand the basics, PI becomes a numbers game. Scaling up your operation requires smart tool use and layout templates.",
        keyConcepts: [
            {
                term: "PI Alts",
                desc: "Creating dedicated planetary characters. Since PI skills take less than 14 days to train to a functional level, they are perfect for alt characters."
            },
            {
                term: "Extractor Tuning",
                desc: "Balancing your extraction cycle. Shorter cycles (1 day) produce more, but require daily maintenance. Longer cycles (7 days) are relaxed but less productive."
            },
            {
                term: "CPU/PG Bottlenecks",
                desc: "You will often run out of power or CPU before you run out of physical space. Squeezing efficiency means minimizing links and balancing processors."
            }
        ],
        sections: [
            {
                title: "Optimizing Colony Layouts",
                paragraphs: [
                    "Use standard colony layouts. The most common layout for P2 extraction is the 'Double Extractor' setup, where two ECUs feed a central storage facility, which in turn feeds four Basic Factories.",
                    "To maximize throughput, align your processor counts with your extractor yield. If your extractor pulls 24,000 raw materials per hour, you need exactly 8 Basic Industry Facilities (each consuming 3,000 per hour) to process it without wasting resources."
                ]
            }
        ],
        quickTips: [
            "Use the in-game 'Planetary Colonies' screen in the Business menu to check the status of all your planets without traveling to them.",
            "Keep extraction cycles aligned with your play schedule. If you play every evening, use 24-hour cycles for maximum yields."
        ]
    },
    {
        id: "module-10",
        num: 10,
        title: "Common Mistakes and Troubleshooting",
        subtitle: "Compiled directly from the most repeated forum complaints",
        summary: "Even veteran players make mistakes that stop their income. Use this troubleshooting guide to diagnose why your factories are sitting idle.",
        keyConcepts: [
            {
                term: "Idle Extractor",
                desc: "The number one reason PI income stops. Extractors do not run forever; when their survey cycle ends, they shut down."
            },
            {
                term: "Routing Overflow",
                desc: "When a storage buffer fills up, incoming materials are discarded. This occurs if you over-extract or route factory-to-factory."
            },
            {
                term: "Tax Omissions",
                desc: "Failing to account for POCO tax when purchasing raw materials for factory planets, resulting in negative margins."
            }
        ],
        sections: [
            {
                title: "Troubleshooting Guide",
                paragraphs: [
                    "If your factories are not running, check three things: First, are the inputs routed correctly? Second, is the output routed to a storage node with available space? Third, does the factory have the correct recipe active?",
                    "Another common error is hitting the colony limit. If the game says 'Maximum Number of Colonies Reached', check your Interplanetary Consolidation skill level. You can see your active colonies in the Business menu."
                ]
            }
        ],
        quickTips: [
            "Set a calendar reminder or use third-party discord bots to remind you when your planetary extraction cycles are about to end.",
            "Never build more factories than your storage buffer can supply. Idle factories waste CPU and Power Grid that could be used for other purposes."
        ]
    }
];

export const skillChecklist = [
    { id: "s-ccu", name: "Command Center Upgrades", recommended: "Level IV", desc: "Allows upgraded command centers with more CPU/PG for structures.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-ic", name: "Interplanetary Consolidation", recommended: "Level IV", desc: "Unlocks up to 5 planets (6 at Level V). Essential for scaling.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-rs", name: "Remote Sensing", recommended: "Level III", desc: "Allows scanning planets from a distance. Saves jumps.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-p", name: "Planetology", recommended: "Level III", desc: "Reduces resource scan overlay scanning errors.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-ap", name: "Advanced Planetology", recommended: "Level III", desc: "Further refines resource scan overlay accuracy.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-cce", name: "Customs Code Expertise", recommended: "Level III", desc: "Reduces high-sec NPC import/export taxes by 10% per level.", wiki: "https://wiki.eveuniversity.org/Planetary_Industry#Skills" },
    { id: "s-gi", name: "Gallente Industrial", recommended: "Level I", desc: "Required to fly the Epithal, the premier PI hauling ship.", wiki: "https://wiki.eveuniversity.org/Gallente_Industrial" }
];

const getResourceName = (id) => {
    const item = commodities.find(c => c.id === id);
    return item ? item.name : `Unknown (${id})`;
};

const planetDescriptions = {
    "Barren": "Desolate and lifeless, featuring minimal atmospheric conditions. Excellent for P4 factory planets.",
    "Gas": "Vast gas giants with dense, stormy atmospheres. Huge radius requires high link CPU.",
    "Ice": "Frozen worlds covered entirely by thick glacial sheets.",
    "Lava": "Volcanically hyper-active worlds with oceans of molten rock.",
    "Oceanic": "Worlds entirely enveloped by deep global oceans.",
    "Plasma": "Scorched planets bathed in intense radiation and plasma storms.",
    "Storm": "Turbulent worlds defined by violent global weather systems.",
    "Temperate": "Lush, life-bearing worlds with stable climates. Ideal for P4 factory setup."
};

export const planetTypeDetails = planetTypes.map(p => ({
    name: p.name,
    desc: planetDescriptions[p.name] || p.description,
    resources: p.resources.map(id => getResourceName(id))
}));
