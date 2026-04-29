import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities, RESOURCE_TO_PLANETS } from '../../data/pi_data';
import { getLowestSellOrder } from '../../services/esiApi';
import PlanetLabel from '../../components/PlanetLabel';
import eveDependencies from '../../data/pi_used_in_eve.json';

const MaterialCard = ({ commodity, selectedHub }) => {
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchPrice = async () => {
            setLoading(true);
            try {
                const sellPrice = await getLowestSellOrder(selectedHub.regionId, commodity.id, selectedHub.systemId);
                if (isMounted) {
                    setPrice(sellPrice);
                    setLoading(false);
                }
            } catch (e) {
                if (isMounted) setLoading(false);
            }
        };
        fetchPrice();
        return () => { isMounted = false; };
    }, [commodity.id, selectedHub]);

    const formatISK = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(value).replace('$', '') + ' ISK';
    };

    const planets = RESOURCE_TO_PLANETS[commodity.id] || [];

    return (
        <div 
            className="glass-panel" 
            style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
                position: 'relative',
                zIndex: isHovered || isTooltipVisible ? 100 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <img 
                        src={`https://images.evetech.net/types/${commodity.id}/icon?size=32`} 
                        alt={commodity.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                    />
                    <Link to={`/commodity/${commodity.id}`} style={{ textDecoration: 'none' }}>
                        <h3 className="text-primary" style={{ margin: 0, cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.target.style.color = 'var(--color-primary-hover)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--color-primary)'}>
                            {commodity.name}
                        </h3>
                    </Link>
                </div>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>ID: {commodity.id}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted">Unit Cost:</span>
                {loading ? (
                    <span className="text-muted">...</span>
                ) : (
                    <span className="text-accent" style={{ fontWeight: 'bold' }}>{formatISK(price)}</span>
                )}
            </div>

            {commodity.tier === 'P0' && planets.length > 0 && (
                <div style={{ marginTop: 'var(--space-sm)' }}>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Found on:</span>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: '4px' }}>
                        {planets.map(p => (
                            <PlanetLabel key={p} planetName={p} size={16} />
                        ))}
                    </div>
                </div>
            )}
            {commodity.tier !== 'P0' && (
                <div style={{ marginTop: 'var(--space-sm)' }}>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Yield per cycle: {commodity.outputYield} units</span>
                </div>
            )}

            {/* Used In Tooltip */}
            <div className="used-in-container" style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                <div 
                    className="used-in-icon"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'help',
                        fontSize: '0.8rem',
                        color: isTooltipVisible ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        background: isTooltipVisible ? 'rgba(0, 217, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        border: `1px solid ${isTooltipVisible ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setIsTooltipVisible(!isTooltipVisible)}
                >
                    <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>i</span>
                    <span>Used In</span>
                </div>
                
                {isTooltipVisible && (
                    <div className="used-in-tooltip" style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: '8px',
                        width: '240px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-primary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-sm)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '8px', 
                            borderBottom: '1px solid rgba(255,255,255,0.1)', 
                            paddingBottom: '4px',
                            position: 'sticky',
                            top: '-8px',
                            background: 'var(--color-bg-base)',
                            zIndex: 10,
                            paddingTop: '8px',
                            marginTop: '-8px'
                        }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Used to craft:</div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsTooltipVisible(false); }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--color-text-muted)', 
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    padding: '0 4px'
                                }}
                                onMouseOver={(e) => e.target.style.color = 'var(--color-danger)'}
                                onMouseOut={(e) => e.target.style.color = 'var(--color-text-muted)'}
                            >
                                &times;
                            </button>
                        </div>
                        {(() => {
                            const piUses = commodities.filter(c => c.inputs.some(i => Number(i.id) === Number(commodity.id))).map(c => c.name);
                            const eveUses = eveDependencies[commodity.id] || [];
                            const combinedUses = [...new Set([...piUses, ...eveUses])].sort();
                            
                            return combinedUses.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--color-text-main)' }}>
                                    {combinedUses.map(name => (
                                        <li key={name}>{name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Nothing</div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

const MaterialsPage = () => {
    const { tier } = useParams();
    const { selectedHub } = useTradeHub();
    
    // Default to P0 if invalid tier is somehow passed
    const currentTier = ['P0', 'P1', 'P2', 'P3', 'P4'].includes(tier) ? tier : 'P0';
    const tierCommodities = commodities.filter(c => c.tier === currentTier);

    return (
        <div>
            <header style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontWeight: 300 }}>{currentTier} Commodities</h1>
                <p className="text-muted">Displaying planetary materials for {selectedHub.name}</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-md)'
            }}>
                {tierCommodities.map(c => (
                    <MaterialCard key={c.id} commodity={c} selectedHub={selectedHub} />
                ))}
            </div>
        </div>
    );
};

export default MaterialsPage;
