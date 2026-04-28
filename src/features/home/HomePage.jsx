import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page-container">
            <div className="hero-section glass-panel">
                <h1 className="hero-title text-primary">Welcome to EVE Pi Master</h1>
                <p className="hero-subtitle text-muted">
                    The ultimate Planetary Interaction intelligence tool for EVE Online capsuleers. 
                    Optimize your production chains, monitor live market prices, and maximize your ISK efficiency.
                </p>
                <div className="hero-actions">
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    <Link to="/planner" className="btn btn-secondary">Open Planner</Link>
                </div>
            </div>

            <div className="quick-tools-section">
                <h2 className="section-title text-main">Quick Tools</h2>
                <div className="tools-grid">
                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">Pi Market</h3>
                            <span className="tool-icon">🏪</span>
                        </div>
                        <p className="tool-desc text-muted">Analyze live market data and find the most profitable commodities across trade hubs.</p>
                        <div className="tool-footer">
                            <Link to="/market" className="btn btn-secondary tool-btn">Open Market</Link>
                        </div>
                    </div>

                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">Virtual Planet</h3>
                            <span className="tool-icon">🌍</span>
                        </div>
                        <p className="tool-desc text-muted">Simulate planetary extractions and factory setups before committing in-game.</p>
                        <div className="tool-footer">
                            <span className="login-note text-accent">🔒 EVE Sign-in Required</span>
                            <Link to="/virtual-planet" className="btn btn-secondary tool-btn">Launch Simulator</Link>
                        </div>
                    </div>

                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">Production Vs</h3>
                            <span className="tool-icon">⚖️</span>
                        </div>
                        <p className="tool-desc text-muted">Compare two production chains side-by-side to determine the optimal path.</p>
                        <div className="tool-footer">
                            <Link to="/production-vs" className="btn btn-secondary tool-btn">Compare Chains</Link>
                        </div>
                    </div>

                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">Command Center</h3>
                            <span className="tool-icon">📡</span>
                        </div>
                        <p className="tool-desc text-muted">Manage all your planetary colonies from a single unified dashboard.</p>
                        <div className="tool-footer">
                            <span className="login-note text-accent">🔒 EVE Sign-in Required</span>
                            <Link to="/command-center" className="btn btn-secondary tool-btn">Access Command</Link>
                        </div>
                    </div>

                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">Planets</h3>
                            <span className="tool-icon">🪐</span>
                        </div>
                        <p className="tool-desc text-muted">View detailed information on all planet types and their extractable resources.</p>
                        <div className="tool-footer">
                            <Link to="/planets" className="btn btn-secondary tool-btn">View Planets</Link>
                        </div>
                    </div>

                    <div className="tool-card glass-panel">
                        <div className="tool-header">
                            <h3 className="tool-title text-primary">PI Consultant</h3>
                            <span className="tool-icon">🤖</span>
                        </div>
                        <p className="tool-desc text-muted">Get AI-driven advice on optimizing your planetary interaction setups and market trades.</p>
                        <div className="tool-footer">
                            <Link to="/consultant" className="btn btn-secondary tool-btn">Ask Consultant</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h2 className="section-title text-main">Core Features</h2>
                <div className="features-grid">
                    <div className="feature-card glass-panel">
                        <div className="feature-icon">📈</div>
                        <h3 className="feature-title text-primary">Live Market Data</h3>
                        <p className="feature-desc text-muted">
                            Pull real-time prices from the ESI API. Compare profitability across Jita, Amarr, Dodixie, Rens, and Hek to find the best margins.
                        </p>
                    </div>
                    <div className="feature-card glass-panel">
                        <div className="feature-icon">🏭</div>
                        <h3 className="feature-title text-primary">Profit Dashboard</h3>
                        <p className="feature-desc text-muted">
                            View estimated profits for every PI commodity. Our dashboard automatically calculates input costs versus sell prices.
                        </p>
                    </div>
                    <div className="feature-card glass-panel">
                        <div className="feature-icon">🧩</div>
                        <h3 className="feature-title text-primary">Dependency Tracking</h3>
                        <p className="feature-desc text-muted">
                            Explore what commodities are used to build more advanced items. View detailed material trees and input requirements for P0 to P4.
                        </p>
                    </div>
                    <div className="feature-card glass-panel">
                        <div className="feature-icon">📝</div>
                        <h3 className="feature-title text-primary">Factory Planner</h3>
                        <p className="feature-desc text-muted">
                            Select a target commodity and let our planner calculate exactly how many extractor heads and factories you need to build it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
