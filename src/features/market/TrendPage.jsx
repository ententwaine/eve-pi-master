import React, { useState } from 'react';
import { useTradeHub } from '../../context/TradeHubContext';
import { commodities } from '../../data/pi_data';
import TierTrendSection from './TierTrendSection';
import './TrendPage.css';

const TIMEFRAMES = [
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '4 Months', days: 120 },
    { label: '1 Year', days: 365 },
];

const TrendPage = () => {
    const { selectedHub } = useTradeHub();
    const [timeframe, setTimeframe] = useState(30); // Default to 1 Month
    const tiers = ['P0', 'P1', 'P2', 'P3', 'P4'];

    return (
        <div className="page-container">
            <header className="page-header">
                <h2>Pi Market Trends</h2>
                <p className="text-muted">
                    Track the historical profitability of planetary commodities in {selectedHub.name}.
                </p>
                <div className="timeframe-selector" style={{ marginTop: 'var(--space-md)' }}>
                    <span style={{ marginRight: 'var(--space-sm)' }}>Timeframe:</span>
                    <select
                        className="select-input"
                        value={timeframe}
                        onChange={(e) => setTimeframe(Number(e.target.value))}
                    >
                        {TIMEFRAMES.map((tf) => (
                            <option key={tf.days} value={tf.days}>
                                {tf.label}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="tier-sections" style={{ marginTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {tiers.map((tier) => {
                    const tierCommodities = commodities.filter((c) => c.tier === tier);
                    return (
                        <TierTrendSection
                            key={tier}
                            tier={tier}
                            commodities={tierCommodities}
                            regionId={selectedHub.regionId}
                            timeframe={timeframe}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TrendPage;
