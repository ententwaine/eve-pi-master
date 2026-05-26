import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'python-system-lookup',
            configureServer(server) {
                server.middlewares.use('/api/systems', (req, res) => {
                    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                    const query = url.searchParams.get('q') || '';
                    
                    if (!query.trim()) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify([]));
                        return;
                    }
                    
                    // Sanitize input to only alphanumeric, spaces, and hyphens to prevent command injection
                    const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s-]/g, '');
                    
                    exec(`python lookup_system.py "${sanitizedQuery}"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error('Lookup script error:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Internal lookup error' }));
                            return;
                        }
                        res.writeHead(200, { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(stdout);
                    });
                });
            }
        }
    ],
})
