import React from 'react';
import { useNavigate } from 'react-router-dom';

const PIPlannerLayout = () => {
    const navigate = useNavigate();

    return (
        <div>
            <header style={{
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 300 }}>PI Planner</h2>
            </header>

            <div className="glass-panel" style={{
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-md)',
                borderRadius: 'var(--radius-md)'
            }}>
                <p className="text-muted">Manage your planetary production and resources.</p>
                <button
                    onClick={() => navigate('/pi/resources')}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-bg-base)',
                        border: 'none',
                        padding: 'var(--space-md) var(--space-lg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                    }}
                >
                    View Resources
                </button>
            </div>
        </div>
    );
};

export default PIPlannerLayout;
