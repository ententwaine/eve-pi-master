import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTradeHub } from '../context/TradeHubContext';

const TopNav = () => {
    const { selectedHub, hubs, changeHub } = useTradeHub();

    return (
        <header className="topnav">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 300, color: 'var(--color-primary)' }}>
                    EVE <span className="text-main" style={{ fontWeight: 'bold' }}>Pi Master</span>
                </h1>
            </div>

            <nav className="topnav-links">
                <NavLink to="/" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                </NavLink>

                <div className="dropdown">
                    <span className="topnav-link" style={{ cursor: 'pointer' }}>Planetary Materials ▼</span>
                    <div className="dropdown-content">
                        <NavLink to="/materials/P0">Raw Materials (P0)</NavLink>
                        <NavLink to="/materials/P1">Processed (P1)</NavLink>
                        <NavLink to="/materials/P2">Refined (P2)</NavLink>
                        <NavLink to="/materials/P3">Specialized (P3)</NavLink>
                        <NavLink to="/materials/P4">Advanced (P4)</NavLink>
                    </div>
                </div>

                <NavLink to="/market" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
                    Pi Market
                </NavLink>
                <NavLink to="/planner" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
                    Planner
                </NavLink>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>TRADE HUB</span>
                <select 
                    className="hub-selector"
                    value={selectedHub.name}
                    onChange={(e) => changeHub(e.target.value)}
                >
                    {hubs.map(hub => (
                        <option key={hub.name} value={hub.name}>{hub.name}</option>
                    ))}
                </select>
            </div>
        </header>
    );
};

export default TopNav;
