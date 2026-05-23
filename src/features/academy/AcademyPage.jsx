import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commodities } from '../../data/pi_data';
import { academyModules, skillChecklist, planetTypeDetails } from './academy_data';
import './AcademyPage.css';

// Prepare patterns for automatic linking of commodities in text
const sortedCommodities = [...commodities].sort((a, b) => b.name.length - a.name.length);
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const commodityPattern = new RegExp(`\\b(${sortedCommodities.map(c => escapeRegExp(c.name)).join('|')})\\b`, 'gi');

const colonyStructures = [
    {
        name: "Command Center",
        shortName: "CC",
        image: "/structures/command_center.png",
        use: "The core power/CPU anchor. It does not store or process materials directly, but it feeds CPU and Power Grid (PG) to your entire colony. Upgrading the Command Center increases your overall construction budget for factories, link routes, and extractors."
    },
    {
        name: "Extractor Control Unit (ECU)",
        shortName: "ECU",
        image: "/structures/extractor_ecu.png",
        use: "The mining hub. It extracts raw resources (P0) from the planet. You attach movable extractor heads to the ECU and position them over rich hotspots on the planet's surface scanning overlay to pull raw materials."
    },
    {
        name: "Basic Industry Facility",
        shortName: "Basic Factory",
        image: "/structures/basic_industry.png",
        use: "The primary refinery. It processes raw materials (P0) into processed commodities (P1). It consumes 3,000 units of a single raw material to output 20 units of a P1 commodity per 30-minute cycle."
    },
    {
        name: "Advanced Industry Facility",
        shortName: "Advanced Factory",
        image: "/structures/advanced_industry.png",
        use: "The secondary refinery. It synthesizes P2 (refined) or P3 (specialized) commodities. It requires multiple inputs. For example, it consumes two different P1 commodities (40 units each) to produce 5 units of a P2 commodity per 1-hour cycle."
    },
    {
        name: "Launchpad",
        shortName: "Launchpad",
        image: "/structures/launchpad.png",
        use: "The primary shipping and buffer hub. It stores up to 10,000m³ of commodities and allows you to import and export materials directly to and from the orbiting Customs Office (POCO)."
    },
    {
        name: "Storage Facility",
        shortName: "Storage",
        image: "/structures/storage_facility.png",
        use: "The storage depot. It stores up to 12,000m³ of commodities, providing a massive buffer to hold raw materials or capture finished products. Unlike the Launchpad, it cannot transfer goods directly to orbit."
    }
];

const AcademyPage = () => {
    // Current active page: "module-1" through "module-10", or "appendix"
    const [activeModuleId, setActiveModuleId] = useState(() => {
        const saved = localStorage.getItem('pi_academy_active_page');
        return saved ? saved : 'module-1';
    });

    // Track completed modules
    const [completedModules, setCompletedModules] = useState(() => {
        const saved = localStorage.getItem('pi_academy_completed');
        return saved ? JSON.parse(saved) : {};
    });

    // Track trained skills
    const [trainedSkills, setTrainedSkills] = useState(() => {
        const saved = localStorage.getItem('pi_academy_skills');
        return saved ? JSON.parse(saved) : {};
    });

    // Selected planet type in scanner tool
    const [selectedPlanetType, setSelectedPlanetType] = useState('Barren');

    // Commodity Inspector search and filter states
    const [searchText, setSearchText] = useState('');
    const [selectedTier, setSelectedTier] = useState('All');

    // Save states to localStorage
    useEffect(() => {
        localStorage.setItem('pi_academy_active_page', activeModuleId);
    }, [activeModuleId]);

    useEffect(() => {
        localStorage.setItem('pi_academy_completed', JSON.stringify(completedModules));
    }, [completedModules]);

    useEffect(() => {
        localStorage.setItem('pi_academy_skills', JSON.stringify(trainedSkills));
    }, [trainedSkills]);

    // Calculate course progress
    const totalModules = academyModules.length;
    const completedCount = academyModules.filter(m => completedModules[m.id]).length;
    const percentCompleted = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    // Toggle completion of a module
    const toggleModuleCompleted = (id, e) => {
        if (e) e.stopPropagation(); // Avoid triggering page load
        setCompletedModules(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Toggle trained skills
    const toggleSkillTrained = (id) => {
        setTrainedSkills(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Helper: find commodity details by name
    const findCommodityByName = (name) => {
        return commodities.find(c => c.name.toLowerCase() === name.toLowerCase());
    };

    // Helper: find commodity details by ID
    const findCommodityById = (id) => {
        return commodities.find(c => c.id === id);
    };

    // Parse and auto-link PI commodity keywords inside text blocks
    const renderLinkedText = (text) => {
        if (!text) return '';
        const parts = text.split(commodityPattern);
        return parts.map((part, i) => {
            const matched = findCommodityByName(part);
            if (matched) {
                return (
                    <Link 
                        key={i} 
                        to={`/commodity/${matched.id}`} 
                        className="text-primary" 
                        style={{ textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    // Navigation handlers
    const handleNext = (currentModuleIndex) => {
        if (currentModuleIndex < totalModules - 1) {
            setActiveModuleId(academyModules[currentModuleIndex + 1].id);
        } else {
            setActiveModuleId('appendix');
        }
        // Scroll content pane to top
        const contentPane = document.querySelector('.academy-content-pane');
        if (contentPane) contentPane.scrollTop = 0;
    };

    const handlePrev = (currentModuleIndex) => {
        if (currentModuleIndex > 0) {
            setActiveModuleId(academyModules[currentModuleIndex - 1].id);
        }
        const contentPane = document.querySelector('.academy-content-pane');
        if (contentPane) contentPane.scrollTop = 0;
    };

    // Get current module object
    const currentModuleIndex = academyModules.findIndex(m => m.id === activeModuleId);
    const isAppendixActive = activeModuleId === 'appendix';
    const currentModule = !isAppendixActive ? academyModules[currentModuleIndex] : null;

    // Filter commodities for Inspector tool
    const filteredCommodities = commodities.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesTier = selectedTier === 'All' || c.tier === selectedTier;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="academy-container fade-in">
            {/* Sidebar with Navigation */}
            <aside className="academy-sidebar glass-panel">
                <div className="academy-progress-card">
                    <div className="progress-header">
                        <span>Course Completion</span>
                        <span>{percentCompleted}% ({completedCount}/{totalModules})</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percentCompleted}%` }}></div>
                    </div>
                </div>

                <nav className="academy-menu-list">
                    {academyModules.map((mod, idx) => (
                        <button
                            key={mod.id}
                            className={`academy-menu-item ${activeModuleId === mod.id ? 'active' : ''}`}
                            onClick={() => setActiveModuleId(mod.id)}
                        >
                            <span 
                                className={`menu-item-check ${completedModules[mod.id] ? 'completed' : ''}`}
                                onClick={(e) => toggleModuleCompleted(mod.id, e)}
                                title={completedModules[mod.id] ? "Mark incomplete" : "Mark completed"}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    {completedModules[mod.id] ? (
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    ) : (
                                        <circle cx="12" cy="12" r="10"></circle>
                                    )}
                                </svg>
                            </span>
                            <span className="menu-item-title">
                                {idx + 1}. {mod.title.split('—')[1] || mod.title}
                            </span>
                        </button>
                    ))}

                    <button
                        className={`academy-menu-item ${isAppendixActive ? 'active' : ''}`}
                        onClick={() => setActiveModuleId('appendix')}
                        style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}
                    >
                        <span className="menu-item-check">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </span>
                        <span className="menu-item-title" style={{ fontWeight: 'bold' }}>
                            Appendix & Cheat Sheets
                        </span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Pane */}
            <main className="academy-content-pane glass-panel">
                {currentModule && (
                    <>
                        {/* Course Page Header */}
                        <div className="academy-module-header">
                            <div className="module-meta text-primary">Module {currentModule.num}</div>
                            <h2 className="module-title">{currentModule.title.split('—')[1] || currentModule.title}</h2>
                            <p className="module-subtitle">{currentModule.subtitle}</p>
                        </div>

                        {/* Summary Block */}
                        <div className="module-summary-card">
                            {currentModule.summary}
                        </div>

                        {/* Key Concepts Grid */}
                        {currentModule.keyConcepts && currentModule.keyConcepts.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 650, marginBottom: 'var(--space-sm)' }}>Key Concepts</h3>
                                <div className="key-concepts-grid">
                                    {currentModule.keyConcepts.map((concept, i) => (
                                        <div key={i} className="concept-card">
                                            <div className="concept-term">{concept.term}</div>
                                            <div className="concept-desc">{concept.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detailed Modules Text */}
                        {currentModule.sections.map((sect, i) => (
                            <section key={i} className="module-section">
                                <h3>{sect.title}</h3>
                                {sect.paragraphs.map((p, pi) => (
                                    <div key={pi} style={{ marginBottom: 'var(--space-sm)' }}>
                                        <p>{renderLinkedText(p)}</p>
                                        {/* Insert structures section if this is the second paragraph of the first section of module-1 */}
                                        {currentModule.id === 'module-1' && sect.title === 'PI as a Supply Chain System' && pi === 1 && (
                                            <div className="structures-section-wrapper">
                                                <h4 className="structures-section-title text-accent">Colony Infrastructure Components</h4>
                                                <div className="colony-structures-grid">
                                                    {colonyStructures.map((struct, sIdx) => (
                                                        <div key={sIdx} className="structure-card glass-panel">
                                                            <div className="structure-img-wrapper">
                                                                <img src={struct.image} alt={struct.name} className="structure-img" />
                                                                <div className="structure-badge">{struct.shortName}</div>
                                                            </div>
                                                            <div className="structure-info">
                                                                <div className="structure-name">{struct.name}</div>
                                                                <div className="structure-use">{struct.use}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        ))}

                        {/* Quick Tips */}
                        {currentModule.quickTips && currentModule.quickTips.length > 0 && (
                            <div className="quick-tips-panel">
                                <div className="tips-title">💡 Capsuleer Pro Tips</div>
                                <ul className="tips-list">
                                    {currentModule.quickTips.map((tip, i) => (
                                        <li key={i}>{renderLinkedText(tip)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="module-footer-nav">
                            <button
                                className="btn-nav-action"
                                onClick={() => handlePrev(currentModuleIndex)}
                                disabled={currentModuleIndex === 0}
                            >
                                ◄ Previous Module
                            </button>

                            <button
                                className={`btn-nav-action ${!completedModules[currentModule.id] ? 'btn-nav-primary' : ''}`}
                                onClick={() => toggleModuleCompleted(currentModule.id)}
                            >
                                {completedModules[currentModule.id] ? '✓ Completed' : 'Mark Completed'}
                            </button>

                            <button
                                className="btn-nav-action btn-nav-primary"
                                onClick={() => handleNext(currentModuleIndex)}
                            >
                                Next Module ►
                            </button>
                        </div>
                    </>
                )}

                {isAppendixActive && (
                    <>
                        <div className="academy-module-header">
                            <div className="module-meta text-primary">Appendix</div>
                            <h2 className="module-title">Quick Reference & Interactive Tools</h2>
                            <p className="module-subtitle">A collection of maps, calculators, and checklists to support your operations.</p>
                        </div>

                        <div className="appendix-tools-container">
                            {/* Tool 1: Interactive Planet Scanner */}
                            <section className="tool-section">
                                <h3 className="tool-title">🌐 Planet Type Resource Scanner</h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                    Select a planet type to scan its native resource distribution. Raw resources are color-coded. Click any resource to view its refining routes.
                                </p>
                                
                                <div className="planet-scanner-grid">
                                    <div className="planet-buttons-list">
                                        {planetTypeDetails.map((pt) => (
                                            <button
                                                key={pt.name}
                                                className={`planet-scan-btn ${selectedPlanetType === pt.name ? 'active' : ''}`}
                                                onClick={() => setSelectedPlanetType(pt.name)}
                                            >
                                                {pt.name}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedPlanetType && (
                                        <div className="planet-scan-results">
                                            <div className="results-header">
                                                <span className="planet-name-badge">{selectedPlanetType} Planet</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: '8px 0' }}>
                                                {planetTypeDetails.find(p => p.name === selectedPlanetType)?.desc}
                                            </p>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                                                Native Raw Resources (P0):
                                            </div>
                                            <div className="resources-list">
                                                {planetTypeDetails.find(p => p.name === selectedPlanetType)?.resources.map((resName) => {
                                                    const resComm = findCommodityByName(resName);
                                                    return resComm ? (
                                                        <Link
                                                            key={resComm.id}
                                                            to={`/commodity/${resComm.id}`}
                                                            className="resource-badge"
                                                            style={{ textDecoration: 'none' }}
                                                        >
                                                            <span style={{ color: 'var(--color-primary)' }}>•</span> {resName}
                                                        </Link>
                                                    ) : (
                                                        <span key={resName} className="resource-badge">
                                                            {resName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Tool 2: Skill Checklist */}
                            <section className="tool-section">
                                <h3 className="tool-title">📋 Skill Training Roadmap</h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                    Track your skill training progression. Recommended targets represent highly optimized levels to aim for early on.
                                </p>
                                
                                <div className="skills-table-container">
                                    <table className="skills-table">
                                        <thead>
                                            <tr>
                                                <th className="skill-check-col">Trained</th>
                                                <th>Skill Name</th>
                                                <th>Recommended</th>
                                                <th>Operational Description</th>
                                                <th>Resources</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {skillChecklist.map((skill) => (
                                                <tr key={skill.id} className={trainedSkills[skill.id] ? 'skill-row-checked' : ''}>
                                                    <td className="skill-check-col">
                                                        <input
                                                            type="checkbox"
                                                            className="skill-checkbox"
                                                            checked={!!trainedSkills[skill.id]}
                                                            onChange={() => toggleSkillTrained(skill.id)}
                                                        />
                                                    </td>
                                                    <td style={{ fontWeight: 'bold', color: trainedSkills[skill.id] ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                                                        {skill.name}
                                                    </td>
                                                    <td style={{ color: 'var(--color-accent)', fontWeight: '500' }}>
                                                        {skill.recommended}
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                                        {skill.desc}
                                                    </td>
                                                    <td>
                                                        <a 
                                                            href={skill.wiki} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="skill-link"
                                                        >
                                                            EVE Uni Wiki
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Tool 3: Commodity Recipe Inspector */}
                            <section className="tool-section">
                                <h3 className="tool-title">🔍 Commodity Tier Inspector</h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                    Inspect details, input ingredients, and processing structures for all commodities.
                                </p>
                                
                                <div className="inspector-controls">
                                    <input
                                        type="text"
                                        className="inspector-input"
                                        placeholder="Search commodities (e.g. Coolant, Robotics...)"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    <select
                                        className="inspector-select"
                                        value={selectedTier}
                                        onChange={(e) => setSelectedTier(e.target.value)}
                                    >
                                        <option value="All">All Tiers (P0 - P4)</option>
                                        <option value="P0">Raw Materials (P0)</option>
                                        <option value="P1">Processed Materials (P1)</option>
                                        <option value="P2">Refined Commodities (P2)</option>
                                        <option value="P3">Specialized Commodities (P3)</option>
                                        <option value="P4">Advanced Commodities (P4)</option>
                                    </select>
                                </div>

                                <div className="inspector-grid">
                                    {filteredCommodities.length === 0 ? (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
                                            No commodities found matching the filters.
                                        </div>
                                    ) : (
                                        filteredCommodities.map((comm) => (
                                            <div key={comm.id} className="commodity-card-mini">
                                                <div className="card-mini-header">
                                                    <Link 
                                                        to={`/commodity/${comm.id}`} 
                                                        style={{ textDecoration: 'none', fontWeight: 'bold', color: 'var(--color-primary)' }}
                                                    >
                                                        {comm.name}
                                                    </Link>
                                                    <span className={`tier-badge tier-${comm.tier}`}>{comm.tier}</span>
                                                </div>
                                                
                                                {comm.inputs && comm.inputs.length > 0 ? (
                                                    <div className="inputs-row">
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Ingredients:</span>
                                                        {comm.inputs.map((inp, idx) => {
                                                            const inputComm = findCommodityById(inp.id);
                                                            return (
                                                                <Link 
                                                                    key={idx} 
                                                                    to={`/commodity/${inp.id}`} 
                                                                    className="input-item-inline text-muted" 
                                                                    style={{ textDecoration: 'none' }}
                                                                >
                                                                    {inputComm ? inputComm.name : `ID: ${inp.id}`} x{inp.quantity}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        Extracted directly from planetary crust.
                                                    </div>
                                                )}
                                                
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'auto', paddingTop: 'var(--space-xs)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                                    Structure: {
                                                        comm.tier === 'P0' ? 'Extractor Control Unit' :
                                                        comm.tier === 'P1' ? 'Basic Industry Facility' :
                                                        comm.tier === 'P4' ? 'High Tech Industry Facility' :
                                                        'Advanced Industry Facility'
                                                    }
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AcademyPage;
