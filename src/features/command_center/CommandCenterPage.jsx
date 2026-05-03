import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPlanetaryColonies, fetchPlanetDetails, fetchUniversePlanet, fetchUniverseSystem } from '../../services/esiApi';
import { getStructureDataByTypeId } from '../../data/pi_structures';
import './CommandCenterPage.css';

const PlanetCard = ({ planet, token, userId }) => {
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

    // Process Pins (Buildings)
    const pins = details.pins || [];
    
    let commandCenter = null;
    let extractors = [];
    let industry = [];
    let storage = [];
    let launchpads = [];

    pins.forEach(pin => {
        const struct = getStructureDataByTypeId(pin.type_id);
        const pinData = { ...pin, structName: struct.name, icon: struct.icon };
        
        if (struct.name === 'Command Center') {
            pinData.icon = '/icons/icon1.jpg';
            commandCenter = pinData;
        }
        else if (struct.name === 'Extractor Control Unit') {
            pinData.icon = '/icons/icon2.jpg';
            extractors.push(pinData);
        }
        else if (struct.name.includes('Industry')) industry.push(pinData);
        else if (struct.name === 'Storage Facility') storage.push(pinData);
        else if (struct.name === 'Launchpad') launchpads.push(pinData);
    });

    // Helper to calculate used capacity. In a real scenario we'd look at pin.contents
    // For now, ESI provides `contents` array with type_id and amount
    const calculateCapacity = (pin, maxCap) => {
        if (!pin.contents) return 0;
        // In EVE, items have volume. Without SDE, we can't perfectly calculate volume.
        // We will just do a rough percentage based on amount vs maxCap for display purposes
        // assuming average volume of 1m3 for simplicity in this demo
        const totalVolume = pin.contents.reduce((sum, item) => sum + item.amount, 0);
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

            {(storage.length > 0 || launchpads.length > 0) && (
                <div className="lp-section">
                    <div className="lp-section-title">Storage & Routing</div>
                    <div className="lp-storage-bars">
                        {launchpads.map((lp, i) => {
                            const percent = calculateCapacity(lp, 10000);
                            return (
                                <div key={lp.pin_id} className="storage-bar-container">
                                    <div className="storage-header">
                                        <span>Launchpad {i+1}</span>
                                        <span>{(100 - percent).toFixed(1)}% Remaining</span>
                                    </div>
                                    <div className="storage-track">
                                        <div className={`storage-fill ${percent > 90 ? 'full' : ''}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {storage.map((st, i) => {
                            const percent = calculateCapacity(st, 12000);
                            return (
                                <div key={st.pin_id} className="storage-bar-container">
                                    <div className="storage-header">
                                        <span>Storage Facility {i+1}</span>
                                        <span>{(100 - percent).toFixed(1)}% Remaining</span>
                                    </div>
                                    <div className="storage-track">
                                        <div className={`storage-fill ${percent > 90 ? 'full' : ''}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {extractors.length > 0 && (
                <div className="lp-section" style={{ marginTop: '8px' }}>
                    <div className="lp-section-title" style={{ marginBottom: '4px' }}>Extraction Status</div>
                    {extractors.map((ecu, i) => {
                        const hasActiveExtractor = ecu.extractor_details && ecu.extractor_details.qty_per_cycle > 0;
                        const expiryTime = ecu.expiry_time ? new Date(ecu.expiry_time) : null;
                        const isExpired = expiryTime ? expiryTime < new Date() : true;

                        return (
                            <div key={ecu.pin_id} className="extractor-activity" style={{ marginTop: '4px', padding: '4px 8px' }}>
                                {(!isExpired && hasActiveExtractor) ? (
                                    <>
                                        <div className="extraction-indicator"></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="text-success" style={{ fontSize: '0.85rem' }}>Active Extraction</span>
                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{getRemainingTime(expiryTime)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="extraction-indicator" style={{ background: 'var(--color-danger)', animation: 'none', boxShadow: 'none' }}></div>
                                        <span className="text-danger" style={{ fontSize: '0.85rem' }}>Depleted / Idle</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const CommandCenterPage = () => {
    const { user, token } = useAuth();
    const [planets, setPlanets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlanets = async () => {
            if (user && token) {
                const data = await fetchPlanetaryColonies(user.id, token);
                setPlanets(data || []);
            }
            setLoading(false);
        };
        loadPlanets();
    }, [user, token]);

    if (!user) {
        return (
            <div className="cc-container fade-in">
                <div className="glass-panel auth-warning">
                    <h2 className="text-primary">EVE SSO Required</h2>
                    <p className="text-muted" style={{ maxWidth: '600px' }}>
                        The Command Center requires an active EVE Online connection to securely fetch your live planetary data, including active extractors, routing capacities, and colony statuses.
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
                    <h2 className="text-primary">Establishing Secure Connection...</h2>
                    <p className="text-muted">Fetching your planetary network from the EVE Swagger Interface.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cc-container fade-in">
            <div className="cc-header">
                <div>
                    <h1 className="text-primary" style={{ margin: 0, fontSize: '1.8rem' }}>PI Command Center</h1>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        Live telemetry for {user.name}'s planetary network.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-main" style={{ fontWeight: 'bold' }}>Active Colonies</div>
                    <div className="text-muted" style={{ fontSize: '1.2rem' }}>{planets.length} / 6</div>
                </div>
            </div>

            {planets.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h3 className="text-muted">No planetary colonies found for this character.</h3>
                    <p>Build command centers in-game to see them here.</p>
                </div>
            ) : (
                <div className="live-planets-grid">
                    {planets.map(p => (
                        <PlanetCard key={p.planet_id} planet={p} token={token} userId={user.id} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommandCenterPage;
