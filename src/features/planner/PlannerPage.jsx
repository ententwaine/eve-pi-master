import React, { useState, useEffect } from 'react';
import { useTradeHub } from '../../context/TradeHubContext';
import { mockSystems, extractablePlanetsMap } from '../../data/system_mock_data';
import { commodities, RESOURCE_TO_PLANETS } from '../../data/pi_data';
import SchematicTree from '../pi/components/SchematicTree';
import PlanetBreakdown from '../pi/components/PlanetBreakdown';
import PlanetLabel from '../../components/PlanetLabel';
import { getLowestSellOrder, getHighestBuyOrder } from '../../services/esiApi';

const PlannerPage = () => {
    const { selectedHub } = useTradeHub();
    const [systemSearch, setSystemSearch] = useState('');
    const [selectedSystem, setSelectedSystem] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productPrices, setProductPrices] = useState({});
    const [targetQuantities, setTargetQuantities] = useState({});

    const filteredSystems = mockSystems.filter(s => s.name.toLowerCase().includes(systemSearch.toLowerCase()));
    
    // Auto-select system if exactly matched
    useEffect(() => {
        const exactMatch = mockSystems.find(s => s.name.toLowerCase() === systemSearch.toLowerCase());
        if (exactMatch && (!selectedSystem || selectedSystem.name !== exactMatch.name)) {
            setSelectedSystem(exactMatch);
        } else if (systemSearch === '') {
            setSelectedSystem(null);
        }
    }, [systemSearch]);

    // Fetch prices for selected products
    useEffect(() => {
        let isMounted = true;
        
        selectedProducts.forEach(product => {
            if (!productPrices[product.id]) {
                const fetchPrices = async () => {
                    try {
                        setProductPrices(prev => ({
                            ...prev,
                            [product.id]: { loading: true }
                        }));
                        
                        const sellPrice = await getLowestSellOrder(selectedHub.regionId, product.id, selectedHub.systemId);
                        const buyPrice = await getHighestBuyOrder(selectedHub.regionId, product.id, selectedHub.systemId);
                        
                        let totalInputCost = 0;
                        for (const input of product.inputs) {
                            const inputSell = await getLowestSellOrder(selectedHub.regionId, input.id, selectedHub.systemId);
                            totalInputCost += (inputSell * input.quantity);
                        }
                        const costPerUnit = product.outputYield > 0 ? (totalInputCost / product.outputYield) : 0;
                        
                        if (isMounted) {
                            setProductPrices(prev => ({
                                ...prev,
                                [product.id]: {
                                    sellPrice,
                                    buyPrice,
                                    costPerUnit,
                                    loading: false
                                }
                            }));
                        }
                    } catch (e) {
                        if (isMounted) {
                            setProductPrices(prev => ({
                                ...prev,
                                [product.id]: { loading: false, error: true }
                            }));
                        }
                    }
                };
                fetchPrices();
            }
        });
        
        return () => { isMounted = false; };
    }, [selectedProducts, selectedHub]);

    // Calculate possible P0 commodities based on system planets
    const availablePlanets = selectedSystem ? selectedSystem.planets : [];
    const availablePlanetTypes = Array.from(new Set(availablePlanets.map(p => p.type)));
    
    const possibleP0Names = Object.keys(extractablePlanetsMap).filter(p0 => {
        const requiredPlanets = extractablePlanetsMap[p0];
        return requiredPlanets.some(rp => availablePlanetTypes.includes(rp));
    });
    
    // We can say any P1-P4 that uses these P0s is "possible", but for simplicity let's just list the P0s
    // Or allow the user to select ANY product and they can see if they have the P0s.
    
    const filteredProducts = commodities.filter(c => c.name.toLowerCase().includes(productSearch.toLowerCase()) && c.tier !== 'P0');

    const handleAddProduct = (product) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
            setTargetQuantities(prev => ({ ...prev, [product.id]: 1 }));
        }
        setProductSearch('');
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
        setTargetQuantities(prev => {
            const newQ = { ...prev };
            delete newQ[productId];
            return newQ;
        });
    };

    const handleQuantityChange = (productId, qty) => {
        setTargetQuantities(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
    };

    return (
        <div>
            <header style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontWeight: 300 }}>Production Planner</h1>
                <p className="text-muted">Plan your planetary interaction chains and verify profitability at {selectedHub.name}</p>
            </header>

            <div className="responsive-columns">
                {/* Left Column - System Selection */}
                <div className="glass-panel" style={{ flex: '1', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
                    <h3 className="text-primary" style={{ marginBottom: 'var(--space-md)' }}>1. Operating System</h3>
                    
                    <input
                        type="text"
                        placeholder="Type system name (e.g. Jita)"
                        value={systemSearch}
                        onChange={(e) => setSystemSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--color-text-main)',
                            outline: 'none',
                            marginBottom: 'var(--space-sm)'
                        }}
                    />
                    
                    {!selectedSystem && systemSearch.length > 0 && (
                        <div style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: '150px', overflowY: 'auto' }}>
                            {filteredSystems.map(s => (
                                <div 
                                    key={s.name} 
                                    onClick={() => { setSystemSearch(s.name); setSelectedSystem(s); }}
                                    style={{ padding: 'var(--space-sm)', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                                >
                                    {s.name} ({s.security.toFixed(1)})
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedSystem && (
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <h4 className="text-muted">Available Planets</h4>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                                {selectedSystem.planets.map(p => (
                                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                                        <PlanetLabel planetName={p.type} size={24} style={{ background: 'transparent', border: 'none', padding: 0 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-muted" style={{ marginTop: 'var(--space-lg)' }}>Extractable Resources (P0)</h4>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                                {possibleP0Names.map(p0 => (
                                    <span key={p0} style={{ fontSize: '0.8rem', background: 'rgba(0, 217, 247, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {p0}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Product Selection */}
                <div className="glass-panel" style={{ flex: '1', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
                    <h3 className="text-primary" style={{ marginBottom: 'var(--space-md)' }}>2. Target Products</h3>
                    
                    <input
                        type="text"
                        placeholder="Add product to plan (e.g. Broadcast Node)"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--color-text-main)',
                            outline: 'none',
                            marginBottom: 'var(--space-sm)'
                        }}
                    />

                    {productSearch.length > 0 && (
                        <div style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: '150px', overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
                            {filteredProducts.slice(0, 10).map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => handleAddProduct(c)}
                                    style={{ padding: 'var(--space-sm)', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                                >
                                    {c.name} <span className="text-muted">({c.tier})</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {selectedProducts.map(p => {
                            const prices = productPrices[p.id];
                            return (
                                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-sm)', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{p.name} <span className="text-muted" style={{ fontWeight: 'normal' }}>({p.tier})</span></span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Target Qty:</span>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={targetQuantities[p.id] || 1} 
                                                    onChange={(e) => handleQuantityChange(p.id, Number(e.target.value))}
                                                    style={{
                                                        width: '70px',
                                                        padding: '2px 8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid var(--color-border)',
                                                        color: 'var(--color-text-main)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveProduct(p.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xs)', fontSize: '0.9rem' }}>
                                        {prices?.loading ? (
                                            <span className="text-muted">Loading prices...</span>
                                        ) : prices?.error ? (
                                            <span className="text-danger">Error loading prices</span>
                                        ) : prices ? (
                                            <>
                                                <span><span className="text-muted">Sell:</span> {new Intl.NumberFormat('en-US').format(prices.sellPrice)} ISK</span>
                                                <span><span className="text-muted">Buy:</span> <span className="text-success">{new Intl.NumberFormat('en-US').format(prices.buyPrice)} ISK</span></span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Estimated Production Summary Table */}
            {selectedProducts.length > 0 && (
                <div className="glass-panel" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 300 }}>Estimated Production Summary</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                                    <th style={{ padding: 'var(--space-sm)' }}>Product</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Target Qty</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Est. Revenue (Sell)</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Est. Cost</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Est. Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let totalRevenue = 0;
                                    let totalCost = 0;
                                    let totalProfit = 0;
                                    
                                    const rows = selectedProducts.map(p => {
                                        const prices = productPrices[p.id];
                                        if (!prices || prices.loading) return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: 'var(--space-sm)' }}>{p.name}</td>
                                                <td colSpan={4} style={{ padding: 'var(--space-sm)', color: 'var(--color-text-muted)' }}>Loading data...</td>
                                            </tr>
                                        );
                                        
                                        const targetYield = targetQuantities[p.id] || 1;
                                        const dailyRevenue = targetYield * prices.sellPrice;
                                        const dailyCost = targetYield * prices.costPerUnit;
                                        const dailyProfit = dailyRevenue - dailyCost;
                                        
                                        totalRevenue += dailyRevenue;
                                        totalCost += dailyCost;
                                        totalProfit += dailyProfit;
                                        
                                        const formatISK = (val) => new Intl.NumberFormat('en-US').format(val) + ' ISK';
                                        
                                        return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: 'var(--space-sm)', fontWeight: 'bold' }}>{p.name}</td>
                                                <td style={{ padding: 'var(--space-sm)' }}>{targetYield.toLocaleString()} units</td>
                                                <td style={{ padding: 'var(--space-sm)', color: 'var(--color-primary)' }}>{formatISK(dailyRevenue)}</td>
                                                <td style={{ padding: 'var(--space-sm)', color: 'var(--color-danger)' }}>{formatISK(dailyCost)}</td>
                                                <td style={{ padding: 'var(--space-sm)', color: dailyProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                                                    {formatISK(dailyProfit)}
                                                </td>
                                            </tr>
                                        );
                                    });
                                    
                                    const formatTotal = (val) => new Intl.NumberFormat('en-US').format(val) + ' ISK';
                                    
                                    return (
                                        <>
                                            {rows}
                                            <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold', borderTop: '2px solid var(--color-border)' }}>
                                                <td colSpan={2} style={{ padding: 'var(--space-md)', textAlign: 'right' }}>GRAND TOTAL:</td>
                                                <td style={{ padding: 'var(--space-md)', color: 'var(--color-primary)' }}>{formatTotal(totalRevenue)}</td>
                                                <td style={{ padding: 'var(--space-md)', color: 'var(--color-danger)' }}>{formatTotal(totalCost)}</td>
                                                <td style={{ padding: 'var(--space-md)', color: totalProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontSize: '1.2rem' }}>
                                                    {formatTotal(totalProfit)}
                                                </td>
                                            </tr>
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Flowchart Renderings */}
            {selectedProducts.length > 0 && (
                <div style={{ marginTop: 'var(--space-xl)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 300 }}>Production Flowcharts</h2>
                    {selectedProducts.map(p => (
                        <ProductFlowchart key={p.id} product={p} selectedHub={selectedHub} targetQuantity={targetQuantities[p.id] || 1} />
                    ))}
                </div>
            )}

            {/* Global Bill of Materials */}
            {selectedProducts.length > 0 && (
                <div className="glass-panel" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 300 }}>Global Bill of Materials</h2>
                    <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                        Total raw materials required to fulfill your entire production plan from scratch.
                    </p>
                    
                    {(() => {
                        const globalBom = { P4: {}, P3: {}, P2: {}, P1: {}, P0: {} };
                        
                        const traverseGlobal = (itemId, qtyNeeded) => {
                            const item = commodities.find(c => c.id === itemId);
                            if (!item) return;
                            
                            const tier = item.tier;
                            if (globalBom[tier]) {
                                globalBom[tier][itemId] = (globalBom[tier][itemId] || 0) + qtyNeeded;
                            }
                            
                            if (tier === 'P0') return;
                            
                            const batches = qtyNeeded / (item.outputYield || 1);
                            for (const input of item.inputs) {
                                traverseGlobal(input.id, input.quantity * batches);
                            }
                        };
                        
                        selectedProducts.forEach(p => {
                            const batches = (targetQuantities[p.id] || 1) / (p.outputYield || 1);
                            for (const input of p.inputs) {
                                traverseGlobal(input.id, input.quantity * batches);
                            }
                        });

                        const tiers = ['P4', 'P3', 'P2', 'P1', 'P0'];
                        
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                                {tiers.map(tier => {
                                    const itemsInTier = Object.entries(globalBom[tier]);
                                    if (itemsInTier.length === 0) return null;
                                    
                                    return (
                                        <div key={tier} style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid var(--color-primary)` }}>
                                            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>{tier} Requirements</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
                                                {itemsInTier.map(([itemId, qty]) => {
                                                    const itemObj = commodities.find(c => c.id === Number(itemId));
                                                    const isP0 = tier === 'P0';
                                                    const planets = isP0 ? (RESOURCE_TO_PLANETS[itemId] || []) : [];
                                                    
                                                    return (
                                                        <div key={itemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                                <img src={`https://images.evetech.net/types/${itemId}/icon?size=32`} alt={itemObj?.name} style={{ width: 24, height: 24, borderRadius: 4 }} />
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontWeight: 'bold' }}>{itemObj?.name}</span>
                                                                    {isP0 && (
                                                                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                            {planets.map(p => <PlanetLabel key={p} planetName={p} size={12} style={{ padding: '1px 4px', fontSize: '0.7rem' }} />)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-accent" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                                {qty.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>units</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

const ProductFlowchart = ({ product, selectedHub, targetQuantity }) => {
    const [profitInfo, setProfitInfo] = useState({ sell: 0, cost: 0, loading: true });
    const [summaryByTier, setSummaryByTier] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchProfit = async () => {
            setProfitInfo({ sell: 0, cost: 0, loading: true });
            try {
                const sellPrice = await getLowestSellOrder(selectedHub.regionId, product.id, selectedHub.systemId);
                
                let totalInputCost = 0;
                for (const input of product.inputs) {
                    const inputSell = await getLowestSellOrder(selectedHub.regionId, input.id, selectedHub.systemId);
                    totalInputCost += (inputSell * input.quantity);
                }
                const costPerUnit = product.outputYield > 0 ? (totalInputCost / product.outputYield) : 0;

                if (isMounted) {
                    setProfitInfo({ sell: sellPrice, cost: costPerUnit, loading: false });
                }
            } catch(e) {
                if (isMounted) setProfitInfo(prev => ({ ...prev, loading: false }));
            }
        };
        fetchProfit();
        return () => { isMounted = false; };
    }, [product, selectedHub]);

    const formatISK = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', '') + ' ISK';
    const profit = profitInfo.sell - profitInfo.cost;

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
                <div>
                    <h3 className="text-primary">{product.name} Flowchart</h3>
                    <p className="text-muted">Target: {targetQuantity} Units</p>
                </div>
                
                <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.9rem' }}><span className="text-muted">Sell Price:</span> {profitInfo.loading ? '...' : formatISK(profitInfo.sell)}</div>
                    <div style={{ fontSize: '0.9rem' }}><span className="text-muted">Input Cost:</span> <span className="text-danger">{profitInfo.loading ? '...' : formatISK(profitInfo.cost)}</span></div>
                    <div style={{ fontSize: '1.1rem', marginTop: '4px', fontWeight: 'bold', color: profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                        <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>Profit:</span> {profitInfo.loading ? '...' : formatISK(profit)}
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(10, 12, 18, 0.6)', borderRadius: 'var(--radius-md)' }}>
                <SchematicTree rootId={product.id} quantity={targetQuantity} onSummaryCalculated={setSummaryByTier} />
            </div>

            {/* Added Planet Extraction Requirements below the flowchart as requested */}
            <div className="glass-panel" style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                <PlanetBreakdown targetId={product.id} hourlyYield={targetQuantity} />
            </div>

            {/* Accounting Summary section added below Planet Extraction Requirements */}
            {summaryByTier && (
                <div className="glass-panel" style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlannerPage;
