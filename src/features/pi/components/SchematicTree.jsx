import React, { useMemo, useState, useEffect } from 'react';
import { commodities } from '../../../data/pi_data';
import { useTradeHub } from '../../../context/TradeHubContext';
import { getLowestSellOrder } from '../../../services/esiApi';

const formatISK = (value) => {
    if (!value || isNaN(value)) return '0 ISK';
    return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 0 }).format(value) + ' ISK';
};

const VOLUMES = {
    'P0': 0.01,
    'P1': 0.38,
    'P2': 1.5,
    'P3': 6.0,
    'P4': 100.0
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
            flexDirection: 'row',
            alignItems: 'center',
            margin: '4px 0',
            position: 'relative'
        }}>
            {/* Children Container (LEFT) */}
            {!isLeaf && (
                <div className="children-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                    paddingRight: '12px'
                }}>
                    {node.children.map((child, idx) => (
                        <div key={child.id + '-' + idx} className="tree-branch" style={{ position: 'relative' }}>
                            {/* Horizontal Line Right to Parent */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                right: '-12px',
                                width: '12px',
                                height: '1px',
                                background: 'var(--color-border)',
                                zIndex: 1
                            }}></div>

                            {/* Vertical Line for Siblings */}
                            {node.children.length > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    right: '-12px',
                                    top: idx === 0 ? '50%' : 0,
                                    bottom: idx === node.children.length - 1 ? '50%' : '-8px',
                                    width: '1px',
                                    background: 'var(--color-border)',
                                    zIndex: 0
                                }}></div>
                            )}

                            <TreeNode node={child} level={level + 1} prices={prices} />
                        </div>
                    ))}
                </div>
            )}

            {/* The Node Card (RIGHT) */}
            <div className={`glass-panel tree-node-card tier-${node.tier}`} data-tier={node.tier} style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                marginLeft: !isLeaf ? '12px' : '0',
                border: `1px solid var(--color-tier-${node.tier?.toLowerCase() || 'p0'})`,
                background: 'rgba(20, 22, 30, 0.8)',
                zIndex: 2,
                whiteSpace: 'nowrap',
                position: 'relative'
            }}>
                {/* Connecting Line Left to Sibling Line */}
                {!isLeaf && (
                    <div className="lines" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '-12px',
                        width: '12px',
                        height: '1px',
                        background: 'var(--color-border)',
                        zIndex: 1
                    }}></div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                        src={`https://images.evetech.net/types/${node.id}/icon?size=32`} 
                        alt={node.name} 
                        style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)', fontSize: '0.8rem' }}>{node.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>({node.tier})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                x{node.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                                {prices[node.id] === undefined ? '...' : formatISK(totalValue)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Export ---
const SchematicTree = ({ rootId, quantity = 1, onSummaryCalculated }) => {
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
        if (!rootNode) return { sums: {}, items: {}, volumes: {} };
        const sums = {};
        const items = {};
        const volumes = {};
        const traverse = (node) => {
            const price = prices[node.id] || 0;
            const value = price * node.quantity;
            const volume = node.quantity * (VOLUMES[node.tier] || 0);

            if (!sums[node.tier]) sums[node.tier] = 0;
            sums[node.tier] += value;

            if (!volumes[node.tier]) volumes[node.tier] = 0;
            volumes[node.tier] += volume;
            
            if (!items[node.tier]) items[node.tier] = {};
            if (!items[node.tier][node.id]) {
                items[node.tier][node.id] = { name: node.name, quantity: 0, totalValue: 0, totalVolume: 0 };
            }
            items[node.tier][node.id].quantity += node.quantity;
            items[node.tier][node.id].totalValue += value;
            items[node.tier][node.id].totalVolume += volume;

            node.children.forEach(traverse);
        };
        traverse(rootNode);
        return { sums, items, volumes };
    }, [rootNode, prices]);

    // Pass summary to parent if requested
    useEffect(() => {
        if (onSummaryCalculated) {
            onSummaryCalculated(summaryByTier);
        }
    }, [summaryByTier, onSummaryCalculated]);

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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 'max-content', margin: 'auto' }}>
                    <TreeNode node={rootNode} prices={prices} />
                </div>
            </div>
        </div>
    );
};

export default SchematicTree;
