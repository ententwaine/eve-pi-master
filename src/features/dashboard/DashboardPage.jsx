import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities } from '../../data/pi_data';
import { getLowestSellOrder } from '../../services/esiApi';

const CommodityCard = ({ commodity, selectedHub }) => {
    const [priceData, setPriceData] = useState({ sellPrice: 0, inputCost: 0, profit: 0, loading: true });

    useEffect(() => {
        let isMounted = true;
        const fetchPrices = async () => {
            setPriceData(prev => ({ ...prev, loading: true }));
            
            try {
                // Fetch sell price for the item
                const sellPrice = await getLowestSellOrder(selectedHub.regionId, commodity.id, selectedHub.systemId);
                
                // Fetch sell prices for all inputs to calculate input cost
                let totalInputCost = 0;
                for (const input of commodity.inputs) {
                    const inputSell = await getLowestSellOrder(selectedHub.regionId, input.id, selectedHub.systemId);
                    totalInputCost += (inputSell * input.quantity);
                }

                // Adjust for output yield (e.g., if inputs produce 5 units, we divide input cost by 5 to get cost per 1 unit)
                const costPerUnit = commodity.outputYield > 0 ? (totalInputCost / commodity.outputYield) : 0;
                const profit = sellPrice - costPerUnit;

                if (isMounted) {
                    setPriceData({ sellPrice, inputCost: costPerUnit, profit, loading: false });
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

    return (
        <div className="glass-panel" style={{
            minWidth: '300px',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            position: 'relative'
        }}>
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
            
            {priceData.loading ? (
                <div className="text-muted" style={{ padding: 'var(--space-md) 0' }}>Loading market data...</div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Unit Sell Price:</span>
                        <span>{formatISK(priceData.sellPrice)}</span>
                    </div>
                    
                    {commodity.inputs.length > 0 ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-muted">Input Cost (per unit):</span>
                                <span className="text-danger">{formatISK(priceData.inputCost)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                                <span className="text-muted">Est. Profit:</span>
                                <span style={{ color: priceData.profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                                    {formatISK(priceData.profit)}
                                </span>
                            </div>
                            <div style={{ marginTop: 'var(--space-sm)' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Inputs per cycle:</span>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                                    {commodity.inputs.map(i => {
                                        const inputName = commodities.find(c => c.id === i.id)?.name;
                                        return <div key={i.id}>- {i.quantity}x {inputName}</div>;
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-muted" style={{ fontStyle: 'italic', marginTop: 'var(--space-sm)' }}>
                            Raw material (No inputs required)
                        </div>
                    )}
                </>
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
                        color: 'var(--color-text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)'
                    }}
                >
                    <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>i</span>
                    <span>Used In</span>
                </div>
                <div className="used-in-tooltip" style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: '8px',
                    width: '200px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-sm)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    display: 'none',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-main)' }}>Used to craft:</div>
                    {commodities.filter(c => c.inputs.some(i => i.id === commodity.id)).length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--color-text-muted)' }}>
                            {commodities.filter(c => c.inputs.some(i => i.id === commodity.id)).map(c => (
                                <li key={c.id}>{c.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Nothing (Top Tier)</div>
                    )}
                </div>
            </div>
            
            <style>{`
                .used-in-container:hover .used-in-tooltip {
                    display: block !important;
                }
                .used-in-icon:hover {
                    color: var(--color-primary) !important;
                    border-color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
};

const TierSlider = ({ tier, selectedHub }) => {
    const tierCommodities = commodities.filter(c => c.tier === tier);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-xs)' }}>
                <h2 style={{ margin: 0 }}>{tier} Commodities</h2>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button 
                        onClick={() => scroll('left')}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--color-border)', 
                            color: 'var(--color-text-main)', 
                            padding: 'var(--space-xs) var(--space-md)', 
                            borderRadius: 'var(--radius-sm)', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(0, 217, 247, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        &lt;
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--color-border)', 
                            color: 'var(--color-text-main)', 
                            padding: 'var(--space-xs) var(--space-md)', 
                            borderRadius: 'var(--radius-sm)', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(0, 217, 247, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        &gt;
                    </button>
                </div>
            </div>
            <div className="horizontal-scroll" ref={scrollRef}>
                {tierCommodities.map(c => (
                    <CommodityCard key={c.id} commodity={c} selectedHub={selectedHub} />
                ))}
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { selectedHub } = useTradeHub();

    return (
        <div>
            <header style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontWeight: 300 }}>Market Dashboard</h1>
                <p className="text-muted">Live profitability overview from {selectedHub.name}</p>
            </header>

            <TierSlider tier="P4" selectedHub={selectedHub} />
            <TierSlider tier="P3" selectedHub={selectedHub} />
            <TierSlider tier="P2" selectedHub={selectedHub} />
            <TierSlider tier="P1" selectedHub={selectedHub} />
            <TierSlider tier="P0" selectedHub={selectedHub} />
        </div>
    );
};

export default DashboardPage;
