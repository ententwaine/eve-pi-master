import React from 'react';

const PlanetCard = ({ planet }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'var(--color-primary)';
            case 'Idle': return 'var(--color-danger)';
            case 'Full': return 'var(--color-accent)';
            case 'Extraction': return '#50fa7b'; // Green
            default: return 'var(--color-text-muted)';
        }
    };

    return (
        <div className="glass-panel" style={{
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            borderTop: `2px solid ${getStatusColor(planet.status)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem' }}>{planet.name}</h4>
                <span style={{
                    fontSize: '0.8rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }}>{planet.type}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span className="text-muted">Output:</span>
                <span className="text-primary">{planet.output || 'None'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span className="text-muted">Status:</span>
                <span style={{ color: getStatusColor(planet.status) }}>{planet.status}</span>
            </div>
        </div>
    );
};

export default PlanetCard;
