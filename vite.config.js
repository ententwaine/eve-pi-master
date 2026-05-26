import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import url from 'url'

let cachedSystems = null;

function getSystems() {
    if (cachedSystems) return cachedSystems;
    
    // Resolve relative to process.cwd()
    const csvPath = path.resolve(process.cwd(), 'eve_systems_planets.csv');
    console.log(`[API Search] Checking CSV at: "${csvPath}"`);
    console.log(`[API Search] CSV exists: ${fs.existsSync(csvPath)}`);
    
    if (!fs.existsSync(csvPath)) {
        console.warn('[API Search] Warning: eve_systems_planets.csv not found!');
        return [];
    }
    
    try {
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n');
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
        console.log(`[API Search] Successfully parsed ${cachedSystems.length} systems from CSV.`);
        return cachedSystems;
    } catch (e) {
        console.error('[API Search] Error parsing eve_systems_planets.csv:', e);
        return [];
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'js-system-lookup',
            configureServer(server) {
                // Mount at root level to prevent Connect prefix-stripping matching issues
                server.middlewares.use((req, res, next) => {
                    try {
                        const parsedUrl = url.parse(req.url, true);
                        
                        if (parsedUrl.pathname === '/api/systems') {
                            const query = parsedUrl.query.q || '';
                            console.log(`[API Search] Request received for query: "${query}" (req.url: "${req.url}")`);
                            
                            const systems = getSystems();
                            const results = systems
                                .filter(s => s.name.toLowerCase().includes(String(query).toLowerCase()))
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .slice(0, 20);
                            
                            console.log(`[API Search] Returning ${results.length} matching systems.`);
                            
                            res.writeHead(200, { 
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(JSON.stringify(results));
                            return;
                        }
                    } catch (err) {
                        console.error('[API Search] Error handling search request:', err);
                        try {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Server error' }));
                        } catch (e) {}
                        return;
                    }
                    next();
                });
            }
        }
    ],
})
