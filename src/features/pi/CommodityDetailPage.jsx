import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities, RESOURCE_TO_PLANETS } from '../../data/pi_data';
import { getLowestSellOrder, getHighestBuyOrder } from '../../services/esiApi';
import SchematicTree from './components/SchematicTree';
import PlanetBreakdown from './components/PlanetBreakdown';
import PlanetLabel from '../../components/PlanetLabel';

const VOLUMES = {
    'P0': 0.01,
    'P1': 0.38,
    'P2': 1.5,
    'P3': 6.0,
    'P4': 100.0
};

const getPlanetIconPath = (planetName) => {
    const ext = ['barren', 'storm', 'temperate'].includes(planetName.toLowerCase()) ? 'jpg' : 'png';
    return `/planet_icons/${planetName.toLowerCase()}.${ext}`;
};

const CommodityDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedHub } = useTradeHub();
    
    const [priceData, setPriceData] = useState({ sellPrice: 0, buyPrice: 0, inputCost: 0, profit: 0, loading: true });
    const [summaryByTier, setSummaryByTier] = useState(null);
    
    const commodity = commodities.find(c => c.id === Number(id));

    useEffect(() => {
        let isMounted = true;
        
        if (!commodity) return;

        const fetchPrices = async () => {
            setPriceData(prev => ({ ...prev, loading: true }));
            
            try {
                // Fetch sell and buy price for the item
                const sellPrice = await getLowestSellOrder(selectedHub.regionId, commodity.id, selectedHub.systemId);
                const buyPrice = await getHighestBuyOrder(selectedHub.regionId, commodity.id, selectedHub.systemId);
                
                // Fetch sell prices for all inputs to calculate input cost (cost to build)
                let totalInputCost = 0;
                for (const input of commodity.inputs) {
                    const inputSell = await getLowestSellOrder(selectedHub.regionId, input.id, selectedHub.systemId);
                    totalInputCost += (inputSell * input.quantity);
                }

                const costPerUnit = commodity.outputYield > 0 ? (totalInputCost / commodity.outputYield) : 0;
                const profit = sellPrice - costPerUnit;

                if (isMounted) {
                    setPriceData({ sellPrice, buyPrice, inputCost: costPerUnit, profit, loading: false });
                }
            } catch (error) {
                if (isMounted) setPriceData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchPrices();
        return () => { isMounted = false; };
    }, [commodity, selectedHub]);

    const formatISK = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(value)
            .replace('$', '') + ' ISK';
    };

    if (!commodity) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <h2>Commodity Not Found</h2>
                <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Go Back</button>
            </div>
        );
    }

    const volume = VOLUMES[commodity.tier] || 0;

    return (
        <div>
            <button 
                onClick={() => navigate(-1)} 
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    marginBottom: 'var(--space-md)'
                }}
            >
                <span>&larr;</span> Back to Dashboard
            </button>

            <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <img 
                    src={`https://images.evetech.net/types/${commodity.id}/icon?size=64`} 
                    alt={commodity.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <div>
                    <h1 style={{ margin: 0 }}>{commodity.name} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>({commodity.tier})</span></h1>
                    <p className="text-muted" style={{ margin: 0 }}>Commodity Details & Production Chain</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                {/* Stats Panel */}
                <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-xs)' }}>Properties</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                        <span className="text-muted">Type ID</span>
                        <span>{commodity.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                        <span className="text-muted">Volume</span>
                        <span>{volume} m³</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                        <span className="text-muted">Base Output Yield</span>
                        <span>{commodity.outputYield} units</span>
                    </div>
                </div>

                {/* Market Panel */}
                <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-xs)' }}>
                        Market Data <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({selectedHub.name})</span>
                    </h3>
                    
                    {priceData.loading ? (
                        <div className="text-muted">Loading live market data...</div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <span className="text-muted">Lowest Sell Order</span>
                                <span className="text-primary">{formatISK(priceData.sellPrice)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <span className="text-muted">Highest Buy Order</span>
                                <span style={{ color: 'var(--color-success)' }}>{formatISK(priceData.buyPrice)}</span>
                            </div>
                            {commodity.inputs.length > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                        <span className="text-muted">Total Input Cost (Sell)</span>
                                        <span className="text-danger">{formatISK(priceData.inputCost)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                        <span className="text-muted">Est. Profit (Sell - Cost)</span>
                                        <span style={{ color: priceData.profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                                            {formatISK(priceData.profit)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', textAlign: 'center' }}>Production Flowchart</h3>
                {commodity.inputs.length > 0 ? (
                    <SchematicTree rootId={commodity.id} quantity={commodity.outputYield} onSummaryCalculated={setSummaryByTier} />
                ) : (
                    <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                        {commodity.tier === 'P0' ? (
                            <div>
                                <div style={{ marginBottom: 'var(--space-md)', fontSize: '1.1rem' }}>Raw Planetary Resource</div>
                                <div style={{ display: 'inline-block', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 'var(--space-sm)', color: 'var(--color-text-main)' }}>Extractable from Planets:</div>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {(RESOURCE_TO_PLANETS[commodity.id] || []).map(p => (
                                            <PlanetLabel key={p} planetName={p} size={20} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            "Raw Material (No production chain available)"
                        )}
                    </div>
                )}
            </div>

            {commodity.tier !== 'P0' && (
                <>
                    <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-lg)' }}>
                        <PlanetBreakdown targetId={commodity.id} hourlyYield={commodity.outputYield} />
                    </div>
                    
                    {summaryByTier && (
                        <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-lg)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>Accounting Summary</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: 'var(--space-md)'
                            }}>
                                {['P4', 'P3', 'P2', 'P1', 'P0'].map(tier => {
                                    if (summaryByTier.sums[tier] === undefined) return null;
                                    const formatSummaryISK = (val) => new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 0 }).format(val) + ' ISK';
                                    
                                    return (
                                        <div key={tier} className="glass-panel" style={{
                                            width: '100%',
                                            padding: 'var(--space-md)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'rgba(20, 22, 30, 0.9)',
                                            border: `1px solid var(--color-tier-${tier.toLowerCase()})`,
                                        }}>
                                            <h4 style={{ margin: '0 0 var(--space-sm) 0', color: `var(--color-tier-${tier.toLowerCase()})`, borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                                                {tier} Accounting
                                            </h4>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                                                {Object.values(summaryByTier.items[tier] || {}).map(item => (
                                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        <span>{item.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}x {item.name}</span>
                                                        <span style={{ whiteSpace: 'nowrap', marginLeft: '8px' }}>{formatSummaryISK(item.totalValue)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                                <span style={{ color: `var(--color-tier-${tier.toLowerCase()})`, fontWeight: 'bold', fontSize: '0.9rem' }}>{tier} Total:</span>
                                                <span style={{ color: 'var(--color-text-main)', fontFamily: 'monospace', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                                    {formatSummaryISK(summaryByTier.sums[tier])}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Volume:</span>
                                                <span style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {(summaryByTier.volumes?.[tier] || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CommodityDetailPage;
