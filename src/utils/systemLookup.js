let cachedSystems = null;
let loadingPromise = null;

/**
 * Loads and parses the EVE systems database CSV client-side.
 * Caches the results globally to prevent multiple fetches/parses.
 * @returns {Promise<Array>} Promise resolving to the list of systems.
 */
export const loadSystemsDatabase = () => {
    if (cachedSystems) {
        return Promise.resolve(cachedSystems);
    }
    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = fetch('/eve_systems_planets.csv')
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch systems database: ${res.statusText}`);
            }
            return res.text();
        })
        .then(text => {
            const lines = text.split('\n');
            const systemsMap = {};
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(',');
                if (parts.length < 7) continue;
                
                const systemName = parts[2];
                const securityStatus = parseFloat(parts[3]) || 0.0;
                const planetName = parts[5];
                const planetType = parts[6];
                
                if (!systemName) continue;
                
                if (!systemsMap[systemName]) {
                    systemsMap[systemName] = {
                        name: systemName,
                        security: securityStatus,
                        planets: []
                    };
                }
                
                if (planetName && planetType) {
                    systemsMap[systemName].planets.push({
                        name: planetName,
                        type: planetType
                    });
                }
            }
            
            cachedSystems = Object.values(systemsMap);
            loadingPromise = null;
            return cachedSystems;
        })
        .catch(err => {
            loadingPromise = null;
            throw err;
        });

    return loadingPromise;
};

/**
 * Searches the systems list client-side.
 * @param {string} query The search string.
 * @param {Array} systemsList The list of parsed systems.
 * @returns {Array} List of matching systems, sorted by relevance.
 */
export const searchSystems = (query, systemsList) => {
    if (!query || !systemsList) return [];
    const lowerQuery = query.toLowerCase();
    return systemsList
        .filter(s => s.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
            // Exact match gets priority
            const aExact = a.name.toLowerCase() === lowerQuery;
            const bExact = b.name.toLowerCase() === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // Starts with query gets priority
            const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
            const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            return a.name.localeCompare(b.name);
        })
        .slice(0, 20);
};
