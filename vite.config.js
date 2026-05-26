import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

let cachedSystems = null;

function getSystems() {
    if (cachedSystems) return cachedSystems;
    
    const csvPath = path.resolve(process.cwd(), 'eve_systems_planets.csv');
    if (!fs.existsSync(csvPath)) {
        console.warn('eve_systems_planets.csv not found at:', csvPath);
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
        console.log(`Loaded ${cachedSystems.length} solar systems from CSV cache.`);
        return cachedSystems;
    } catch (e) {
        console.error('Failed to parse eve_systems_planets.csv:', e);
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
                server.middlewares.use('/api/systems', (req, res) => {
                    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                    const query = url.searchParams.get('q') || '';
                    
                    if (!query.trim()) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify([]));
                        return;
                    }
                    
                    const systems = getSystems();
                    const results = systems
                        .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .slice(0, 20);
                        
                    res.writeHead(200, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify(results));
                });
            }
        }
    ],
})
