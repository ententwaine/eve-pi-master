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
            <div className={`glass-panel tree-node-card tier-${node.tier}`} data-tier={node.tier} style={{
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
    const treeContainerRef = React.useRef(null);
    const [tierPositions, setTierPositions] = useState({});

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
        if (!rootNode) return { sums: {}, items: {} };
        const sums = {};
        const items = {};
        const traverse = (node) => {
            const price = prices[node.id] || 0;
            const value = price * node.quantity;
            if (!sums[node.tier]) sums[node.tier] = 0;
            sums[node.tier] += value;
            
            if (!items[node.tier]) items[node.tier] = {};
            if (!items[node.tier][node.id]) {
                items[node.tier][node.id] = { name: node.name, quantity: 0, totalValue: 0 };
            }
            items[node.tier][node.id].quantity += node.quantity;
            items[node.tier][node.id].totalValue += value;

            node.children.forEach(traverse);
        };
        traverse(rootNode);
        return { sums, items };
    }, [rootNode, prices]);

    // Track vertical positions of tiers for aligned summaries
    useEffect(() => {
        const updatePositions = () => {
            if (!treeContainerRef.current) return;
            const containerRect = treeContainerRef.current.getBoundingClientRect();
            const cards = treeContainerRef.current.querySelectorAll('.tree-node-card');
            
            const positions = {};
            cards.forEach(card => {
                const tier = card.getAttribute('data-tier');
                const rect = card.getBoundingClientRect();
                const topPosition = rect.top - containerRect.top;
                
                if (positions[tier] === undefined || topPosition < positions[tier]) {
                    positions[tier] = topPosition;
                }
            });
            setTierPositions(positions);
        };

        // Small delay to allow layout to render first
        const timeoutId = setTimeout(updatePositions, 100);
        window.addEventListener('resize', updatePositions);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updatePositions);
        };
    }, [rootNode, prices]);

    if (!rootNode) return null;

    return (
        <div ref={treeContainerRef} style={{ display: 'flex', gap: 'var(--space-xl)', overflowX: 'auto', padding: 'var(--space-lg)', minHeight: '300px', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 'max-content' }}>
                    <TreeNode node={rootNode} prices={prices} />
                </div>
            </div>
            
            {/* Aligned Accounting Summary Sidebars */}
            <div className="accounting-summary-container" style={{
                position: 'relative',
                minWidth: '280px',
                width: '280px',
                height: '100%' // Ensure it stretches to parent height
            }}>
                {['P4', 'P3', 'P2', 'P1', 'P0'].map(tier => {
                    if (summaryByTier.sums[tier] === undefined) return null;
                    const topPos = tierPositions[tier];
                    
                    return (
                        <div key={tier} className="glass-panel" style={{
                            position: topPos !== undefined ? 'absolute' : 'relative',
                            top: topPos !== undefined ? topPos : 'auto',
                            right: 0,
                            width: '100%',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(20, 22, 30, 0.9)',
                            border: `1px solid var(--color-tier-${tier.toLowerCase()})`,
                            transition: 'top 0.3s ease',
                            marginBottom: topPos !== undefined ? 0 : 'var(--space-md)'
                        }}>
                            <h4 style={{ margin: '0 0 var(--space-sm) 0', color: `var(--color-tier-${tier.toLowerCase()})`, borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                                {tier} Accounting
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                                {Object.values(summaryByTier.items[tier] || {}).map(item => (
                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        <span>{item.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}x {item.name}</span>
                                        <span>{formatISK(item.totalValue)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                <span style={{ color: `var(--color-tier-${tier.toLowerCase()})`, fontWeight: 'bold', fontSize: '0.9rem' }}>Total:</span>
                                <span style={{ color: 'var(--color-text-main)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {formatISK(summaryByTier.sums[tier])}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SchematicTree;
