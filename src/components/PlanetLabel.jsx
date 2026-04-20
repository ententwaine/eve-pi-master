import React from 'react';
import { getPlanetIconPath } from '../utils/planetUtils';

const PlanetLabel = ({ planetName, size = 16, style = {} }) => {
    if (!planetName) return null;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: 'var(--color-text-main)',
            ...style
        }}>
            <img 
                src={getPlanetIconPath(planetName)} 
                alt={planetName} 
                style={{ width: size, height: size, borderRadius: '50%' }} 
            />
            {planetName}
        </span>
    );
};

export default PlanetLabel;
