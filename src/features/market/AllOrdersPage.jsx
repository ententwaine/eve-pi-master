import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMarketOrders, fetchMarketHistory } from '../../services/esiApi';
import { commodities } from '../../data/pi_data';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import './AllOrdersPage.css';

// Helper to format ISK
const formatIsk = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' ISK';
};

const formatVolume = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val.toLocaleString();
};

const AllOrdersPage = () => {
    const { regionId, typeId } = useParams();
    const [viewMode, setViewMode] = useState('orders'); // 'orders', 'history_chart', 'history_list'
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const commodity = useMemo(() => commodities.find(c => c.id === parseInt(typeId)), [typeId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [ordersData, historyData] = await Promise.all([
                fetchMarketOrders(regionId, typeId, 'all'),
                fetchMarketHistory(regionId, typeId)
            ]);
            setOrders(ordersData || []);
            setHistory(historyData || []);
            setLoading(false);
        };
        if (regionId && typeId) {
            loadData();
        }
    }, [regionId, typeId]);

    const sellOrders = useMemo(() => {
        return orders.filter(o => !o.is_buy_order).sort((a, b) => a.price - b.price);
    }, [orders]);

    const buyOrders = useMemo(() => {
        return orders.filter(o => o.is_buy_order).sort((a, b) => b.price - a.price);
    }, [orders]);

    const chartData = useMemo(() => {
        return history.slice(-30).map(d => ({
            date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: d.date,
            average: d.average,
            low: d.lowest,
            high: d.highest,
            volume: d.volume,
            orderCount: d.order_count
        }));
    }, [history]);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel" style={{ padding: '10px', border: '1px solid var(--color-primary)' }}>
                    <p className="text-primary" style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: 0, color: '#00d9f7' }}>Avg Price: {formatIsk(payload.find(p => p.dataKey === 'average')?.value || 0)}</p>
                    <p style={{ margin: 0, color: '#8884d8' }}>Volume: {(payload.find(p => p.dataKey === 'volume')?.value || 0).toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    if (!commodity) return <div className="text-danger p-4">Commodity not found.</div>;

    return (
        <div className="orders-container fade-in">
            <Link to="/market" className="text-muted" style={{ display: 'inline-block', marginBottom: 'var(--space-md)', textDecoration: 'none' }}>
                &larr; Back to Market
            </Link>

            <div className="orders-header">
                <div className="orders-header-info">
                    <img src={`https://images.evetech.net/types/${typeId}/icon?size=64`} alt={commodity.name} className="orders-item-icon" />
                    <div>
                        <h1 className="orders-title">{commodity.name}</h1>
                        <p className="orders-subtitle">Region ID: {regionId}</p>
                    </div>
                </div>
                
                <div className="view-toggle">
                    <button className={viewMode === 'orders' ? 'active' : ''} onClick={() => setViewMode('orders')}>
                        Active Orders
                    </button>
                    <button className={viewMode === 'history_chart' ? 'active' : ''} onClick={() => setViewMode('history_chart')}>
                        History Chart
                    </button>
                    <button className={viewMode === 'history_list' ? 'active' : ''} onClick={() => setViewMode('history_list')}>
                        History List
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="glass-panel text-center" style={{ padding: '4rem' }}>
                    <div className="spinner" style={{ margin: '0 auto var(--space-md) auto' }}></div>
                    <div className="text-muted">Fetching market telemetry...</div>
                </div>
            ) : (
                <>
                    {viewMode === 'orders' && (
                        <div className="orders-grid">
                            <div className="orders-table-card">
                                <h2>
                                    <span className="text-danger">Sell Orders</span>
                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>{sellOrders.length} orders</span>
                                </h2>
                                <div className="table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Expires</th>
                                                <th>Issued</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sellOrders.map(o => (
                                                <tr key={o.order_id}>
                                                    <td className="text-danger" style={{ fontWeight: 'bold' }}>{formatIsk(o.price)}</td>
                                                    <td>{o.volume_remain.toLocaleString()} / {o.volume_total.toLocaleString()}</td>
                                                    <td>{o.duration}d</td>
                                                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(o.issued).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {sellOrders.length === 0 && (
                                                <tr><td colSpan="4" className="text-center text-muted">No sell orders found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="orders-table-card">
                                <h2>
                                    <span className="text-success">Buy Orders</span>
                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>{buyOrders.length} orders</span>
                                </h2>
                                <div className="table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Expires</th>
                                                <th>Issued</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {buyOrders.map(o => (
                                                <tr key={o.order_id}>
                                                    <td className="text-success" style={{ fontWeight: 'bold' }}>{formatIsk(o.price)}</td>
                                                    <td>{o.volume_remain.toLocaleString()} / {o.volume_total.toLocaleString()}</td>
                                                    <td>{o.duration}d</td>
                                                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(o.issued).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {buyOrders.length === 0 && (
                                                <tr><td colSpan="4" className="text-center text-muted">No buy orders found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'history_chart' && (
                        <div className="chart-card">
                            <h2>30-Day Market Trends</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)' }} />
                                    <YAxis yAxisId="left" stroke="var(--color-primary)" tickFormatter={(v) => v.toLocaleString()} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" tickFormatter={formatVolume} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar yAxisId="right" dataKey="volume" fill="#8884d8" name="Trade Volume" opacity={0.5} />
                                    <Line yAxisId="left" type="monotone" dataKey="average" stroke="var(--color-primary)" strokeWidth={3} name="Average Price" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {viewMode === 'history_list' && (
                        <div className="orders-table-card" style={{ height: 'auto', maxHeight: '800px' }}>
                            <h2>Historical Data (List)</h2>
                            <div className="table-wrapper">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Average Price</th>
                                            <th>High</th>
                                            <th>Low</th>
                                            <th>Volume</th>
                                            <th>Orders</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...history].reverse().map((h, idx) => (
                                            <tr key={idx}>
                                                <td>{new Date(h.date).toLocaleDateString()}</td>
                                                <td className="text-primary">{formatIsk(h.average)}</td>
                                                <td className="text-danger">{formatIsk(h.highest)}</td>
                                                <td className="text-success">{formatIsk(h.lowest)}</td>
                                                <td>{h.volume.toLocaleString()}</td>
                                                <td>{h.order_count.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AllOrdersPage;
