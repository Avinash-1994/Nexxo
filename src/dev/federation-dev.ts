import { log } from '../utils/logger.js';
import { BuildConfig } from '../config/index.js';
import http from 'http';

export class FederationDev {
    private remotes: Record<string, string> = {};
    private pollInterval: NodeJS.Timeout | null = null;
    private remoteHashes: Record<string, string> = {};

    constructor(private config: BuildConfig, private broadcast: (msg: string) => void) {
        this.remotes = config.federation?.remotes || {};
    }

    start() {
        if (Object.keys(this.remotes).length === 0) return;

        log.info('Starting Hot Federation watcher...', { category: 'hmr' });
        // Poll remotes for changes
        this.pollInterval = setInterval(() => this.checkRemotes(), 2000);
    }

    stop() {
        if (this.pollInterval) clearInterval(this.pollInterval);
    }

    private async checkRemotes() {
        for (const [name, url] of Object.entries(this.remotes)) {
            try {
                const manifestUrl = url.endsWith('.json') ? url : `${url}/remoteEntry.json`;
                // Add timestamp to avoid caching the manifest itself
                const resp = await fetch(`${manifestUrl}?t=${Date.now()}`);
                if (!resp.ok) continue;

                const manifest = await resp.json();
                const newHash = manifest.manifestHash;

                if (this.remoteHashes[name] && this.remoteHashes[name] !== newHash) {
                    log.info(`Remote ${name} changed, triggering update`, { category: 'hmr' });
                    this.broadcast(JSON.stringify({ type: 'federation-update', remote: name }));
                }
                this.remoteHashes[name] = newHash;
            } catch (e) {
                // Ignore errors during polling (remote might be down)
            }
        }
    }

    handleRequest(req: http.IncomingMessage, res: http.ServerResponse): boolean {
        // Mock Mode Endpoint
        // Client requests /__mock/remoteName/ModuleName
        if (this.config.federation?.mock && req.url?.startsWith('/__mock/')) {
            const parts = req.url.split('/');
            // /__mock/remote1/Button -> ["", "__mock", "remote1", "Button"]
            if (parts.length >= 4) {
                const componentName = parts[3];
                log.info(`Serving mock for ${componentName}`, { category: 'server' });

                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                // Return a simple React component stub
                // We assume React is available globally or imported
                // For a generic stub, we can try to be framework agnostic or assume React
                res.end(`
                    import React from 'react';
                    export default function Mock${componentName}(props) {
                        return React.createElement('div', { 
                            style: { border: '2px dashed #ff00ff', padding: '10px', color: '#ff00ff' } 
                        }, 'Mock: ${componentName}');
                    }
                `);
                return true;
            }
        }
        return false;
    }
}
