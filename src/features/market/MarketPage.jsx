import React, { useState, useEffect } from 'react';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities } from '../../data/pi_data';
import { getLowestSellOrder, getHighestBuyOrder } from '../../services/esiApi';

const MarketRow = ({ commodity, selectedHub }) => {
    const [marketData, setMarketData] = useState({ sell: 0, buy: 0, loading: true });

    useEffect(() => {
        let isMounted = true;
        const fetchMarket = async () => {
            setMarketData({ sell: 0, buy: 0, loading: true });
            try {
                const [sellPrice, buyPrice] = await Promise.all([
                    getLowestSellOrder(selectedHub.regionId, commodity.id, selectedHub.systemId),
                    getHighestBuyOrder(selectedHub.regionId, commodity.id, selectedHub.systemId)
                ]);
                
                if (isMounted) {
                    setMarketData({ sell: sellPrice, buy: buyPrice, loading: false });
                }
            } catch (e) {
                if (isMounted) setMarketData(prev => ({ ...prev, loading: false }));
            }
        };
        fetchMarket();
        return () => { isMounted = false; };
    }, [commodity.id, selectedHub]);

    const formatISK = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(value);
    };

    return (
        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <img 
                        src={`https://images.evetech.net/types/${commodity.id}/icon?size=32`} 
                        alt={commodity.name} 
                        style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                    />
                    <span className="text-primary">{commodity.name}</span>
                </div>
            </td>
            <td style={{ padding: 'var(--space-sm)' }}>
                <span style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                }}>{commodity.tier}</span>
            </td>
            <td style={{ padding: 'var(--space-sm)' }}>
                {marketData.loading ? '...' : formatISK(marketData.sell)}
            </td>
            <td style={{ padding: 'var(--space-sm)' }}>
                {marketData.loading ? '...' : formatISK(marketData.buy)}
            </td>
            <td style={{ padding: 'var(--space-sm)', textAlign: 'right' }}>
                <a 
                    href={`https://evetycoon.com/market/${commodity.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                    View Orders ↗
                </a>
            </td>
        </tr>
    );
};

const MarketPage = () => {
    const { selectedHub } = useTradeHub();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTier, setSelectedTier] = useState(null);

    const tiers = ['P0', 'P1', 'P2', 'P3', 'P4'];

    const filteredCommodities = commodities.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = selectedTier ? c.tier === selectedTier : true;
        
        if (searchTerm.length > 0) return matchesSearch;
        if (selectedTier) return matchesTier;
        
        return false; // Don't show all 143 by default
    });

    return (
        <div>
            <header style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontWeight: 300 }}>PI Market</h1>
                <p className="text-muted">Live market data from {selectedHub.name}</p>
            </header>

            <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder="Search commodity (e.g. Broadcast Node)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedTier(null);
                            }}
                            style={{
                                width: '100%',
                                padding: 'var(--space-sm) var(--space-md)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'var(--color-text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        {tiers.map(tier => (
                            <button
                                key={tier}
                                onClick={() => {
                                    setSelectedTier(tier === selectedTier ? null : tier);
                                    setSearchTerm('');
                                }}
                                style={{
                                    background: selectedTier === tier ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    color: selectedTier === tier ? 'var(--color-bg-base)' : 'var(--color-text-main)',
                                    border: '1px solid',
                                    borderColor: selectedTier === tier ? 'var(--color-primary)' : 'var(--color-border)',
                                    padding: 'var(--space-sm) var(--space-md)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredCommodities.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                                    <th style={{ padding: 'var(--space-sm)' }}>Commodity</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Tier</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Lowest Sell (ISK)</th>
                                    <th style={{ padding: 'var(--space-sm)' }}>Highest Buy (ISK)</th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCommodities.map(c => (
                                    <MarketRow key={c.id} commodity={c} selectedHub={selectedHub} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-xl) 0', fontStyle: 'italic' }}>
                        {searchTerm || selectedTier ? 'No commodities found.' : 'Search for a commodity or select a tier to view market data.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPage;
