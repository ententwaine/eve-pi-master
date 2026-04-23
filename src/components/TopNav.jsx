import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTradeHub } from '../context/TradeHubContext';
import { useAuth } from '../context/AuthContext';

const TopNav = () => {
    const { selectedHub, hubs, changeHub } = useTradeHub();
    const { user, login, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
    const [isPlannersOpen, setIsPlannersOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMaterialsOpen(false);
        setIsPlannersOpen(false);
    };

    return (
        <header className="topnav">
            <div className="topnav-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Link to="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
                        <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 300, color: 'var(--color-primary)' }}>
                            EVE <span className="text-main" style={{ fontWeight: 'bold' }}>Pi Master</span>
                        </h1>
                    </Link>
                </div>
                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Navigation">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {isMobileMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>
            </div>

            <div className={`topnav-content ${isMobileMenuOpen ? 'open' : ''}`}>
                <nav className="topnav-links">
                    <NavLink to="/dashboard" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        Dashboard
                    </NavLink>

                    <div className="dropdown">
                        <span className="topnav-link" style={{ cursor: 'pointer' }} onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}>Planetary Materials ▼</span>
                        <div className={`dropdown-content ${isMaterialsOpen ? 'mobile-open' : ''}`}>
                            <NavLink to="/materials/P0" onClick={closeMenu}>Raw Materials (P0)</NavLink>
                            <NavLink to="/materials/P1" onClick={closeMenu}>Processed (P1)</NavLink>
                            <NavLink to="/materials/P2" onClick={closeMenu}>Refined (P2)</NavLink>
                            <NavLink to="/materials/P3" onClick={closeMenu}>Specialized (P3)</NavLink>
                            <NavLink to="/materials/P4" onClick={closeMenu}>Advanced (P4)</NavLink>
                        </div>
                    </div>

                    <NavLink to="/market" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        Pi Market
                    </NavLink>

                    <div className="dropdown">
                        <span className="topnav-link" style={{ cursor: 'pointer' }} onClick={() => setIsPlannersOpen(!isPlannersOpen)}>Planners ▼</span>
                        <div className={`dropdown-content ${isPlannersOpen ? 'mobile-open' : ''}`}>
                            <NavLink to="/planner" onClick={closeMenu}>PI Planner</NavLink>
                            <NavLink to="/virtual-planet" onClick={closeMenu}>Virtual Planet</NavLink>
                            <NavLink to="/production-vs" onClick={closeMenu}>Production Vs</NavLink>
                        </div>
                    </div>
                    <NavLink to="/command-center" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        Command Center
                    </NavLink>
                    <NavLink to="/planets" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        Planets
                    </NavLink>
                    <NavLink to="/consultant" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        PI Consultant
                    </NavLink>
                </nav>

                <div className="topnav-controls">
                    <div className="hub-selector-container">
                        <span className="text-muted" style={{ fontSize: '0.8rem', marginRight: 'var(--space-sm)' }}>Trade Hub</span>
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

                    <div className="auth-container">
                        {user ? (
                            <div className="user-profile dropdown">
                                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                                    <img 
                                        src={`https://images.evetech.net/characters/${user.id}/portrait?size=32`} 
                                        alt={user.name} 
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-border)' }} 
                                    />
                                    <span className="text-main" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.name} ▼</span>
                                </div>
                                <div className="dropdown-content" style={{ right: 0, left: 'auto', minWidth: '120px' }}>
                                    <span className="topnav-link text-danger" style={{ cursor: 'pointer', padding: 'var(--space-md)' }} onClick={logout}>
                                        Log Out
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <button className="btn btn-primary" style={{ padding: 'var(--space-xs) var(--space-sm)', fontSize: '0.85rem' }} onClick={login}>
                                Log in with EVE Online
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
