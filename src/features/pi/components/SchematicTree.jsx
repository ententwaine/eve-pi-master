import React, { useMemo } from 'react';
import { commodities } from '../../../data/pi_data';

// --- Recursive Tree Builder ---
const buildTree = (itemId, quantity = 1) => {
    const item = commodities.find(c => c.id === Number(itemId));
    if (!item) return null;

    // Calculate inputs
    const children = (item.inputs || []).map(input => {
        // Formula: (Input Batch / Output Yield) * Target Qty
        const yieldAmount = item.outputYield || 1;
        const reqQty = (input.quantity / yieldAmount) * quantity;
        return buildTree(input.id, reqQty);
    }).filter(Boolean); // remove nulls

    return {
        ...item,
        quantity: quantity,
        children
    };
};

// --- Tree Node Component ---
const TreeNode = ({ node, level = 0 }) => {
    if (!node) return null;

    const isLeaf = node.children.length === 0;

    return (
        <div className="tree-node" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 var(--space-xs)',
            position: 'relative'
        }}>
            {/* The Node Card */}
            <div className={`glass-panel tier-${node.tier}`} style={{
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-md)',
                border: `1px solid var(--color-tier-${node.tier?.toLowerCase() || 'p0'})`,
                background: 'rgba(20, 22, 30, 0.8)',
                zIndex: 2,
                minWidth: '100px',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)', marginBottom: '4px' }}>
                    <img 
                        src={`https://images.evetech.net/types/${node.id}/icon?size=32`} 
                        alt={node.name} 
                        style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{node.tier}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{node.name}</div>
                <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                    x{node.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
            </div>

            {/* Connecting Lines (CSS) */}
            {!isLeaf && (
                <div className="lines" style={{
                    position: 'absolute',
                    top: '55px', // Below the card
                    bottom: 0,
                    left: '50%',
                    width: '1px',
                    height: 'var(--space-md)',
                    background: 'var(--color-border)',
                }}></div>
            )}

            {/* Children Container */}
            {!isLeaf && (
                <div className="children-container" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 'var(--space-md)',
                    position: 'relative',
                    paddingTop: 'var(--space-md)'
                }}>
                    {/* Horizontal Connector Line */}
                    {node.children.length > 1 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 'calc(50% / ' + node.children.length + ')', // Approximate centering line? No.
                            // Better CSS approach for tree lines involves pseudo-elements on children.
                            // Simplified for now: Just a top border on the container? 
                            // Let's use the pseudo-element 'tree-branch' approach on children.
                        }}></div>
                    )}

                    {node.children.map((child, idx) => (
                        <div key={child.id + '-' + idx} className="tree-branch" style={{ position: 'relative' }}>
                            {/* Vertical Line Up to Parent */}
                            <div style={{
                                position: 'absolute',
                                top: '-16px', // Align with parent padding
                                left: '50%',
                                width: '1px',
                                height: '16px',
                                background: 'var(--color-border)'
                            }}></div>

                            {/* Horizontal Line for Siblings */}
                            {node.children.length > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-16px',
                                    left: idx === 0 ? '50%' : 0,
                                    right: idx === node.children.length - 1 ? '50%' : 0,
                                    height: '1px',
                                    background: 'var(--color-border)'
                                }}></div>
                            )}

                            <TreeNode node={child} level={level + 1} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Export ---
const SchematicTree = ({ rootId, quantity = 1 }) => {
    const rootNode = useMemo(() => buildTree(rootId, quantity), [rootId, quantity]);

    if (!rootNode) return null;

    return (
        <div style={{
            overflowX: 'auto',
            padding: 'var(--space-lg)',
            minHeight: '300px'
        }}>
            <div style={{ width: 'max-content', margin: '0 auto' }}>
                <TreeNode node={rootNode} />
            </div>
        </div>
    );
};

export default SchematicTree;
