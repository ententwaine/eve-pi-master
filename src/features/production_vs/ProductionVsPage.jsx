import React, { useState, useEffect } from 'react';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities } from '../../data/pi_data';
import { getLowestSellOrder, getHighestBuyOrder } from '../../services/esiApi';
import './ProductionVsPage.css';

const ProductionVsPage = () => {
    const { selectedHub } = useTradeHub();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCommodities, setSelectedCommodities] = useState([]); // Array of IDs
    const [marketData, setMarketData] = useState({}); // { [id]: { sell: number, cost: number, loading: boolean } }

    const searchResults = commodities.filter(c => 
        c.tier !== 'P0' && // P0 cannot be produced
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedCommodities.includes(c.id)
    ).slice(0, 5); // Limit results

    const addCommodity = (id) => {
        if (!selectedCommodities.includes(id)) {
            setSelectedCommodities(prev => [...prev, id]);
            setSearchTerm('');
            fetchMarketDataForCommodity(id);
        }
    };

    const removeCommodity = (id) => {
        setSelectedCommodities(prev => prev.filter(c => c !== id));
    };

    const fetchMarketDataForCommodity = async (id) => {
        const commodity = commodities.find(c => c.id === id);
        if (!commodity) return;

        setMarketData(prev => ({
            ...prev,
            [id]: { ...prev[id], loading: true }
        }));

        try {
            // 1. Get Sell Price of the product
            const sellPrice = await getLowestSellOrder(selectedHub.regionId, id, selectedHub.systemId);

            // 2. Get Buy Price of all inputs
            let totalCost = 0;
            const inputPromises = commodity.inputs.map(async (input) => {
                const buyPrice = await getHighestBuyOrder(selectedHub.regionId, input.id, selectedHub.systemId);
                return buyPrice * input.quantity;
            });

            const inputCosts = await Promise.all(inputPromises);
            totalCost = inputCosts.reduce((sum, cost) => sum + cost, 0);

            // The cost is for producing `outputYield` amount of items.
            // So cost PER UNIT is totalCost / outputYield
            const costPerUnit = totalCost / commodity.outputYield;

            setMarketData(prev => ({
                ...prev,
                [id]: { sell: sellPrice, cost: costPerUnit, loading: false }
            }));
        } catch (e) {
            console.error("Error fetching market data for", id, e);
            setMarketData(prev => ({
                ...prev,
                [id]: { ...prev[id], loading: false, error: true }
            }));
        }
    };

    // Refetch all if hub changes
    useEffect(() => {
        selectedCommodities.forEach(id => fetchMarketDataForCommodity(id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHub]);

    const formatISK = (value) => {
        if (!value || isNaN(value)) return '-';
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(value);
    };

    // Helper: P1 factories run every 30m (48 cycles/day). Output is 20 per cycle = 960/day
    // P2 factories run every 60m (24 cycles/day). Output is 5 per cycle = 120/day
    // P3 factories run every 60m (24 cycles/day). Output is 3 per cycle = 72/day
    // P4 factories run every 60m (24 cycles/day). Output is 1 per cycle = 24/day
    const getUnitsPerDay = (tier) => {
        switch(tier) {
            case 'P1': return 960;
            case 'P2': return 120;
            case 'P3': return 72;
            case 'P4': return 24;
            default: return 0;
        }
    };

    return (
        <div className="production-vs-container fade-in">
            <header className="production-vs-header">
                <h1>Production VS</h1>
                <p>Compare the profitability of manufacturing different Planetary Interaction commodities in {selectedHub.name}.</p>
            </header>

            <div className="commodity-selector-bar">
                <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                        type="text" 
                        placeholder="Search for a commodity to compare (e.g., Robotics)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)', zIndex: 10, marginTop: 'var(--space-sm)'
                        }}>
                            {searchResults.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => addCommodity(c.id)}
                                    style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <img src={`https://images.evetech.net/types/${c.id}/icon?size=32`} alt={c.name} style={{ width: 24, borderRadius: 4 }} />
                                    <span>{c.name}</span>
                                    <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>{c.tier}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedCommodities.length > 0 ? (
                <div className="comparison-card">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Commodity</th>
                                <th>Tier</th>
                                <th>Sell Price (Revenue)</th>
                                <th>Buy Price (Input Cost)</th>
                                <th>Net Profit / Unit</th>
                                <th>Margin</th>
                                <th>Est. Profit / Day</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCommodities.map(id => {
                                const commodity = commodities.find(c => c.id === id);
                                const data = marketData[id] || { loading: true };
                                
                                const netProfit = data.sell - data.cost;
                                const margin = (netProfit / data.cost) * 100;
                                const unitsPerDay = getUnitsPerDay(commodity.tier);
                                const profitPerDay = netProfit * unitsPerDay;

                                return (
                                    <tr key={id}>
                                        <td>
                                            <div className="commodity-cell">
                                                <img src={`https://images.evetech.net/types/${id}/icon?size=32`} alt={commodity.name} />
                                                <strong>{commodity.name}</strong>
                                            </div>
                                        </td>
                                        <td><span className="text-muted">{commodity.tier}</span></td>
                                        <td>{data.loading ? '...' : formatISK(data.sell)}</td>
                                        <td>{data.loading ? '...' : formatISK(data.cost)}</td>
                                        <td className={netProfit > 0 ? 'profit-positive' : 'profit-negative'}>
                                            {data.loading ? '...' : formatISK(netProfit)}
                                        </td>
                                        <td className={margin > 0 ? 'profit-positive' : 'profit-negative'}>
                                            {data.loading ? '...' : `${margin.toFixed(2)}%`}
                                        </td>
                                        <td className={profitPerDay > 0 ? 'profit-positive' : 'profit-negative'}>
                                            {data.loading ? '...' : formatISK(profitPerDay)}
                                        </td>
                                        <td>
                                            <button className="remove-btn" onClick={() => removeCommodity(id)}>✕</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)', background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                    Search and select commodities above to begin comparing their profitability.
                </div>
            )}
        </div>
    );
};

export default ProductionVsPage;
