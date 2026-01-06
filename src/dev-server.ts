/**
 * Simple Dev Server for HMR Testing
 * Actually runs and serves files with HMR
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hmrClassifier } from './hmr/classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DevServer {
    private server: http.Server | null = null;
    private clients: Set<any> = new Set();
    private fileWatchers: Map<string, fs.FSWatcher> = new Map();

    constructor(private port: number = 3000, private root: string = process.cwd()) { }

    start(): Promise<void> {
        return new Promise((resolve) => {
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            this.server.listen(this.port, () => {
                console.log(`✅ Dev server running at http://localhost:${this.port}`);
                resolve();
            });
        });
    }

    stop(): Promise<void> {
        return new Promise((resolve) => {
            // Close all client connections
            for (const client of this.clients) {
                try {
                    client.end();
                } catch (e) {
                    // Ignore errors
                }
            }
            this.clients.clear();

            // Stop all file watchers
            for (const watcher of this.fileWatchers.values()) {
                watcher.close();
            }
            this.fileWatchers.clear();

            if (this.server) {
                this.server.close(() => {
                    console.log('✅ Dev server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Watch all files in a directory (for testing)
     */
    watchDirectory(dir: string): void {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile() && !this.fileWatchers.has(filePath)) {
                this.watchFile(filePath);
                console.log(`👁️  Watching: ${filePath}`);
            }
        }
    }

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        const url = req.url || '/';

        // Strip query params for file lookup
        const [pathname] = url.split('?');

        // HMR WebSocket endpoint
        if (pathname === '/__hmr') {
            this.handleHMRConnection(req, res);
            return;
        }

        // Serve files
        let filePath = path.join(this.root, pathname === '/' ? 'index.html' : pathname);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        // Read and serve file
        const ext = path.extname(filePath);
        const contentType = this.getContentType(ext);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }

            // Inject HMR client for HTML files
            if (ext === '.html') {
                const html = data.toString();
                const injected = this.injectHMRClient(html);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(injected);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });

        // Watch this file for changes
        if (!this.fileWatchers.has(filePath)) {
            this.watchFile(filePath);
        }
    }

    private handleHMRConnection(req: http.IncomingMessage, res: http.ServerResponse): void {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Send initial connection message
        res.write('data: {"type":"connected"}\n\n');

        // Store client
        this.clients.add(res);

        // Remove client on close
        req.on('close', () => {
            this.clients.delete(res);
        });
    }

    private watchFile(filePath: string): void {
        console.log(`👁️  Setting up watcher for: ${filePath}`);

        const watcher = fs.watch(filePath, (eventType, filename) => {
            console.log(`🔔 File event: ${eventType} on ${filename || filePath}`);
            if (eventType === 'change') {
                this.handleFileChange(filePath);
            }
        });

        watcher.on('error', (error) => {
            console.error(`❌ Watcher error for ${filePath}:`, error);
        });

        this.fileWatchers.set(filePath, watcher);
    }

    private handleFileChange(filePath: string): void {
        console.log(`📝 File changed: ${filePath}`);

        // Classify the change
        const decision = hmrClassifier.classify({
            path: filePath,
            type: 'updated'
        });

        console.log(`🔥 HMR Decision: ${decision.level}`);
        console.log(`   Reason: ${decision.reason}`);

        // Send HMR update to all clients
        const message = JSON.stringify({
            type: 'hmr-update',
            decision,
            file: filePath,
            timestamp: Date.now()
        });

        for (const client of this.clients) {
            client.write(`data: ${message}\n\n`);
        }
    }

    private injectHMRClient(html: string): string {
        const hmrScript = `
<script type="module">
// HMR Client
const eventSource = new EventSource('/__hmr');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'connected') {
        console.log('✅ HMR connected');
        return;
    }
    
    if (data.type === 'hmr-update') {
        console.log('🔥 HMR Update:', data.decision);
        console.log('   Level:', data.decision.level);
        console.log('   Reason:', data.decision.reason);
        
        // Handle different HMR levels
        if (data.decision.level === 'HMR_SAFE') {
            // Reload CSS with robust cloning strategy
            console.log('🔄 Reloading CSS...');
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    console.log('   Refreshing: ' + href);
                    // Create new timestamp
                    const newUrl = href.split('?')[0] + '?t=' + Date.now();
                    
                    // Clone and replace to force browser reload
                    const newLink = link.cloneNode();
                    newLink.setAttribute('href', newUrl);
                    
                    // When loaded, remove old link to prevent flash
                    newLink.onload = () => {
                        console.log('✅ CSS reloaded: ' + newUrl);
                        // Small delay to ensure styles applied
                        setTimeout(() => {
                           if (link.parentNode) link.parentNode.removeChild(link);
                        }, 50);
                    };
                    
                    if (link.parentNode) {
                        link.parentNode.insertBefore(newLink, link.nextSibling);
                    }
                }
            });
        } else if (data.decision.level === 'HMR_FULL_RELOAD') {
            // Full page reload
            setTimeout(() => location.reload(), 100);
        } else {
            // Partial HMR - let framework handle it
            if (import.meta.hot) {
                import.meta.hot.accept();
            }
        }
    }
};

eventSource.onerror = () => {
    console.error('❌ HMR connection lost');
};
</script>
`;

        // Inject before closing body tag
        return html.replace('</body>', `${hmrScript}</body>`);
    }

    private getContentType(ext: string): string {
        const types: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        };
        return types[ext] || 'text/plain';
    }
}

// Export for testing
export async function startDevServer(port: number = 3000, root: string = process.cwd()): Promise<DevServer> {
    const server = new DevServer(port, root);
    await server.start();
    return server;
}
