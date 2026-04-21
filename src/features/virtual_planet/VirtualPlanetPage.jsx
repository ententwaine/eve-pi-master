import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COMMAND_CENTER_UPGRADES, PI_STRUCTURES } from '../../data/pi_structures';
import './VirtualPlanetPage.css';

const PlanetSlot = ({ slotId, maxPg, maxCpu }) => {
    const [systemName, setSystemName] = useState('');
    const [planetType, setPlanetType] = useState('Barren');
    const [buildings, setBuildings] = useState([]);
    
    // Always have exactly 1 command center
    useEffect(() => {
        if (buildings.length === 0) {
            setBuildings([{ ...PI_STRUCTURES.command_center, id: Date.now() }]);
        }
    }, [buildings]);

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

        setBuildings([...buildings, { ...template, id: Date.now(), key: buildingKey }]);
    };

    const handleRemoveBuilding = (id) => {
        const b = buildings.find(x => x.id === id);
        if (b && b.name === 'Command Center') return; // Cannot remove CC
        setBuildings(buildings.filter(b => b.id !== id));
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
                    onChange={e => setSystemName(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none', width: '50%' }}
                />
                <select value={planetType} onChange={e => setPlanetType(e.target.value)} className="hub-selector" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
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
    // Realistically, we would fetch these from the user's ESI skill data
    // For the UI, we'll assume max skills to allow full functionality
    const maxPlanets = 6; 
    const ccUpgradeLevel = 5;

    const [slots, setSlots] = useState([]);

    useEffect(() => {
        // Initialize slots
        const initialSlots = Array.from({ length: maxPlanets }).map((_, i) => ({ id: `slot-${i}` }));
        setSlots(initialSlots);
    }, [maxPlanets]);

    const currentUpgrade = COMMAND_CENTER_UPGRADES[ccUpgradeLevel];

    return (
        <div className="vp-container fade-in">
            <div className="vp-header">
                <div>
                    <h1 className="text-primary" style={{ margin: 0, fontSize: '1.8rem' }}>Virtual Planet Planner</h1>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {user ? `Loaded skills for ${user.name}` : 'Using default Max Skills (Log in to use your actual skills)'}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-main" style={{ fontWeight: 'bold' }}>Command Center Upgrade V</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Max PG: {currentUpgrade.power.toLocaleString()} | Max CPU: {currentUpgrade.cpu.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="planet-slots-container">
                {slots.map((slot) => (
                    <PlanetSlot 
                        key={slot.id} 
                        slotId={slot.id} 
                        maxPg={currentUpgrade.power} 
                        maxCpu={currentUpgrade.cpu} 
                    />
                ))}
            </div>
        </div>
    );
};

export default VirtualPlanetPage;
