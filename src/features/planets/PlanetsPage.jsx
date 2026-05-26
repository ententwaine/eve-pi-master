import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { planetTypes, commodities, PLANET_RESOURCES } from '../../data/pi_data';
import './PlanetsPage.css';

// Helper to recursively find all P0 resource IDs required for a commodity
const getRawIngredients = (commodity, allCommodities) => {
    if (!commodity.inputs || commodity.inputs.length === 0) {
        return [commodity.id];
    }
    let raws = [];
    commodity.inputs.forEach(input => {
        const inputComm = allCommodities.find(c => c.id === input.id);
        if (inputComm) {
            raws = raws.concat(getRawIngredients(inputComm, allCommodities));
        }
    });
    return raws;
};

// Find all P1-P4 commodities that can be made entirely on a planet with the given resources
const getProducibleCommodities = (planetResources) => {
    return commodities.filter(comm => {
        if (comm.tier === 'P0') return false; // P0 is already listed
        const raws = getRawIngredients(comm, commodities);
        return raws.every(rawId => planetResources.includes(rawId));
    });
};

const PlanetsPage = () => {
    const [expandedPlanet, setExpandedPlanet] = useState(null);

    const handlePlanetClick = (planetId) => {
        if (expandedPlanet === planetId) {
            setExpandedPlanet(null); // Toggle off if clicking the same one
        } else {
            setExpandedPlanet(planetId);
        }
    };

    // Helper to get full commodity details from ID
    const getCommodityDetails = (id) => {
        return commodities.find(c => c.id === id);
    };

    return (
        <div className="planets-container fade-in">
            <header className="planets-header">
                <h1>Planetary Database</h1>
                <p>Explore the celestial bodies of New Eden and discover the raw materials hidden within their atmospheres and crusts.</p>
            </header>

            <div className="planets-grid">
                {planetTypes.map((planet) => {
                    const isExpanded = expandedPlanet === planet.id;
                    const planetResources = PLANET_RESOURCES[planet.name] || [];
                    
                    return (
                        <div 
                            key={planet.id} 
                            className={`planet-card ${isExpanded ? 'expanded' : ''}`}
                            style={{ '--planet-color': planet.color }}
                            onClick={() => handlePlanetClick(planet.id)}
                        >
                            <div className="planet-orb-container">
                                <img 
                                    src={planet.image} 
                                    alt={planet.name} 
                                    className="planet-image" 
                                />
                            </div>
                            
                            <div className="planet-info">
                                <h2>{planet.name}</h2>
                                <p className="planet-description">{planet.description}</p>
                            </div>

                            <div className="planet-resources" onClick={(e) => e.stopPropagation()}>
                                <h3 style={{ color: planet.color, marginTop: 0, borderBottom: `1px solid ${planet.color}`, paddingBottom: '8px' }}>
                                    Extractable Resources (P0)
                                </h3>
                                <div className="resource-list" style={{ marginBottom: 'var(--space-md)' }}>
                                    {planetResources.map(resId => {
                                        const res = getCommodityDetails(resId);
                                        if (!res) return null;
                                        return (
                                            <Link to={`/commodity/${res.id}`} key={res.id} className="resource-item">
                                                <img 
                                                    src={`https://images.evetech.net/types/${res.id}/icon?size=32`} 
                                                    alt={res.name}
                                                    className="resource-icon" 
                                                />
                                                <span className="resource-name">{res.name}</span>
                                                <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>&rarr;</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {(() => {
                                    const producible = getProducibleCommodities(planetResources);
                                    const p1List = producible.filter(c => c.tier === 'P1');
                                    const p2List = producible.filter(c => c.tier === 'P2');
                                    const p3List = producible.filter(c => c.tier === 'P3');
                                    const p4List = producible.filter(c => c.tier === 'P4');

                                    const renderProducibleItem = (comm) => (
                                        <Link to={`/commodity/${comm.id}`} key={comm.id} className="producible-item" title={`View ${comm.name} Flowchart`}>
                                            <img 
                                                src={`https://images.evetech.net/types/${comm.id}/icon?size=32`} 
                                                alt={comm.name}
                                                className="producible-icon" 
                                            />
                                            <span className="producible-name">{comm.name}</span>
                                            <span className="flowchart-link-indicator">&rarr;</span>
                                        </Link>
                                    );

                                    if (producible.length === 0) return null;

                                    return (
                                        <div className="producible-section" style={{ marginTop: 'var(--space-md)' }}>
                                            <h3 style={{ color: 'var(--color-accent)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: 'var(--space-sm)' }}>
                                                Single-Planet Producible Tiers (P1 - P4)
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' }}>
                                                {p1List.length > 0 && (
                                                    <div>
                                                        <h4 className="tier-heading text-primary">Processed (P1)</h4>
                                                        <div className="producible-grid">
                                                            {p1List.map(renderProducibleItem)}
                                                        </div>
                                                    </div>
                                                )}
                                                {p2List.length > 0 && (
                                                    <div>
                                                        <h4 className="tier-heading text-accent">Refined (P2)</h4>
                                                        <div className="producible-grid">
                                                            {p2List.map(renderProducibleItem)}
                                                        </div>
                                                    </div>
                                                )}
                                                {p3List.length > 0 && (
                                                    <div>
                                                        <h4 className="tier-heading" style={{ color: '#ff6666' }}>Specialized (P3)</h4>
                                                        <div className="producible-grid">
                                                            {p3List.map(renderProducibleItem)}
                                                        </div>
                                                    </div>
                                                )}
                                                {p4List.length > 0 && (
                                                    <div>
                                                        <h4 className="tier-heading" style={{ color: '#cc66ff' }}>Advanced (P4)</h4>
                                                        <div className="producible-grid">
                                                            {p4List.map(renderProducibleItem)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanetsPage;
