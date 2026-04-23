const ESI_BASE_URL = 'https://esi.evetech.net/latest';

// Simple in-memory cache to avoid spamming ESI for the same data
const cache = new Map();

export const fetchMarketOrders = async (regionId, typeId, orderType = 'all') => {
    const cacheKey = `${regionId}-${typeId}-${orderType}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        // Cache for 5 minutes
        if (Date.now() - cached.timestamp < 300000) {
            return cached.data;
        }
    }

    try {
        const response = await fetch(`${ESI_BASE_URL}/markets/${regionId}/orders/?datasource=tranquility&order_type=${orderType}&type_id=${typeId}`);
        if (!response.ok) {
            throw new Error(`ESI Error: ${response.status}`);
        }
        const data = await response.json();
        
        cache.set(cacheKey, { timestamp: Date.now(), data });
        return data;
    } catch (error) {
        console.error('Failed to fetch market orders:', error);
        return [];
    }
};

export const fetchMarketHistory = async (regionId, typeId) => {
    const cacheKey = `history-${regionId}-${typeId}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        // Cache history for 1 hour
        if (Date.now() - cached.timestamp < 3600000) {
            return cached.data;
        }
    }

    try {
        const response = await fetch(`${ESI_BASE_URL}/markets/${regionId}/history/?datasource=tranquility&type_id=${typeId}`);
        if (!response.ok) {
            throw new Error(`ESI Error: ${response.status}`);
        }
        const data = await response.json();
        
        cache.set(cacheKey, { timestamp: Date.now(), data });
        return data;
    } catch (error) {
        console.error('Failed to fetch market history:', error);
        return [];
    }
};

export const fetchCharacterSkills = async (characterId, token) => {
    try {
        const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}/skills/?datasource=tranquility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch skills');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const fetchPlanetaryColonies = async (characterId, token) => {
    try {
        const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}/planets/?datasource=tranquility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch planets');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const fetchPlanetDetails = async (characterId, planetId, token) => {
    try {
        const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}/planets/${planetId}/?datasource=tranquility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch planet details for ${planetId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getLowestSellOrder = async (regionId, typeId, systemId = null) => {
    const orders = await fetchMarketOrders(regionId, typeId, 'sell');
    let validOrders = orders;
    
    // Optionally filter by system if provided (e.g. strict Jita 4-4 only instead of whole region)
    if (systemId) {
        validOrders = orders.filter(o => o.system_id === systemId);
    }
    
    if (validOrders.length === 0) return 0;
    
    // Find the minimum price
    return validOrders.reduce((min, p) => p.price < min ? p.price : min, validOrders[0].price);
};

export const getHighestBuyOrder = async (regionId, typeId, systemId = null) => {
    const orders = await fetchMarketOrders(regionId, typeId, 'buy');
    let validOrders = orders;
    
    if (systemId) {
        validOrders = orders.filter(o => o.system_id === systemId);
    }
    
    if (validOrders.length === 0) return 0;
    
    // Find the maximum price
    return validOrders.reduce((max, p) => p.price > max ? p.price : max, validOrders[0].price);
};
