const ESI_BASE_URL = 'https://esi.evetech.net/latest';

/**
 * Standard RFC-compliant fetch wrapper for EVE ESI.
 * Respects 'Expires' headers dynamically to optimize caching.
 */
const fetchWithCache = async (url, options = {}, forceRefresh = false) => {
    const method = options.method || 'GET';
    if (method !== 'GET') {
        return fetch(url, options);
    }

    const cacheKey = `esi-cache-${url}`;
    
    if (!forceRefresh) {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
            try {
                const { expires, data } = JSON.parse(cachedItem);
                // Return cached version if valid
                if (Date.now() < expires) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => data,
                        headers: {
                            get: (name) => {
                                if (name.toLowerCase() === 'expires') return new Date(expires).toUTCString();
                                return null;
                            }
                        }
                    };
                }
            } catch (e) {
                // Ignore parse errors and fetch fresh
            }
        }
    }

    // Query ESI Tranquility
    const response = await fetch(url, {
        ...options,
        cache: forceRefresh ? 'reload' : 'default'
    });

    if (response.ok) {
        try {
            const data = await response.clone().json();
            const expiresHeader = response.headers.get('expires');
            // Cache for 5 minutes by default if no expires header found
            const expiresTime = expiresHeader ? Date.parse(expiresHeader) : (Date.now() + 300000);
            
            localStorage.setItem(cacheKey, JSON.stringify({
                expires: expiresTime,
                data: data
            }));
        } catch (e) {
            // Ignore storage full or parse errors
        }
    }
    return response;
};

export const fetchMarketOrders = async (regionId, typeId, orderType = 'all') => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/markets/${regionId}/orders/?datasource=tranquility&order_type=${orderType}&type_id=${typeId}`);
        if (!response.ok) {
            throw new Error(`ESI Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch market orders:', error);
        return [];
    }
};

export const fetchMarketHistory = async (regionId, typeId) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/markets/${regionId}/history/?datasource=tranquility&type_id=${typeId}`);
        if (!response.ok) {
            throw new Error(`ESI Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch market history:', error);
        return [];
    }
};

export const fetchCharacterSkills = async (characterId, token, forceRefresh = false) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/characters/${characterId}/skills/?datasource=tranquility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, forceRefresh);
        if (!response.ok) throw new Error('Failed to fetch skills');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const fetchPlanetaryColonies = async (characterId, token, forceRefresh = false) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/characters/${characterId}/planets/?datasource=tranquility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, forceRefresh);
        if (!response.ok) throw new Error('Failed to fetch planets');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const fetchPlanetDetails = async (characterId, planetId, token, forceRefresh = false) => {
    let retries = 3;
    let delay = 300;
    while (retries > 0) {
        try {
            const response = await fetchWithCache(`${ESI_BASE_URL}/characters/${characterId}/planets/${planetId}/?datasource=tranquility`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, forceRefresh);
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 420 || response.status >= 500) {
                retries--;
                if (retries === 0) return null;
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                throw new Error(`ESI Error: ${response.status}`);
            }
        } catch (error) {
            console.error(`ESI details fetch attempt failed for planet ${planetId}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    return null;
};

export const fetchUniversePlanet = async (planetId) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/universe/planets/${planetId}/?datasource=tranquility`);
        if (!response.ok) throw new Error(`Failed to fetch universe planet ${planetId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const fetchUniverseSystem = async (systemId) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/universe/systems/${systemId}/?datasource=tranquility`);
        if (!response.ok) throw new Error(`Failed to fetch universe system ${systemId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getLowestSellOrder = async (regionId, typeId, systemId = null) => {
    const orders = await fetchMarketOrders(regionId, typeId, 'sell');
    let validOrders = orders;
    
    if (systemId) {
        validOrders = orders.filter(o => o.system_id === systemId);
    }
    if (validOrders.length === 0) return 0;
    return validOrders.reduce((min, p) => p.price < min ? p.price : min, validOrders[0].price);
};

export const getHighestBuyOrder = async (regionId, typeId, systemId = null) => {
    const orders = await fetchMarketOrders(regionId, typeId, 'buy');
    let validOrders = orders;
    
    if (systemId) {
        validOrders = orders.filter(o => o.system_id === systemId);
    }
    if (validOrders.length === 0) return 0;
    return validOrders.reduce((max, p) => p.price > max ? p.price : max, validOrders[0].price);
};

export const fetchUniverseType = async (typeId) => {
    try {
        const response = await fetchWithCache(`${ESI_BASE_URL}/universe/types/${typeId}/?datasource=tranquility`);
        if (!response.ok) throw new Error(`Failed to fetch universe type ${typeId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};
