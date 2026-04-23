import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { planetTypes, commodities } from '../../data/pi_data';
import './PlanetsPage.css';

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
                    
                    return (
                        <div 
                            key={planet.id} 
                            className={`planet-card ${isExpanded ? 'expanded' : ''}`}
                            style={{ '--planet-color': planet.color }}
                            onClick={() => handlePlanetClick(planet.id)}
                        >
                            <div className="planet-orb-container">
                                <img 
                                    src={`https://images.evetech.net/types/${planet.id}/render?size=256`} 
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
                                <div className="resource-list">
                                    {planet.resources.map(resId => {
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
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanetsPage;
