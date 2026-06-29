import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPlanetaryColonies, fetchPlanetDetails, fetchUniversePlanet, fetchUniverseSystem, fetchUniverseType, getLowestSellOrder } from '../../services/esiApi';
import { getStructureDataByTypeId, registerStructureType } from '../../data/pi_structures';
import { commodities } from '../../data/pi_data';
import './EyePage.css';

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

const CC_UPGRADE_OUTPUTS = [
    { level: 0, power: 6000, cpu: 1672 },
    { level: 1, power: 9000, cpu: 2552 },
    { level: 2, power: 12000, cpu: 3696 },
    { level: 3, power: 15000, cpu: 4664 },
    { level: 4, power: 19000, cpu: 5720 },
    { level: 5, power: 23000, cpu: 6600 }
];

const getPlanetAlerts = (planet, details, prices) => {
    const alerts = [];
    if (!details || !details.pins) return alerts;

    let hasStorage = false;
    
    details.pins.forEach(pin => {
        const struct = getStructureDataByTypeId(pin.type_id);
        const nameLower = struct.name.toLowerCase();
        
        const isCommandCenter = nameLower.includes('command center') || 
                                [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
        const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;
        const isIndustry = nameLower.includes('industry') || nameLower.includes('processor') || pin.factory_details !== undefined;
        
        if (isExtractor) {
            const hasActiveExtractor = pin.extractor_details && pin.extractor_details.qty_per_cycle > 0;
            const expiryTime = pin.expiry_time ? new Date(pin.expiry_time) : null;
            const isExpired = expiryTime ? expiryTime < new Date() : true;
            
            if (isExpired || !hasActiveExtractor) {
                alerts.push({
                    id: `ecu-idle-${pin.pin_id}`,
                    type: 'danger',
                    subject: 'Extractor Idle',
                    message: `ECU on ${planet.name || 'Planet'} has depleted its cycle and is offline.`,
                    planetId: planet.planet_id,
                    planetName: planet.name
                });
            } else {
                const diff = expiryTime.getTime() - new Date().getTime();
                if (diff < 6 * 60 * 60 * 1000) { // < 6 hours
                    const hoursLeft = Math.max(0, (diff / (1000 * 60 * 60)).toFixed(1));
                    alerts.push({
                        id: `ecu-expiring-${pin.pin_id}`,
                        type: 'warning',
                        subject: 'Extractor Cycle Expiring',
                        message: `ECU cycle on ${planet.name || 'Planet'} is ending in ${hoursLeft}h.`,
                        planetId: planet.planet_id,
                        planetName: planet.name
                    });
                }
            }
        }
        
        if (isIndustry && pin.factory_details) {
            if (!pin.factory_details.schematic_id) {
                alerts.push({
                    id: `factory-idle-${pin.pin_id}`,
                    type: 'warning',
                    subject: 'Factory Idle',
                    message: `Processor on ${planet.name || 'Planet'} lacks schematic setup.`,
                    planetId: planet.planet_id,
                    planetName: planet.name
                });
            }
        }

        if (!isCommandCenter && !isExtractor && !isIndustry) {
            hasStorage = true;
            const isKnownStorage = nameLower.includes('storage') || 
                                   [2257, 2535, 2536, 2538, 2541, 2558, 2573, 2583, 2586, 2588, 3066].includes(Number(pin.type_id));
            const capacity = isKnownStorage ? 12000 : 10000;
            
            let used = 0;
            if (pin.contents) {
                pin.contents.forEach(item => {
                    const comm = commodities.find(c => c.id === item.type_id);
                    const tier = comm ? comm.tier : 'P0';
                    const itemVol = VOLUMES[tier] || 0.01;
                    used += item.amount * itemVol;
                });
            }
            
            const fillRatio = used / capacity;
            if (fillRatio >= 0.90) {
                alerts.push({
                    id: `storage-full-${pin.pin_id}`,
                    type: 'danger',
                    subject: 'Storage Overflow Risk',
                    message: `${isKnownStorage ? 'Storage Facility' : 'Launchpad'} on ${planet.name || 'Planet'} is at ${Math.round(fillRatio * 100)}% capacity.`,
                    planetId: planet.planet_id,
                    planetName: planet.name
                });
            } else if (fillRatio >= 0.75) {
                alerts.push({
                    id: `storage-warn-${pin.pin_id}`,
                    type: 'warning',
                    subject: 'Storage High Volume',
                    message: `${isKnownStorage ? 'Storage Facility' : 'Launchpad'} on ${planet.name || 'Planet'} is at ${Math.round(fillRatio * 100)}% capacity.`,
                    planetId: planet.planet_id,
                    planetName: planet.name
                });
            }
        }
    });

    if (!hasStorage) {
        alerts.push({
            id: `no-storage-${planet.planet_id}`,
            type: 'info',
            subject: 'Layout Warning',
            message: `No storage nodes configured on ${planet.name || 'Planet'}. Output routes might bottleneck.`,
            planetId: planet.planet_id,
            planetName: planet.name
        });
    }

    return alerts;
};

const EyePlanetCard = ({ planet, details, prices }) => {
    const [universePlanet, setUniversePlanet] = useState(null);
    const [universeSystem, setUniverseSystem] = useState(null);
    const [systemLoading, setSystemLoading] = useState(true);

    useEffect(() => {
        const loadSystemInfo = async () => {
            const uPlanet = await fetchUniversePlanet(planet.planet_id);
            if (uPlanet) {
                setUniversePlanet(uPlanet);
                const uSystem = await fetchUniverseSystem(uPlanet.system_id);
                if (uSystem) setUniverseSystem(uSystem);
            }
            setSystemLoading(false);
        };
        loadSystemInfo();
    }, [planet.planet_id]);

    const { pinsSummary, powerPercent, cpuPercent } = useMemo(() => {
        if (!details || !details.pins) {
            return { pinsSummary: { ccs: 0, processors: 0, ecus: 0, storages: 0, launchpads: 0 }, powerPercent: 0, cpuPercent: 0 };
        }

        const summary = { ccs: 0, processors: 0, ecus: 0, storages: 0, launchpads: 0 };
        let estPowerUsed = 0;
        let estCpuUsed = 0;

        details.pins.forEach(pin => {
            const struct = getStructureDataByTypeId(pin.type_id);
            const nameLower = struct.name.toLowerCase();

            const isCommandCenter = nameLower.includes('command center') || 
                                    [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
            const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;
            const isIndustry = nameLower.includes('industry') || nameLower.includes('processor') || pin.factory_details !== undefined;

            if (isCommandCenter) {
                summary.ccs++;
            } else if (isExtractor) {
                summary.ecus++;
                // Extractor ECU usage approx: ECU base + estimated average 4 heads
                estPowerUsed += 2600 + (4 * 550);
                estCpuUsed += 500 + (4 * 110);
            } else if (isIndustry) {
                summary.processors++;
                // Factory load estimation
                const isBasic = nameLower.includes('basic') || nameLower.includes('processor');
                estPowerUsed += isBasic ? 800 : 700;
                estCpuUsed += isBasic ? 200 : 500;
            } else {
                const isKnownStorage = nameLower.includes('storage') || 
                                       [2257, 2535, 2536, 2538, 2541, 2558, 2573, 2583, 2586, 2588, 3066].includes(Number(pin.type_id));
                if (isKnownStorage) {
                    summary.storages++;
                } else {
                    summary.launchpads++;
                }
                estPowerUsed += 700;
                estCpuUsed += 500;
            }
        });

        // Link overhead estimation
        estPowerUsed = Math.round(estPowerUsed * 1.1);
        estCpuUsed = Math.round(estCpuUsed * 1.1);

        const ccLimits = CC_UPGRADE_OUTPUTS.find(o => o.level === planet.upgrade_level) || CC_UPGRADE_OUTPUTS[0];
        const powerPct = Math.min(100, Math.round((estPowerUsed / ccLimits.power) * 100));
        const cpuPct = Math.min(100, Math.round((estCpuUsed / ccLimits.cpu) * 100));

        return { pinsSummary: summary, powerPercent: powerPct, cpuPercent: cpuPct };
    }, [details, planet.upgrade_level]);

    const storageReport = useMemo(() => {
        if (!details || !details.pins) return [];
        const reports = [];

        details.pins.forEach(pin => {
            const struct = getStructureDataByTypeId(pin.type_id);
            const nameLower = struct.name.toLowerCase();

            const isCommandCenter = nameLower.includes('command center') || 
                                    [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
            const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;
            const isIndustry = nameLower.includes('industry') || nameLower.includes('processor') || pin.factory_details !== undefined;

            if (!isCommandCenter && !isExtractor && !isIndustry) {
                const isKnownStorage = nameLower.includes('storage') || 
                                       [2257, 2535, 2536, 2538, 2541, 2558, 2573, 2583, 2586, 2588, 3066].includes(Number(pin.type_id));
                const maxCap = isKnownStorage ? 12000 : 10000;
                
                let usedVolume = 0;
                let value = 0;
                const itemsList = [];

                if (pin.contents) {
                    pin.contents.forEach(item => {
                        const comm = commodities.find(c => c.id === item.type_id);
                        const tier = comm ? comm.tier : 'P0';
                        const itemVol = VOLUMES[tier] || 0.01;
                        const volFootprint = item.amount * itemVol;
                        usedVolume += volFootprint;

                        const price = prices[item.type_id] || FALLBACK_PRICES[tier];
                        const itemVal = item.amount * price;
                        value += itemVal;

                        itemsList.push({
                            id: item.type_id,
                            name: comm ? comm.name : `Item ${item.type_id}`,
                            amount: item.amount,
                            tier: tier,
                            value: itemVal
                        });
                    });
                }

                reports.push({
                    pinId: pin.pin_id,
                    name: isKnownStorage ? `Storage Facility` : `Launchpad`,
                    used: usedVolume,
                    capacity: maxCap,
                    fillRatio: (usedVolume / maxCap) * 100,
                    value: value,
                    items: itemsList
                });
            }
        });

        return reports;
    }, [details, prices]);

    const activeExtractions = useMemo(() => {
        if (!details || !details.pins) return [];
        const extractions = [];

        details.pins.forEach(pin => {
            const struct = getStructureDataByTypeId(pin.type_id);
            const nameLower = struct.name.toLowerCase();
            const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;

            if (isExtractor) {
                const hasActive = pin.extractor_details && pin.extractor_details.qty_per_cycle > 0;
                const expiryTime = pin.expiry_time ? new Date(pin.expiry_time) : null;
                const isExpired = expiryTime ? expiryTime < new Date() : true;
                const productId = pin.extractor_details?.product_type_id;
                const comm = productId ? commodities.find(c => c.id === productId) : null;

                extractions.push({
                    pinId: pin.pin_id,
                    active: !isExpired && hasActive && comm,
                    commName: comm ? comm.name : 'Unknown Material',
                    commId: productId,
                    qty: pin.extractor_details?.qty_per_cycle || 0,
                    expiry: expiryTime
                });
            }
        });

        return extractions;
    }, [details]);

    if (!details) {
        return (
            <div className="eye-planet-panel error-panel">
                <div className="eye-planet-hologram"></div>
                <div className="eye-planet-details">
                    <div className="eye-planet-meta">
                        <span className="eye-system-tag">UNKNOWN COORD</span>
                        <span className="eye-colony-level">LVL --</span>
                    </div>
                    <h3 className="eye-planet-title">{planet.planet_type} Planet ({planet.planet_id})</h3>
                    <div className="eye-load-error">Oversight Uplink Failed. ESI Telemetry rate-limited.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="eye-planet-panel">
            <div className="eye-planet-hologram" style={{ backgroundImage: `url('/planet_icons/${planet.planet_type}.png')` }}>
                <div className="eye-planet-glow"></div>
            </div>

            <div className="eye-planet-details">
                <div className="eye-planet-meta">
                    <span className="eye-system-tag">{universeSystem ? universeSystem.name : 'Resolving Grid...'}</span>
                    <span className="eye-colony-level">Command Level {planet.upgrade_level}</span>
                </div>
                <h3 className="eye-planet-title">{universePlanet ? universePlanet.name : `${planet.planet_type} Planet`}</h3>

                <div className="eye-hardware-load">
                    <div className="eye-meter">
                        <div className="eye-meter-label">
                            <span>Power Grid Load</span>
                            <span className={powerPercent > 85 ? 'text-warn' : 'text-ok'}>{powerPercent}%</span>
                        </div>
                        <div className="eye-meter-track">
                            <div className={`eye-meter-fill ${powerPercent > 85 ? 'fill-warn' : 'fill-ok'}`} style={{ width: `${powerPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="eye-meter">
                        <div className="eye-meter-label">
                            <span>CPU Clock Load</span>
                            <span className={cpuPercent > 85 ? 'text-warn' : 'text-ok'}>{cpuPercent}%</span>
                        </div>
                        <div className="eye-meter-track">
                            <div className={`eye-meter-fill ${cpuPercent > 85 ? 'fill-warn' : 'fill-ok'}`} style={{ width: `${cpuPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="eye-colony-structures">
                    <div className="eye-struc-row">
                        <span className="text-muted">Extractors (ECUs):</span>
                        <span className="eye-count-badge">{pinsSummary.ecus}</span>
                    </div>
                    <div className="eye-struc-row">
                        <span className="text-muted">Factories (Processors):</span>
                        <span className="eye-count-badge">{pinsSummary.processors}</span>
                    </div>
                </div>

                {activeExtractions.length > 0 && (
                    <div className="eye-sub-section">
                        <h4 className="eye-section-label">Active Extraction Nodes</h4>
                        {activeExtractions.map(ext => (
                            <div key={ext.pinId} className={`eye-extraction-line ${ext.active ? 'active' : 'idle'}`}>
                                <div className="eye-activity-dot"></div>
                                <div className="eye-extraction-info">
                                    {ext.active ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {ext.commId && <img src={`https://images.evetech.net/types/${ext.commId}/icon?size=32`} alt="icon" className="eye-mini-icon" />}
                                                <strong>{ext.commName}</strong>
                                            </div>
                                            <div className="eye-extra-details">
                                                <span>Yield: {ext.qty.toLocaleString()} / cycle</span>
                                                <span style={{ color: 'var(--color-accent)' }}>
                                                    {ext.expiry ? `${Math.max(0, ((ext.expiry.getTime() - Date.now()) / (1000 * 60 * 60)).toFixed(1))}h left` : 'Depleted'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>ECU Node Offline / Idle</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="eye-sub-section">
                    <h4 className="eye-section-label">Valuation & Stored Capacities</h4>
                    {storageReport.length === 0 ? (
                        <div className="eye-no-storage-alert">No launchpad or storage nodes routed.</div>
                    ) : (
                        <div className="eye-storage-grid">
                            {storageReport.map((str, idx) => {
                                const isWarn = str.fillRatio >= 75;
                                const isCritical = str.fillRatio >= 90;
                                return (
                                    <div key={str.pinId} className="eye-storage-card">
                                        <div className="eye-storage-card-header">
                                            <span>{str.name} {idx + 1}</span>
                                            <strong className="eye-val-text">{str.value > 0 ? `${Math.round(str.value).toLocaleString()} ISK` : '0 ISK'}</strong>
                                        </div>
                                        <div className="eye-storage-card-progress">
                                            <div className={`eye-storage-card-bar ${isCritical ? 'critical' : isWarn ? 'warning' : 'good'}`} style={{ width: `${Math.min(100, str.fillRatio)}%` }}></div>
                                        </div>
                                        <div className="eye-storage-card-footer">
                                            <span>{str.used.toLocaleString(undefined, { maximumFractionDigits: 1 })} / {str.capacity.toLocaleString()} m³</span>
                                            <span className={isCritical ? 'text-danger' : isWarn ? 'text-warn' : 'text-muted'}>
                                                {Math.round(str.fillRatio)}% Filled
                                            </span>
                                        </div>

                                        {str.items.length > 0 && (
                                            <div className="eye-storage-item-list">
                                                {str.items.map(item => (
                                                    <span key={item.id} className={`eye-item-tag tier-${item.tier.toLowerCase()}`} title={`Stored: ${item.amount.toLocaleString()} units`}>
                                                        {item.name}: {item.amount.toLocaleString()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EyePage = () => {
    const { user, token, login } = useAuth();
    const [planets, setPlanets] = useState([]);
    const [planetsDetails, setPlanetsDetails] = useState({});
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);

    // Fetch ESI network with cache-busting redundancy check
    const fetchTelemetry = useCallback(async (isForced = false) => {
        if (!user || !token) return;
        if (isForced) {
            setIsRefetching(true);
        } else {
            setLoading(true);
            setPlanets([]);
            setPlanetsDetails({});
            setPrices({});
        }

        try {
            // Fetch colonies using cache-busting flags
            const data = await fetchPlanetaryColonies(user.id, token, isForced);
            setPlanets(data || []);

            if (data && data.length > 0) {
                const uniqueUnknownTypeIds = new Set();
                const uniqueItemIds = new Set();

                // Fetch details for all planets sequentially to respect ESI rate limits
                const detailsList = [];
                for (const p of data) {
                    const details = await fetchPlanetDetails(user.id, p.planet_id, token, isForced);
                    detailsList.push({ planetId: p.planet_id, details });
                    // 50ms delay between planet detail fetches
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                const detailsMap = {};
                detailsList.forEach(item => {
                    detailsMap[item.planetId] = item.details;
                    
                    const planetDetails = item.details;
                    if (planetDetails && planetDetails.pins) {
                        planetDetails.pins.forEach(pin => {
                            const struct = getStructureDataByTypeId(pin.type_id);
                            if (struct.name.startsWith('Unknown Structure')) {
                                uniqueUnknownTypeIds.add(pin.type_id);
                            }
                            
                            const nameLower = struct.name.toLowerCase();
                            const isCommandCenter = nameLower.includes('command center') || 
                                                    [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
                            const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;
                            const isIndustry = nameLower.includes('industry') || nameLower.includes('processor') || pin.factory_details !== undefined;

                            if (!isCommandCenter && !isExtractor && !isIndustry && pin.contents) {
                                pin.contents.forEach(it => uniqueItemIds.add(it.type_id));
                            }
                        });
                    }
                });

                // REDUNDANCY STALE DATA CHECK:
                // Compare current payload string representation with the last character-specific localStorage state
                const currentDataString = JSON.stringify(detailsMap);
                const lastDataKey = `last_eye_telemetry_data_${user.id}`;
                const lastTimeKey = `last_eye_telemetry_time_${user.id}`;

                const lastDataString = localStorage.getItem(lastDataKey);
                const lastFetchTime = localStorage.getItem(lastTimeKey);
                const timeSinceLastFetch = Date.now() - Number(lastFetchTime || 0);

                if (!isForced && lastDataString && currentDataString === lastDataString && timeSinceLastFetch > 5000) {
                    console.warn(`Redundancy check failed for character ${user.id}: Stale telemetry data suspected. Triggering forced Tranquility refresh...`);
                    localStorage.setItem(lastTimeKey, Date.now().toString());
                    setTimeout(() => {
                        fetchTelemetry(true);
                    }, 100);
                    return;
                }

                localStorage.setItem(lastDataKey, currentDataString);
                localStorage.setItem(lastTimeKey, Date.now().toString());
                setPlanetsDetails(detailsMap);

                // Resolve unknown structures
                if (uniqueUnknownTypeIds.size > 0) {
                    const typePromises = Array.from(uniqueUnknownTypeIds).map(async (typeId) => {
                        const typeInfo = await fetchUniverseType(typeId);
                        if (typeInfo) {
                            registerStructureType(typeId, typeInfo);
                        }
                    });
                    await Promise.all(typePromises);
                }

                // Resolve Market Prices (lowest Jita Sell Order) sequentially
                const JITA_REGION_ID = 10000002;
                const JITA_SYSTEM_ID = 30000144;
                const fetchedPrices = {};
                if (uniqueItemIds.size > 0) {
                    for (const itemId of Array.from(uniqueItemIds)) {
                        try {
                            const price = await getLowestSellOrder(JITA_REGION_ID, itemId, JITA_SYSTEM_ID);
                            fetchedPrices[itemId] = price || 0;
                        } catch (e) {
                            fetchedPrices[itemId] = 0;
                        }
                        // 50ms delay between pricing calls
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                setPrices(fetchedPrices);
            }
        } catch (err) {
            console.error("Failed to load Oversight eye data:", err);
        } finally {
            setLoading(false);
            setIsRefetching(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchTelemetry(false);
    }, [fetchTelemetry]);

    // Aggregate Alerts & Stored Commodities
    const { alertsList, warehouseStock, totalStoredValuation, counters } = useMemo(() => {
        const alerts = [];
        const stock = {};
        let totalVal = 0;
        
        let extractorCount = 0;
        let factoryCount = 0;
        let warningCount = 0;
        let dangerCount = 0;

        planets.forEach(p => {
            const details = planetsDetails[p.planet_id];
            if (details) {
                // Name lookup binding
                const planetDataWithMeta = { ...p, name: details.planetName || p.planet_type };
                const planetAlerts = getPlanetAlerts(planetDataWithMeta, details, prices);
                alerts.push(...planetAlerts);

                // Structures counters
                if (details.pins) {
                    details.pins.forEach(pin => {
                        const struct = getStructureDataByTypeId(pin.type_id);
                        const nameLower = struct.name.toLowerCase();
                        const isExtractor = nameLower.includes('extractor') || pin.extractor_details !== undefined;
                        const isIndustry = nameLower.includes('industry') || nameLower.includes('processor') || pin.factory_details !== undefined;

                        if (isExtractor) extractorCount++;
                        if (isIndustry) factoryCount++;

                        // Inventory parsing
                        const isCommandCenter = nameLower.includes('command center') || 
                                                [2254, 2524, 2525, 2530, 2532, 2549, 2555, 2559].includes(Number(pin.type_id));
                        if (!isCommandCenter && !isExtractor && !isIndustry && pin.contents) {
                            pin.contents.forEach(item => {
                                const comm = commodities.find(c => c.id === item.type_id);
                                const tier = comm ? comm.tier : 'P0';
                                const itemPrice = prices[item.type_id] || FALLBACK_PRICES[tier];
                                const itemVal = item.amount * itemPrice;
                                totalVal += itemVal;

                                if (!stock[item.type_id]) {
                                    stock[item.type_id] = {
                                        id: item.type_id,
                                        name: comm ? comm.name : `Item ${item.type_id}`,
                                        amount: 0,
                                        tier: tier,
                                        price: itemPrice,
                                        totalVal: 0
                                    };
                                }
                                stock[item.type_id].amount += item.amount;
                                stock[item.type_id].totalVal += itemVal;
                            });
                        }
                    });
                }
            }
        });

        alerts.forEach(a => {
            if (a.type === 'danger') dangerCount++;
            if (a.type === 'warning') warningCount++;
        });

        return {
            alertsList: alerts,
            warehouseStock: Object.values(stock).sort((a, b) => b.totalVal - a.totalVal),
            totalStoredValuation: totalVal,
            counters: {
                extractors: extractorCount,
                factories: factoryCount,
                dangers: dangerCount,
                warnings: warningCount
            }
        };
    }, [planets, planetsDetails, prices]);

    if (!user) {
        return (
            <div className="eye-page-container">
                <div className="eye-auth-wall glass-panel">
                    <h1 className="eye-neon-title">PLANETARY OVERSIGHT NODE</h1>
                    <p className="text-muted" style={{ maxWidth: '550px', margin: 'var(--space-md) auto' }}>
                        Connect your EVE Online SSO Account to establish secure telemetry links with your active planetary Command Centers, extraction fields, and storage routing grids.
                    </p>
                    <button className="eye-hud-btn glow-cyan" onClick={login}>CONNECT SECURE ESI UPLINK</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="eye-page-container">
                <div className="eye-dashboard-loader glass-panel">
                    <div className="eye-loader-ring">
                        <div></div><div></div><div></div><div></div>
                    </div>
                    <h2 className="eye-neon-subtitle">Establishing ESI Oversite Link...</h2>
                    <p className="text-muted">Resolving universe coordinate indexes, telemetry link nodes, and real-time market valuations.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="eye-page-container">
            {/* Header Tactical Display */}
            <div className="eye-page-header glass-panel">
                <div className="eye-hud-header-left">
                    <div className={isRefetching ? "eye-glowing-indicator refetching" : "eye-glowing-indicator"}></div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <h1 className="eye-neon-title" style={{ margin: 0 }}>
                                {isRefetching ? "PI EYE • RECOVERY SYNC..." : "PI EYE • OVERSEE PANEL"}
                            </h1>
                            <button 
                                className="eye-hud-btn glow-cyan" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                onClick={() => fetchTelemetry(true)}
                                disabled={isRefetching}
                            >
                                <span>🔄</span> {isRefetching ? "SYNCING..." : "FORCE SYNC"}
                            </button>
                        </div>
                        <p className="text-muted" style={{ marginTop: '4px' }}>
                            {isRefetching 
                                ? "Bypassing intermediate CDN cache filters and force-syncing fresh Tranquility state..." 
                                : `Real-time status monitoring, warning scans, and stored asset valuations for ${user.name}.`}
                        </p>
                    </div>
                </div>
                <div className="eye-hud-counters">
                    <div className="eye-counter-panel">
                        <span className="eye-counter-value text-cyan">{planets.length}</span>
                        <span className="eye-counter-label">Colonies</span>
                    </div>
                    <div className="eye-counter-panel">
                        <span className="eye-counter-value text-accent">{counters.extractors}</span>
                        <span className="eye-counter-label">Extractors</span>
                    </div>
                    <div className="eye-counter-panel">
                        <span className="eye-counter-value text-ok">{counters.factories}</span>
                        <span className="eye-counter-label">Factories</span>
                    </div>
                    <div className="eye-counter-panel">
                        <span className={`eye-counter-value ${counters.dangers > 0 ? 'text-danger blinking' : counters.warnings > 0 ? 'text-warn' : 'text-ok'}`}>
                            {counters.dangers + counters.warnings}
                        </span>
                        <span className="eye-counter-label">Active Alerts</span>
                    </div>
                </div>
            </div>

            {/* Main Diagnostics Grid */}
            <div className="eye-hud-layout">
                {/* Left Side: Planet Oversight Grid */}
                <div className="eye-left-track">
                    <h2 className="eye-hud-section-title">Planetary Oversight Diagnostics</h2>
                    <div className="eye-planets-scroller">
                        {planets.map(p => (
                            <EyePlanetCard 
                                key={p.planet_id} 
                                planet={p} 
                                details={planetsDetails[p.planet_id]}
                                prices={prices}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side: Alerts Panel & Stock Valuation */}
                <div className="eye-right-track">
                    
                    {/* Alerts Terminal */}
                    <div className="eye-hud-card alerts-card glass-panel">
                        <div className="eye-card-glare"></div>
                        <h3 className="eye-card-title">
                            <span className="eye-title-icon">⚠</span> Active Warning Center
                        </h3>
                        {alertsList.length === 0 ? (
                            <div className="eye-no-alerts">
                                <span className="eye-ok-shield">✓</span>
                                <div style={{ marginTop: 'var(--space-sm)' }}>Systems Nominal. All extractors active, schematics set, and storage space available.</div>
                            </div>
                        ) : (
                            <div className="eye-alerts-scroller">
                                {alertsList.map((alert) => (
                                    <div key={alert.id} className={`eye-alert-strip border-${alert.type}`}>
                                        <div className={`eye-alert-type-badge badge-${alert.type}`}>{alert.subject}</div>
                                        <div className="eye-alert-desc">
                                            <span className="eye-alert-planet">{alert.planetName}</span>: {alert.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial & Warehouse Oversight */}
                    <div className="eye-hud-card warehouse-card glass-panel">
                        <div className="eye-card-glare"></div>
                        <h3 className="eye-card-title">
                            <span className="eye-title-icon">📊</span> Warehouse Stock & Market valuation
                        </h3>
                        
                        <div className="eye-total-valuation-bar">
                            <span className="text-muted">Total Stored Assets</span>
                            <span className="eye-total-isk-glow">{Math.round(totalStoredValuation).toLocaleString()} ISK</span>
                        </div>

                        {warehouseStock.length === 0 ? (
                            <div className="eye-warehouse-empty">No commodity inventories stored on launchpads.</div>
                        ) : (
                            <div className="eye-warehouse-table-wrapper">
                                <table className="eye-warehouse-table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th style={{ textAlign: 'center' }}>Tier</th>
                                            <th style={{ textAlign: 'right' }}>Quantity</th>
                                            <th style={{ textAlign: 'right' }}>Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouseStock.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <img src={`https://images.evetech.net/types/${item.id}/icon?size=32`} alt="icon" style={{ width: 24, height: 24, borderRadius: 4 }} />
                                                        <strong>{item.name}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`eye-item-tag tier-${item.tier.toLowerCase()}`}>{item.tier}</span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                    {item.amount.toLocaleString()}
                                                </td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                                                    {Math.round(item.totalVal).toLocaleString()} ISK
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EyePage;
