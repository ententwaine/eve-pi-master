import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities, RESOURCE_TO_PLANETS } from '../../data/pi_data';
import { getLowestSellOrder } from '../../services/esiApi';
import PlanetLabel from '../../components/PlanetLabel';

const MaterialCard = ({ commodity, selectedHub }) => {
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(true);

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
        <div className="glass-panel" style={{
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)'
        }}>
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
