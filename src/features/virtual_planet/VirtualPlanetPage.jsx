import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COMMAND_CENTER_UPGRADES, PI_STRUCTURES } from '../../data/pi_structures';
import { getSavedVirtualPlanners, saveVirtualPlanner } from '../../utils/storage';
import './VirtualPlanetPage.css';

const PlanetSlot = ({ slotId, maxPg, maxCpu, slotData, onSlotUpdate }) => {
    const systemName = slotData?.systemName || '';
    const planetType = slotData?.planetType || 'Barren';
    const buildings = slotData?.buildings || [];

    const updateSlot = (updates) => {
        if (onSlotUpdate) {
            onSlotUpdate(slotId, { ...slotData, ...updates });
        }
    };
    
    // Always have exactly 1 command center
    useEffect(() => {
        if (buildings.length === 0) {
            updateSlot({ buildings: [{ ...PI_STRUCTURES.command_center, id: Date.now() }] });
        }
    }, [buildings.length]);

    const usedPg = buildings.reduce((sum, b) => sum + b.power, 0);
    const usedCpu = buildings.reduce((sum, b) => sum + b.cpu, 0);

    const pgPercent = Math.min(100, (usedPg / maxPg) * 100);
    const cpuPercent = Math.min(100, (usedCpu / maxCpu) * 100);

    const getBarColor = (percent) => {
        if (percent > 95) return 'danger';
        if (percent > 80) return 'warning';
        return 'safe';
    };

    const handleAddBuilding = (buildingKey) => {
        const template = PI_STRUCTURES[buildingKey];
        if (!template) return;

        // Prevent adding Command Center since one always exists
        if (buildingKey === 'command_center') return;

        // Check if limits exceeded
        if (usedPg + template.power > maxPg || usedCpu + template.cpu > maxCpu) {
            alert("Not enough Power or CPU to build this!");
            return;
        }

        updateSlot({ buildings: [...buildings, { ...template, id: Date.now(), key: buildingKey }] });
    };

    const handleRemoveBuilding = (id) => {
        const b = buildings.find(x => x.id === id);
        if (b && b.name === 'Command Center') return; // Cannot remove CC
        updateSlot({ buildings: buildings.filter(b => b.id !== id) });
    };

    const buildingCounts = buildings.reduce((acc, b) => {
        acc[b.name] = (acc[b.name] || 0) + 1;
        return acc;
    }, {});

    const extractorHeads = buildingCounts['Extractor Head'] || 0;
    const ecuCount = buildingCounts['Extractor Control Unit'] || 0;
    const maxHeads = ecuCount * 10;

    return (
        <div className="planet-card glass-panel">
            <div className="planet-card-header">
                <input 
                    type="text" 
                    placeholder="Enter System Name..." 
                    value={systemName} 
                    onChange={e => updateSlot({ systemName: e.target.value })}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none', width: '50%' }}
                />
                <select value={planetType} onChange={e => updateSlot({ planetType: e.target.value })} className="hub-selector" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                    {['Barren', 'Gas', 'Ice', 'Lava', 'Oceanic', 'Plasma', 'Storm', 'Temperate'].map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div className="planet-stats">
                <div className="stat-bar-container">
                    <div className="stat-label">
                        <span>Power (PG)</span>
                        <span>{usedPg.toLocaleString()} / {maxPg.toLocaleString()} MW</span>
                    </div>
                    <div className="stat-bar-bg">
                        <div className={`stat-bar-fill ${getBarColor(pgPercent)}`} style={{ width: `${pgPercent}%` }}></div>
                    </div>
                </div>

                <div className="stat-bar-container">
                    <div className="stat-label">
                        <span>CPU</span>
                        <span>{usedCpu.toLocaleString()} / {maxCpu.toLocaleString()} tf</span>
                    </div>
                    <div className="stat-bar-bg">
                        <div className={`stat-bar-fill ${getBarColor(cpuPercent)}`} style={{ width: `${cpuPercent}%` }}></div>
                    </div>
                </div>
            </div>

            <select 
                className="add-building-select" 
                defaultValue="" 
                onChange={(e) => {
                    if(e.target.value) {
                        handleAddBuilding(e.target.value);
                        e.target.value = "";
                    }
                }}
            >
                <option value="" disabled>+ Build Facility...</option>
                <option value="extractor_control_unit">Extractor Control Unit</option>
                <option value="extractor_head" disabled={extractorHeads >= maxHeads}>Extractor Head</option>
                <option value="basic_industry_facility">Basic Industry Facility</option>
                <option value="advanced_industry_facility">Advanced Industry Facility</option>
                <option value="high_tech_industry_facility">High-Tech Industry Facility</option>
                <option value="storage_facility">Storage Facility</option>
                <option value="launchpad">Launchpad</option>
            </select>

            <div className="building-list">
                {/* Group buildings by name to show summary */}
                {Object.entries(buildingCounts).map(([name, count]) => {
                    const template = Object.values(PI_STRUCTURES).find(s => s.name === name);
                    if (!template) return null;
                    const key = Object.keys(PI_STRUCTURES).find(k => PI_STRUCTURES[k].name === name);
                    
                    return (
                        <div key={name} className="building-item">
                            <div className="building-info">
                                <img src={template.icon} alt={name} className="building-icon" />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        x{count} • PG: {template.power * count} • CPU: {template.cpu * count}
                                    </div>
                                </div>
                            </div>
                            {name !== 'Command Center' && (
                                <div className="building-controls">
                                    <button className="btn-small" onClick={() => handleAddBuilding(key)}>+</button>
                                    <button className="btn-small" onClick={() => {
                                        // find last instance and remove it
                                        const lastMatch = [...buildings].reverse().find(b => b.name === name);
                                        if (lastMatch) handleRemoveBuilding(lastMatch.id);
                                    }}>-</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {extractorHeads > 0 && (
                <div className="extractor-note">
                    Est. Extraction: ~{extractorHeads * 500} units/hr<br/>
                    <span style={{ fontSize: '0.65rem' }}>(Actual yields vary greatly based on planet richness and cycle time)</span>
                </div>
            )}
        </div>
    );
};

const VirtualPlanetPage = () => {
    const { user } = useAuth();
    
    // Default to max skills if no user is logged in
    const maxPlanets = 6; 
    const ccUpgradeLevel = 5;

    const [slotsData, setSlotsData] = useState({});
    const [savedPlanners, setSavedPlanners] = useState([]);
    const [currentPlannerId, setCurrentPlannerId] = useState('');
    const [plannerName, setPlannerName] = useState('My Virtual Planets');

    useEffect(() => {
        // Load saved planners on mount
        const planners = getSavedVirtualPlanners();
        setSavedPlanners(planners);
    }, []);

    const currentUpgrade = COMMAND_CENTER_UPGRADES[ccUpgradeLevel];

    const handleSlotUpdate = (slotId, data) => {
        setSlotsData(prev => ({
            ...prev,
            [slotId]: data
        }));
    };

    const handleSavePlanner = () => {
        if (!plannerName.trim()) {
            alert("Please enter a name for your planner.");
            return;
        }

        const newPlanner = {
            id: currentPlannerId || Date.now().toString(),
            name: plannerName,
            slotsData: slotsData
        };

        const updatedPlanners = saveVirtualPlanner(newPlanner);
        setSavedPlanners(updatedPlanners);
        setCurrentPlannerId(newPlanner.id);
        alert("Virtual Planner saved successfully!");
    };

    const handleLoadPlanner = (id) => {
        if (!id) {
            // Create new
            setCurrentPlannerId('');
            setPlannerName('My Virtual Planets');
            setSlotsData({});
            return;
        }

        const planner = savedPlanners.find(p => p.id === id);
        if (planner) {
            setCurrentPlannerId(planner.id);
            setPlannerName(planner.name);
            setSlotsData(planner.slotsData || {});
        }
    };

    return (
        <div className="vp-container fade-in">
            <div className="vp-header" style={{ alignItems: 'center' }}>
                <div>
                    <h1 className="text-primary" style={{ margin: 0, fontSize: '1.8rem' }}>Virtual Planet Planner</h1>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {user ? `Loaded skills for ${user.name}` : 'Using default Max Skills (Log in to use your actual skills)'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                    <select 
                        value={currentPlannerId} 
                        onChange={(e) => handleLoadPlanner(e.target.value)}
                        className="hub-selector"
                        style={{ padding: '8px 12px' }}
                    >
                        <option value="">+ Create New Planner</option>
                        {savedPlanners.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    
                    <input 
                        type="text" 
                        placeholder="Planner Name" 
                        value={plannerName}
                        onChange={(e) => setPlannerName(e.target.value)}
                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'white' }}
                    />
                    
                    <button 
                        onClick={handleSavePlanner}
                        className="btn"
                        style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Save
                    </button>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div className="text-main" style={{ fontWeight: 'bold' }}>Command Center Upgrade V</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Max PG: {currentUpgrade.power.toLocaleString()} | Max CPU: {currentUpgrade.cpu.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="planet-slots-container">
                {Array.from({ length: maxPlanets }).map((_, i) => {
                    const slotId = `slot-${i}`;
                    return (
                        <PlanetSlot 
                            key={slotId} 
                            slotId={slotId}
                            slotData={slotsData[slotId]}
                            onSlotUpdate={handleSlotUpdate}
                            maxPg={currentUpgrade.power} 
                            maxCpu={currentUpgrade.cpu} 
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default VirtualPlanetPage;
