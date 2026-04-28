import React, { useMemo, useState, useEffect } from 'react';
import { commodities } from '../../../data/pi_data';
import { useTradeHub } from '../../../context/TradeHubContext';
import { getLowestSellOrder } from '../../../services/esiApi';

const formatISK = (value) => {
    if (!value || isNaN(value)) return '0 ISK';
    return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 0 }).format(value) + ' ISK';
};

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
const TreeNode = ({ node, level = 0, prices }) => {
    if (!node) return null;

    const isLeaf = node.children.length === 0;
    const price = prices[node.id];
    const totalValue = price ? price * node.quantity : 0;

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
                minWidth: '120px',
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
                <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '2px' }}>
                    x{node.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                {/* ISK Value */}
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                    {prices[node.id] === undefined ? '...' : formatISK(totalValue)}
                </div>
            </div>

            {/* Connecting Lines (CSS) */}
            {!isLeaf && (
                <div className="lines" style={{
                    position: 'absolute',
                    top: '70px', // Below the card (adjusted for extra height)
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

                            <TreeNode node={child} level={level + 1} prices={prices} />
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
    const { selectedHub } = useTradeHub() || { selectedHub: { name: 'Jita', regionId: 10000002, systemId: 30000142 } }; // Fallback if no provider
    const [prices, setPrices] = useState({});

    // Collect unique IDs from rootNode
    const uniqueIds = useMemo(() => {
        if (!rootNode) return [];
        const ids = new Set();
        const traverse = (node) => {
            ids.add(node.id);
            node.children.forEach(traverse);
        };
        traverse(rootNode);
        return Array.from(ids);
    }, [rootNode]);

    useEffect(() => {
        if (uniqueIds.length === 0) return;
        let isMounted = true;
        const fetchPrices = async () => {
            const newPrices = {};
            for (const id of uniqueIds) {
                try {
                    // Get lowest sell order
                    const price = await getLowestSellOrder(selectedHub.regionId, id, selectedHub.systemId);
                    newPrices[id] = price;
                } catch (e) {
                    console.error("Error fetching price for", id, e);
                }
            }
            if (isMounted) {
                setPrices(newPrices);
            }
        };
        fetchPrices();
        return () => { isMounted = false; };
    }, [uniqueIds, selectedHub]);

    // Calculate accounting summary
    const summaryByTier = useMemo(() => {
        if (!rootNode) return {};
        const sums = {};
        const traverse = (node) => {
            const price = prices[node.id] || 0;
            const value = price * node.quantity;
            if (!sums[node.tier]) sums[node.tier] = 0;
            sums[node.tier] += value;
            node.children.forEach(traverse);
        };
        traverse(rootNode);
        return sums;
    }, [rootNode, prices]);

    if (!rootNode) return null;

    return (
        <div style={{ display: 'flex', gap: 'var(--space-xl)', overflowX: 'auto', padding: 'var(--space-lg)', minHeight: '300px' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 'max-content' }}>
                    <TreeNode node={rootNode} prices={prices} />
                </div>
            </div>
            
            {/* Accounting Summary Sidebar */}
            <div className="accounting-summary glass-panel" style={{
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                minWidth: '250px',
                height: 'fit-content',
                position: 'sticky',
                top: 0,
                background: 'rgba(20, 22, 30, 0.9)',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
                    Accounting Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {['P0', 'P1', 'P2', 'P3', 'P4'].map(tier => {
                        if (summaryByTier[tier] === undefined) return null;
                        return (
                            <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: `var(--color-tier-${tier.toLowerCase()})`, fontWeight: 'bold' }}>{tier} Total:</span>
                                <span style={{ color: 'var(--color-text-main)', fontFamily: 'monospace' }}>
                                    {formatISK(summaryByTier[tier])}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    * Values based on {selectedHub?.name || 'hub'} sell orders.
                </div>
            </div>
        </div>
    );
};

export default SchematicTree;
