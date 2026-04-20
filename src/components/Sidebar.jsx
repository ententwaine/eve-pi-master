import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (

        <aside className="glass-panel sidebar">
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span className="text-primary">EVE</span> Planner
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <NavItem
                    active={location.pathname === '/'}
                    onClick={() => navigate('/')}
                >
                    Dashboard
                </NavItem>
                <NavItem
                    active={location.pathname === '/pi'}
                    onClick={() => navigate('/pi')}
                >
                    PI Planner
                </NavItem>
                <NavItem>Industry</NavItem>
                <NavItem>Settings</NavItem>
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <div style={{ padding: 'var(--space-sm)', fontSize: '0.9rem' }} className="text-muted">
                    User Status: <span className="text-accent">Alpha</span>
                </div>
            </div>
        </aside>
    );
};

const NavItem = ({ children, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: active ? 'rgba(0, 217, 247, 0.1)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderLeft: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease'
            }}>
            {children}
        </div>
    );
};

export default Sidebar;
