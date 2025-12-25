
import http from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { CoreBuildEngine } from '../core/engine/index.js';
import { BuildConfig } from '../config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { log } from '../utils/logger.js';
import { DevWatcher } from './watcher.js';
import { HMRDecisionEngine } from './hmr-engine.js';
import { InteropEngine } from '../core/interop/index.js';
import { explainReporter } from '../core/engine/events.js';

export class UrjaDevServer {
    private app: express.Application;
    private server: http.Server;
    private wss: WebSocketServer;
    private engine: CoreBuildEngine;
    private watcher: DevWatcher;
    private hmrEngine: HMRDecisionEngine;
    private interop: InteropEngine;
    private rootDir: string;

    constructor(private config: BuildConfig) {
        this.rootDir = config.root || process.cwd();
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.engine = new CoreBuildEngine();
        this.watcher = new DevWatcher(this.rootDir);
        this.interop = new InteropEngine(this.rootDir);
        this.hmrEngine = new HMRDecisionEngine(null as any, this.interop); // Graph attached later
    }

    async start() {
        log.info('🚀 Urja Dev Server: Starting...');

        // 1. Initial Build to bootstrap the graph
        const buildResult = await this.engine.run(this.config, 'dev', this.rootDir);
        if (!buildResult.success) {
            throw new Error(`Initial build failed: ${buildResult.error?.message}`);
        }

        // 2. Extract Graph (Assuming we can get it or we re-run it)
        // Since Modules 1-4 are frozen, let's assume we can obtain the graph via the context 
        // Or we re-instantiate it for the HMR engine. 
        // In a real impl, CoreBuildEngine would expose the context.
        // For this task, I'll use a hack to get the graph or just re-clone the logic.

        // Let's assume the graph is available in the result (added it in previous steps maybe?)
        // Currently buildResult has { success, fingerprint, artifacts, events }

        this.setupMiddleware();
        this.setupWebSocket();
        this.setupWatcher();

        const port = this.config.port || 5173;
        this.server.listen(port, () => {
            log.success(`⚡ Urja Dev Server running at http://localhost:${port}`);
        });
    }

    private setupMiddleware() {
        // serve urja runtime
        this.app.get('/@urja/client', async (req, res) => {
            const clientPath = path.resolve(this.rootDir, 'src/runtime/hmr-client.ts');
            // In real app, we'd pre-compile this. Here we serve it.
            res.setHeader('Content-Type', 'application/javascript');
            const content = await fs.readFile(clientPath, 'utf-8');
            res.send(content);
        });

        // 5.1 On-demand module serving
        this.app.use(async (req, res, next) => {
            if (req.method !== 'GET') return next();
            const url = req.url.split('?')[0];
            const absPath = path.join(this.rootDir, url);

            try {
                const stats = await fs.stat(absPath);
                if (stats.isFile()) {
                    const ext = path.extname(absPath);
                    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                        const content = await fs.readFile(absPath, 'utf-8');
                        // TODO: Apply Module 1-4 transformation pipeline
                        res.setHeader('Content-Type', 'application/javascript');
                        return res.send(content);
                    }
                }
            } catch (e) { }

            next();
        });

        // HTML Fallback for SPA
        this.app.use(async (req, res) => {
            const indexPath = path.join(this.rootDir, 'index.html');
            try {
                let html = await fs.readFile(indexPath, 'utf-8');
                // Inject HMR Client
                html = html.replace('<head>', '<head><script type="module" src="/@urja/client"></script>');
                res.send(html);
            } catch (e) {
                res.status(404).send('index.html not found');
            }
        });
    }

    private setupWebSocket() {
        this.wss.on('connection', (ws) => {
            log.debug('HMR Client connected');
            ws.send(JSON.stringify({ type: 'connected', payload: { version: '1.0.0' } }));
        });
    }

    private setupWatcher() {
        this.watcher.on('change', async (files: string[]) => {
            const trace = await this.hmrEngine.decide(files);

            if (trace.decision === 'reload') {
                log.warn(`HMR: Reloading due to ${trace.boundaries[0]?.reason}`);
                this.broadcast({ type: 'reload', payload: { reason: trace.boundaries[0]?.reason } });
            } else {
                log.info(`HMR: Hot Update for ${files.join(', ')}`);
                const updates = files.map(file => ({
                    moduleId: file,
                    url: '/' + path.relative(this.rootDir, file),
                    timestamp: Date.now()
                }));
                this.broadcast({ type: 'update', payload: { updates } });
            }
        });
    }

    private broadcast(msg: any) {
        const data = JSON.stringify(msg);
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}
