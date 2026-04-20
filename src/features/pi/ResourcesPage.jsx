import React, { useState } from 'react';
import { commodities } from '../../data/pi_data';
import { calculateSchematicChain } from './pi_utils';
import SchematicTree from './components/SchematicTree';

const ResourcesPage = () => {
    // ... existing state ...
    const [selectedTier, setSelectedTier] = useState('P0');
    const [selectedResource, setSelectedResource] = useState(null);
    const [chainSteps, setChainSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // ... existing handlers ...
    const tiers = ['P0', 'P1', 'P2', 'P3', 'P4'];

    const filteredCommodities = commodities.filter(c => c.tier === selectedTier);

    const handleTierSelect = (tier) => {
        setSelectedTier(tier);
        setSelectedResource(null);
        setChainSteps([]);
        setCurrentStepIndex(0);
    };

    const handleResourceSelect = (resource) => {
        setSelectedResource(resource);
        const steps = calculateSchematicChain(resource.id, 1);
        setChainSteps(steps);
        setCurrentStepIndex(0);
    };

    return (
        <div>
            {/* ... Header ... */}
            <header style={{
                marginBottom: 'var(--space-lg)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 'var(--space-md)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 300 }}>
                    <span className="text-muted">PI Planner /</span> Resources
                </h2>
            </header>

            <div className="responsive-columns">
                {/* Left Column */}
                <div className="glass-panel" style={{
                    flex: '1',
                    padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-md)',
                    minHeight: '400px'
                }}>
                    {/* ... Tier Selector ... */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-lg)',
                        flexWrap: 'wrap'
                    }}>
                        {tiers.map(tier => (
                            <button
                                key={tier}
                                onClick={() => handleTierSelect(tier)}
                                style={{
                                    padding: 'var(--space-xs) var(--space-md)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-primary)',
                                    backgroundColor: selectedTier === tier ? 'var(--color-primary)' : 'transparent',
                                    color: selectedTier === tier ? 'var(--color-bg-base)' : 'var(--color-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>

                    <h4 className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>Available Commodities</h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-xs)'
                    }}>
                        {filteredCommodities.map(c => (
                            <div
                                key={c.id}
                                onClick={() => handleResourceSelect(c)}
                                style={{
                                    padding: 'var(--space-sm)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    backgroundColor: selectedResource?.id === c.id ? 'rgba(0, 217, 247, 0.1)' : 'transparent',
                                    borderLeft: selectedResource?.id === c.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                                    color: selectedResource?.id === c.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <span>{c.name}</span>
                            </div>
                        ))}
                        {filteredCommodities.length === 0 && (
                            <div className="text-muted" style={{ fontStyle: 'italic' }}>No commodities found for this tier.</div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {selectedResource && chainSteps.length > 0 ? (
                        <>
                            {/* Standard Chain Slider Panel */}
                            <div className="glass-panel" style={{
                                padding: 'var(--space-lg)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }} className="text-primary">
                                    {selectedResource.name}
                                </h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                                    Production Chain for 1 unit
                                </p>

                                {/* Slider Controls */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'var(--space-md)',
                                    padding: 'var(--space-sm)',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: 'var(--radius-sm)'
                                }}>
                                    <button
                                        onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                                        disabled={currentStepIndex === 0}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: currentStepIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                            cursor: currentStepIndex === 0 ? 'default' : 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        &lt; Output
                                    </button>

                                    <span style={{ fontWeight: 'bold' }}>
                                        Step {currentStepIndex} of {chainSteps.length - 1}
                                    </span>

                                    <button
                                        onClick={() => setCurrentStepIndex(Math.min(chainSteps.length - 1, currentStepIndex + 1))}
                                        disabled={currentStepIndex === chainSteps.length - 1}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: currentStepIndex === chainSteps.length - 1 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                            cursor: currentStepIndex === chainSteps.length - 1 ? 'default' : 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Input &gt;
                                    </button>
                                </div>

                                {/* Step Item Content */}
                                <div>
                                    <h4 style={{ marginBottom: 'var(--space-md)' }}>
                                        {currentStepIndex === 0 ? 'Base Selection' : `Required Materials (Depth ${currentStepIndex})`}
                                    </h4>
                                    <ul style={{ listStyle: 'none' }}>
                                        {chainSteps[currentStepIndex].map((item, idx) => (
                                            <li key={idx} style={{
                                                padding: 'var(--space-sm)',
                                                borderBottom: '1px solid var(--color-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}>
                                                <span>{item.name} <span className="text-muted" style={{ fontSize: '0.8rem' }}>({item.tier})</span></span>
                                                <span className="text-accent">{item.quantity.toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass-panel" style={{
                            padding: 'var(--space-lg)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                            opacity: 0.5
                        }}>
                            <p className="text-muted">Select a resource to view production chain.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schematic Tree Visualization Section */}
            {selectedResource && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <h3 className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>Schematic Visualization</h3>
                    <div className="glass-panel" style={{
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        background: 'rgba(10, 12, 18, 0.6)' // Darker for contrast
                    }}>
                        <SchematicTree rootId={selectedResource.id} quantity={1} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesPage;
