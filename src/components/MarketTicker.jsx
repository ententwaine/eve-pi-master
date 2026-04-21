import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTradeHub } from '../context/TradeHubContext';
import { commodities } from '../data/pi_data';
import { getLowestSellOrder } from '../services/esiApi';

const MarketTicker = () => {
    const { selectedHub } = useTradeHub();
    const [tickerItems, setTickerItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadPrices = async () => {
            setLoading(true);
            try {
                // Fetch all prices
                const pricePromises = commodities.map(async (comm) => {
                    const price = await getLowestSellOrder(selectedHub.regionId, comm.id, selectedHub.systemId);
                    return { ...comm, price };
                });

                const results = await Promise.all(pricePromises);

                if (!isMounted) return;

                // Group by tier
                const grouped = results.reduce((acc, curr) => {
                    if (!acc[curr.tier]) acc[curr.tier] = [];
                    acc[curr.tier].push(curr);
                    return acc;
                }, {});

                // Sort each tier and pick top 6
                const topItems = [];
                const tiers = ['P0', 'P1', 'P2', 'P3', 'P4'];
                for (const tier of tiers) {
                    if (grouped[tier]) {
                        const sorted = grouped[tier].sort((a, b) => b.price - a.price).slice(0, 6);
                        topItems.push(...sorted);
                    }
                }

                setTickerItems(topItems);
            } catch (error) {
                console.error("Failed to load ticker items:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (selectedHub) {
            loadPrices();
        }

        return () => { isMounted = false; };
    }, [selectedHub]);

    if (loading) {
        return (
            <div className="market-ticker-container loading">
                <span className="text-muted text-sm">Loading live market data...</span>
            </div>
        );
    }

    if (tickerItems.length === 0) return null;

    return (
        <div className="market-ticker-container">
            <div className="ticker-track">
                {/* Render items multiple times to create a seamless loop effect */}
                {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
                    <Link to={`/commodity/${item.id}`} key={`${item.id}-${index}`} className="ticker-item glass-panel">
                        <img 
                            src={`https://images.evetech.net/types/${item.id}/icon?size=32`} 
                            alt={item.name} 
                            className="ticker-icon" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="ticker-info">
                            <span className="ticker-name">{item.name} <span className="text-muted">({item.tier})</span></span>
                            <div className="ticker-price-row">
                                <span className="ticker-price text-accent">
                                    {item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ISK
                                </span>
                                <span className="ticker-trend">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 19V5M5 12l7-7 7 7"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MarketTicker;
