import React, { useState, useEffect, useMemo } from 'react';
import { fetchMarketHistory } from '../../services/esiApi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const getColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 70%, 60%)`);
    }
    return colors;
};

const TierTrendSection = ({ tier, commodities, regionId, timeframe }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [error, setError] = useState(null);

    const colors = useMemo(() => getColors(commodities.length), [commodities.length]);

    useEffect(() => {
        if (isExpanded && !hasFetched && regionId) {
            const fetchData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = await Promise.all(
                        commodities.map(async (c) => {
                            const history = await fetchMarketHistory(regionId, c.id);
                            return { name: c.name, history: history || [] };
                        })
                    );

                    const dateMap = new Map();
                    allData.forEach((result) => {
                        result.history.forEach((day) => {
                            if (!dateMap.has(day.date)) {
                                dateMap.set(day.date, { date: day.date });
                            }
                            dateMap.get(day.date)[result.name] = day.average;
                        });
                    });

                    const mergedData = Array.from(dateMap.values()).sort(
                        (a, b) => new Date(a.date) - new Date(b.date)
                    );
                    setHistoryData(mergedData);
                    setHasFetched(true);
                } catch (err) {
                    setError('Failed to fetch market history.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isExpanded, hasFetched, regionId, commodities]);

    // Reset fetch state if region changes
    useEffect(() => {
        setHasFetched(false);
        setHistoryData([]);
        if (isExpanded) {
            // It will trigger the fetch effect again because hasFetched is false
        }
    }, [regionId]);

    const displayData = useMemo(() => {
        if (!historyData || historyData.length === 0) return [];
        return historyData.slice(-timeframe);
    }, [historyData, timeframe]);

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const formatYAxis = (tickItem) => {
        if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
        if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(1)}k`;
        return tickItem;
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
                className="accordion-header"
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-surface)',
                    borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 style={{ margin: 0 }}>{tier} Commodities</h3>
                <span style={{ fontSize: '1.2rem' }}>{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
                <div className="accordion-content" style={{ padding: 'var(--space-lg)' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="text-danger">{error}</div>
                    ) : displayData.length > 0 ? (
                        <div style={{ height: '400px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={displayData}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatXAxis}
                                        stroke="var(--color-text-muted)"
                                        tick={{ fill: 'var(--color-text-muted)' }}
                                    />
                                    <YAxis
                                        tickFormatter={formatYAxis}
                                        stroke="var(--color-text-muted)"
                                        tick={{ fill: 'var(--color-text-muted)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        formatter={(value) => [new Intl.NumberFormat().format(value.toFixed(2)) + ' ISK', '']}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    {commodities.map((c, index) => (
                                        <Line
                                            key={c.id}
                                            type="monotone"
                                            dataKey={c.name}
                                            stroke={colors[index]}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                            isAnimationActive={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-muted text-center">No history data available for this timeframe.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TierTrendSection;
