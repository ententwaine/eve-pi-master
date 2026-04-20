import React from 'react';
import { commodities, RESOURCE_TO_PLANETS } from '../../../data/pi_data';
import PlanetLabel from '../../../components/PlanetLabel';

const PlanetBreakdown = ({ targetId, hourlyYield = 1 }) => {
    const targetItem = commodities.find(c => c.id === targetId);
    
    if (!targetItem || targetItem.tier === 'P0') return null;

    let rawRequirements = {};
    const traverse = (itemId, qtyNeeded) => {
        const item = commodities.find(c => c.id === itemId);
        if (!item) return;
        if (item.tier === 'P0') {
            rawRequirements[itemId] = (rawRequirements[itemId] || 0) + qtyNeeded;
            return;
        }
        const batches = qtyNeeded / (item.outputYield || 1);
        for (const input of item.inputs) {
            traverse(input.id, input.quantity * batches);
        }
    };
    traverse(targetItem.id, hourlyYield);

    return (
        <div style={{ marginTop: 'var(--space-md)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>Planet Extraction Requirements</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                To sustain 1 hour of factory cycles for <strong>{targetItem.name}</strong> ({hourlyYield} units/hr), you need to extract the following raw P0 materials per hour:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {Object.entries(rawRequirements).map(([p0Id, qty]) => {
                    const p0Item = commodities.find(c => c.id === Number(p0Id));
                    const planets = RESOURCE_TO_PLANETS[p0Id] || [];
                    return (
                        <div key={p0Id} style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                                <img src={`https://images.evetech.net/types/${p0Id}/icon?size=32`} alt={p0Item?.name} style={{ width: 24, height: 24, borderRadius: 4 }} />
                                <span style={{ fontWeight: 'bold' }}>{p0Item?.name}</span>
                            </div>
                            <div className="text-accent" style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>
                                {qty.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>units/hr</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', alignItems: 'center' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem', marginRight: '4px' }}>Found on:</span>
                                {planets.map(p => <PlanetLabel key={p} planetName={p} size={14} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)' }} />)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanetBreakdown;
