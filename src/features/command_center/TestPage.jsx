import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPlanetaryColonies, fetchPlanetDetails, fetchUniversePlanet, fetchUniverseSystem, fetchUniverseType, getLowestSellOrder } from '../../services/esiApi';
import { getStructureDataByTypeId, registerStructureType } from '../../data/pi_structures';
import { commodities } from '../../data/pi_data';
import './CommandCenterPage.css';

const VOLUMES = {
    'P0': 0.01,
    'P1': 0.38,
    'P2': 1.5,
    'P3': 6.0,
    'P4': 100.0
};

const FALLBACK_PRICES = {
    'P0': 8.0,
    'P1': 450.0,
    'P2': 9000.0,
    'P3': 60000.0,
    'P4': 1200000.0
};

const PlanetCard = ({ planet, token, userId, prices, onReportStorage }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [universePlanet, setUniversePlanet] = useState(null);
    const [universeSystem, setUniverseSystem] = useState(null);

    useEffect(() => {
        const loadDetails = async () => {
            const data = await fetchPlanetDetails(userId, planet.planet_id, token);
            setDetails(data);
            
            const uPlanet = await fetchUniversePlanet(planet.planet_id);
            if (uPlanet) {
                setUniversePlanet(uPlanet);
                const uSystem = await fetchUniverseSystem(uPlanet.system_id);
                if (uSystem) setUniverseSystem(uSystem);
            }
            
            setLoading(false);
        };
        loadDetails();
    }, [planet.planet_id, token, userId]);

    useEffect(() => {
        if (!details || !onReportStorage) return;
        
        const pins = details.pins || [];
        const report = [];
        
        pins.forEach(pin => {
            const struct = getStructureDataByTypeId(pin.type_id);
            const structNameLower = struct.name.toLowerCase();
            
            const isCommandCenter = structNameLower.includes('command center') || 
                                    [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
            const isExtractor = structNameLower.includes('extractor') || 
                                pin.extractor_details !== undefined;
            const isIndustry = structNameLower.includes('industry') || 
                               structNameLower.includes('processor') || 
                               pin.factory_details !== undefined;
            
            if (!isCommandCenter && !isExtractor && !isIndustry) {
                if (pin.contents) {
                    pin.contents.forEach(item => {
                        const comm = commodities.find(c => c.id === item.type_id);
                        const tier = comm ? comm.tier : 'P0';
                        const itemPrice = prices[item.type_id] || FALLBACK_PRICES[tier];
                        report.push({
                            typeId: item.type_id,
                            name: comm ? comm.name : `Item ${item.type_id}`,
                            tier: tier,
                            amount: item.amount,
                            price: itemPrice,
                            totalValue: item.amount * itemPrice
                        });
                    });
                }
            }
        });
        
        onReportStorage(planet.planet_id, report);
    }, [details, prices, onReportStorage, planet.planet_id]);

    if (loading) {
        return (
            <div className="live-planet-card glass-panel" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '250px' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                <div className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>Syncing telemetry...</div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="live-planet-card glass-panel">
                <div className="lp-header">
                    <div className="lp-title-block">
                        <div className="lp-system">{universeSystem ? universeSystem.name : 'System Data Required'}</div>
                        <div className="lp-type">{universePlanet ? universePlanet.name : `${planet.planet_type} Planet`}</div>
                    </div>
                </div>
                <div className="text-danger" style={{ padding: 'var(--space-md) 0' }}>Failed to load planet telemetry.</div>
            </div>
        );
    }

    const pins = details.pins || [];
    
    let commandCenter = null;
    let extractors = [];
    let industry = [];
    let storage = [];
    let launchpads = [];

    pins.forEach(pin => {
        const struct = getStructureDataByTypeId(pin.type_id);
        const pinData = { ...pin, structName: struct.name, icon: struct.icon };

        const structNameLower = struct.name.toLowerCase();
        const isCommandCenter = structNameLower.includes('command center') || 
                                [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
        const isExtractor = structNameLower.includes('extractor') || 
                            pin.extractor_details !== undefined;
        const isIndustry = structNameLower.includes('industry') || 
                           structNameLower.includes('processor') || 
                           pin.factory_details !== undefined;

        if (isCommandCenter) {
            pinData.icon = '/icons/icon1.jpg';
            commandCenter = pinData;
        }
        else if (isExtractor) {
            pinData.icon = '/icons/icon2.jpg';
            extractors.push(pinData);
        }
        else if (isIndustry) {
            industry.push(pinData);
        }
        else {
            const isKnownStorage = structNameLower.includes('storage') || 
                                   [2257, 2535, 2536, 2538, 2541, 2558, 2573, 2583, 2586, 2588, 3066].includes(Number(pin.type_id));
            if (isKnownStorage) {
                storage.push(pinData);
            } else {
                launchpads.push(pinData);
            }
        }
    });

    const getPinVolume = (pin) => {
        if (!pin.contents) return 0;
        return pin.contents.reduce((sum, item) => {
            const comm = commodities.find(c => c.id === item.type_id);
            const tier = comm ? comm.tier : 'P0';
            const itemVolume = VOLUMES[tier] || 0.01;
            return sum + (item.amount * itemVolume);
        }, 0);
    };

    const calculateCapacity = (pin, maxCap) => {
        const totalVolume = getPinVolume(pin);
        return Math.min(100, (totalVolume / maxCap) * 100);
    };

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return '';
        const diff = expiryDate.getTime() - new Date().getTime();
        if (diff <= 0) return 'Depleted';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    };

    const renderCircleIndicator = (percent) => {
        const strokeColor = `hsl(${120 * (1 - percent / 100)}, 85%, 45%)`;
        return (
            <svg viewBox="0 0 36 36" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeWidth="3.5" 
                />
                <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="none" 
                    stroke={strokeColor} 
                    strokeWidth="3.5" 
                    strokeDasharray={`${percent} 100`} 
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                    style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease' }}
                />
                <text 
                    x="18" 
                    y="20.5" 
                    style={{ 
                        fontSize: '8px', 
                        fontWeight: 'bold', 
                        fill: 'var(--color-text-main)', 
                        textAnchor: 'middle' 
                    }}
                >
                    {Math.round(percent)}%
                </text>
            </svg>
        );
    };

    return (
        <div className="live-planet-card glass-panel" style={{ padding: 'var(--space-sm)' }}>
            {commandCenter && (
                <img src={`/planet_icons/${planet.planet_type}.png`} onError={(e) => { e.target.onerror = null; e.target.src=`/planet_icons/${planet.planet_type}.jpg`; }} alt="BG" className="planet-card-bg" style={{ opacity: 0.15, right: '-20px', top: '-20px', width: '150px', height: '150px' }} />
            )}
            
            <div className="lp-header" style={{ paddingBottom: '4px', marginBottom: '8px' }}>
                <div className="lp-title-block" style={{ flexDirection: 'row', alignItems: 'baseline', gap: '8px' }}>
                    <div className="lp-system">{universeSystem ? universeSystem.name : 'System Data Required'}</div>
                    <div className="lp-type" style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{universePlanet ? universePlanet.name : `${planet.planet_type} Planet`}</div>
                </div>
                <div className="lp-upgrade" style={{ padding: '1px 6px' }}>
                    Lv {planet.upgrade_level}
                </div>
            </div>

            <div className="lp-section">
                <div className="lp-section-title">Active Facilities</div>
                <div className="lp-buildings">
                    {commandCenter && (
                        <div className="lp-building-badge" title="Command Center">
                            <img src={commandCenter.icon} alt="CC" /> 1
                        </div>
                    )}
                    {industry.length > 0 && (
                        <div className="lp-building-badge" title="Industry Facilities">
                            <img src={industry[0].icon} alt="IND" /> {industry.length}
                        </div>
                    )}
                    {extractors.length > 0 && (
                        <div className="lp-building-badge" title="Extractor Control Units">
                            <img src={extractors[0].icon} alt="ECU" /> {extractors.length}
                        </div>
                    )}
                    {storage.length > 0 && (
                        <div className="lp-building-badge" title="Storage Facilities">
                            <img src={storage[0].icon} alt="STO" /> {storage.length}
                        </div>
                    )}
                    {launchpads.length > 0 && (
                        <div className="lp-building-badge" title="Launchpads">
                            <img src={launchpads[0].icon} alt="LAU" /> {launchpads.length}
                        </div>
                    )}
                </div>
            </div>

            {extractors.length > 0 && (
                <div className="lp-section" style={{ marginTop: '8px' }}>
                    <div className="lp-section-title" style={{ marginBottom: '4px' }}>Extraction Status</div>
                    {extractors.map((ecu, i) => {
                        const hasActiveExtractor = ecu.extractor_details && ecu.extractor_details.qty_per_cycle > 0;
                        const expiryTime = ecu.expiry_time ? new Date(ecu.expiry_time) : null;
                        const isExpired = expiryTime ? expiryTime < new Date() : true;
                        
                        const productTypeId = ecu.extractor_details?.product_type_id;
                        const productItem = productTypeId ? commodities.find(c => c.id === productTypeId) : null;

                        return (
                            <div key={ecu.pin_id} className="extractor-activity" style={{ marginTop: '4px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {(!isExpired && hasActiveExtractor && productItem) ? (
                                    <>
                                        <div className="extraction-indicator"></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                                            <img 
                                                src={`https://images.evetech.net/types/${productItem.id}/icon?size=32`} 
                                                alt={productItem.name} 
                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} 
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="text-success" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                    Extracting {productItem.name}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {getRemainingTime(expiryTime)} ({ecu.extractor_details.qty_per_cycle.toLocaleString()} units/cycle)
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="extraction-indicator" style={{ background: 'var(--color-danger)', animation: 'none', boxShadow: 'none' }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="text-danger" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Depleted / Idle</span>
                                            {productItem && (
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    Configured for: {productItem.name}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {(storage.length > 0 || launchpads.length > 0) && (
                <div className="lp-section">
                    <div className="lp-section-title">Storage & Routing Capacity</div>
                    <div className="lp-storage-bars">
                        {launchpads.map((lp, i) => {
                            const percent = calculateCapacity(lp, 10000);
                            const totalVolume = getPinVolume(lp);
                            const facilityValue = lp.contents ? lp.contents.reduce((sum, item) => {
                                const comm = commodities.find(c => c.id === item.type_id);
                                const price = prices[item.type_id] || FALLBACK_PRICES[comm?.tier || 'P0'];
                                return sum + (item.amount * price);
                            }, 0) : 0;
                            return (
                                <div key={lp.pin_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', padding: '6px var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {renderCircleIndicator(percent)}
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Launchpad {i+1}</span>
                                            <span className="text-primary" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {facilityValue > 0 ? new Intl.NumberFormat('en-US').format(Math.round(facilityValue)) + ' ISK' : '0 ISK'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            <span>Used: {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })} / 10,000 m³</span>
                                            <span>{(10000 - totalVolume).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³ free</span>
                                        </div>
                                        {lp.contents && lp.contents.length > 0 && (
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                {lp.contents.map(item => {
                                                    const comm = commodities.find(c => c.id === item.type_id);
                                                    const price = prices[item.type_id] || FALLBACK_PRICES[comm?.tier || 'P0'];
                                                    const itemValue = item.amount * price;
                                                    return (
                                                        <span key={item.type_id} className="text-muted" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.03)' }} title={`Jita Sell: ${price.toLocaleString()} ISK`}>
                                                            {comm ? comm.name : `Type ${item.type_id}`}: {item.amount.toLocaleString()} ({itemValue > 0 ? new Intl.NumberFormat('en-US').format(Math.round(itemValue)) + ' ISK' : '0 ISK'})
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {storage.map((st, i) => {
                            const percent = calculateCapacity(st, 12000);
                            const totalVolume = getPinVolume(st);
                            const facilityValue = st.contents ? st.contents.reduce((sum, item) => {
                                const comm = commodities.find(c => c.id === item.type_id);
                                const price = prices[item.type_id] || FALLBACK_PRICES[comm?.tier || 'P0'];
                                return sum + (item.amount * price);
                            }, 0) : 0;
                            return (
                                <div key={st.pin_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', padding: '6px var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {renderCircleIndicator(percent)}
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Storage Facility {i+1}</span>
                                            <span className="text-primary" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {facilityValue > 0 ? new Intl.NumberFormat('en-US').format(Math.round(facilityValue)) + ' ISK' : '0 ISK'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            <span>Used: {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })} / 12,000 m³</span>
                                            <span>{(12000 - totalVolume).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³ free</span>
                                        </div>
                                        {st.contents && st.contents.length > 0 && (
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                {st.contents.map(item => {
                                                    const comm = commodities.find(c => c.id === item.type_id);
                                                    const price = prices[item.type_id] || FALLBACK_PRICES[comm?.tier || 'P0'];
                                                    const itemValue = item.amount * price;
                                                    return (
                                                        <span key={item.type_id} className="text-muted" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.03)' }} title={`Jita Sell: ${price.toLocaleString()} ISK`}>
                                                            {comm ? comm.name : `Type ${item.type_id}`}: {item.amount.toLocaleString()} ({itemValue > 0 ? new Intl.NumberFormat('en-US').format(Math.round(itemValue)) + ' ISK' : '0 ISK'})
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const TestPage = () => {
    const { user, token } = useAuth();
    const [planets, setPlanets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState({});
    const [planetStorageReports, setPlanetStorageReports] = useState({});

    useEffect(() => {
        const loadPlanetsAndPrices = async () => {
            if (user && token) {
                const data = await fetchPlanetaryColonies(user.id, token);
                setPlanets(data || []);
                
                if (data && data.length > 0) {
                    const uniqueUnknownTypeIds = new Set();
                    const uniqueStoredItemIds = new Set();
                    
                    const detailsPromises = data.map(p => fetchPlanetDetails(user.id, p.planet_id, token));
                    const detailsList = await Promise.all(detailsPromises);
                    
                    detailsList.forEach(planetDetails => {
                        if (planetDetails && planetDetails.pins) {
                            planetDetails.pins.forEach(pin => {
                                const struct = getStructureDataByTypeId(pin.type_id);
                                if (struct.name.startsWith('Unknown Structure')) {
                                    uniqueUnknownTypeIds.add(pin.type_id);
                                }
                                
                                const structNameLower = struct.name.toLowerCase();
                                const isCommandCenter = structNameLower.includes('command center') || 
                                                        [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
                                const isExtractor = structNameLower.includes('extractor') || 
                                                    pin.extractor_details !== undefined;
                                const isIndustry = structNameLower.includes('industry') || 
                                                   structNameLower.includes('processor') || 
                                                   pin.factory_details !== undefined;
                                                   
                                if (!isCommandCenter && !isExtractor && !isIndustry) {
                                    if (pin.contents) {
                                        pin.contents.forEach(item => uniqueStoredItemIds.add(item.type_id));
                                    }
                                }
                            });
                        }
                    });
                    
                    if (uniqueUnknownTypeIds.size > 0) {
                        const typePromises = Array.from(uniqueUnknownTypeIds).map(async (typeId) => {
                            const typeInfo = await fetchUniverseType(typeId);
                            if (typeInfo) {
                                registerStructureType(typeId, typeInfo);
                            }
                        });
                        await Promise.all(typePromises);
                    }
                    
                    const JITA_REGION_ID = 10000002;
                    const JITA_SYSTEM_ID = 30000144;
                    const fetchedPrices = {};
                    if (uniqueStoredItemIds.size > 0) {
                        const pricePromises = Array.from(uniqueStoredItemIds).map(async (itemId) => {
                            try {
                                const price = await getLowestSellOrder(JITA_REGION_ID, itemId, JITA_SYSTEM_ID);
                                fetchedPrices[itemId] = price || 0;
                            } catch (e) {
                                fetchedPrices[itemId] = 0;
                            }
                        });
                        await Promise.all(pricePromises);
                    }
                    setPrices(fetchedPrices);
                }
            }
            setLoading(false);
        };
        loadPlanetsAndPrices();
    }, [user, token]);

    const handleReportStorage = React.useCallback((planetId, report) => {
        setPlanetStorageReports(prev => {
            if (JSON.stringify(prev[planetId]) === JSON.stringify(report)) return prev;
            return { ...prev, [planetId]: report };
        });
    }, []);

    const { totalsByTier, grandTotal } = React.useMemo(() => {
        const totals = { P4: 0, P3: 0, P2: 0, P1: 0, P0: 0 };
        let grand = 0;
        
        Object.values(planetStorageReports).forEach(report => {
            if (report) {
                report.forEach(item => {
                    if (totals[item.tier] !== undefined) {
                        totals[item.tier] += item.totalValue;
                    }
                    grand += item.totalValue;
                });
            }
        });
        
        return { totalsByTier: totals, grandTotal: grand };
    }, [planetStorageReports]);

    const formatSummaryISK = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 0 }).format(val) + ' ISK';
    };

    if (!user) {
        return (
            <div className="cc-container fade-in">
                <div className="glass-panel auth-warning">
                    <h2 className="text-primary">EVE SSO Required</h2>
                    <p className="text-muted" style={{ maxWidth: '600px' }}>
                        The Test Page requires an active EVE Online connection to securely fetch your live planetary data.
                    </p>
                    <p>Please log in using the button in the top right.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="cc-container fade-in">
                <div className="loading-state glass-panel">
                    <div className="spinner"></div>
                    <h2 className="text-primary">Syncing Planet Telemetry...</h2>
                    <p className="text-muted">Loading character network state and fetching real-time market data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cc-container fade-in">
            <div className="cc-header">
                <div>
                    <h1 className="text-primary" style={{ margin: 0, fontSize: '1.8rem' }}>PI Command Center (Test Grid)</h1>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        Verification grid for {user.name}'s colonies.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-main" style={{ fontWeight: 'bold' }}>Active Planets</div>
                    <div className="text-muted" style={{ fontSize: '1.2rem' }}>{planets.length} / 6</div>
                </div>
            </div>

            {planets.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h3 className="text-muted">No planetary colonies found.</h3>
                    <p>Setup Command Centers in-game to view telemetry.</p>
                </div>
            ) : (
                <>
                    <div className="live-planets-grid">
                        {planets.map(p => (
                            <PlanetCard 
                                key={p.planet_id} 
                                planet={p} 
                                token={token} 
                                userId={user.id} 
                                prices={prices}
                                onReportStorage={handleReportStorage}
                            />
                        ))}
                    </div>

                    {grandTotal > 0 && (
                        <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-lg)' }}>
                            <h2 className="text-primary" style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>Stored Valuation Summary</h2>
                            <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                Grouped valuation of all commodities stored in storage facilities or launchpads.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                {['P4', 'P3', 'P2', 'P1', 'P0'].map(tier => {
                                    const val = totalsByTier[tier];
                                    if (val === 0) return null;
                                    return (
                                        <div key={tier} className="glass-panel" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid var(--color-tier-${tier.toLowerCase()})`, background: 'rgba(20,22,30,0.6)' }}>
                                            <div style={{ color: `var(--color-tier-${tier.toLowerCase()})`, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                                {tier} Value
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '4px', fontFamily: 'monospace' }}>
                                                {formatSummaryISK(val)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Grand Total Stored Valuation:</span>
                                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                                    {formatSummaryISK(grandTotal)}
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TestPage;
