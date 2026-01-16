/**
 * Minimal Dev Server - <200ms Cold Start
 * 
 * Strategy: Start HTTP server IMMEDIATELY, load features on-demand
 */

import http from 'http';
import path from 'path';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';

// Feature modules (loaded lazily)
let features: any = null;
let isInitializing = false;

/**
 * Start dev server with <200ms cold start
 */
export async function startDevServer(cfg: BuildConfig) {
    const startTime = Date.now();

    // 1. Load env vars ONLY (fast - ~10ms)
    const { config: loadEnv } = await import('dotenv');
    loadEnv({ path: path.join(cfg.root, '.env') });
    loadEnv({ path: path.join(cfg.root, '.env.local') });

    // 2. Get port (fast - ~5ms)
    let port = cfg.server?.port || cfg.port || 5173;
    const host = cfg.server?.host || 'localhost';

    // Dynamic port detection
    if (!cfg.server?.strictPort) {
        port = await findAvailablePort(port, host);
    }

    // 3. Create minimal HTTP server (fast - ~20ms)
    const server = http.createServer(async (req, res) => {
        // Load features on first request if not loaded
        if (!features && !isInitializing) {
            isInitializing = true;
            features = await loadFeatures(cfg);
        }

        // Wait for features if still loading
        while (!features) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Handle request with full features
        await features.handleRequest(req, res, cfg);
    });

    // 4. Start listening IMMEDIATELY (fast - ~10ms)
    await new Promise<void>((resolve) => {
        server.listen(port, host, () => {
            const duration = Date.now() - startTime;
            log.info(`✅ Server ready at http://${host}:${port} (${duration}ms)`, { category: 'server' });
            resolve();
        });
    });

    // 5. Load features in background (non-blocking)
    setImmediate(async () => {
        if (!features) {
            isInitializing = true;
            features = await loadFeatures(cfg);
            log.info('✅ Features loaded', { category: 'server' });
        }
    });

    return server;
}

/**
 * Load all features (heavy initialization)
 */
async function loadFeatures(cfg: BuildConfig) {
    log.info('Loading features...', { category: 'server' });

    // Import the full dev server module
    const fullServer = await import('./devServer.full.js');
    return fullServer;
}

/**
 * Check if port is available
 */
async function isPortAvailable(port: number, host: string): Promise<boolean> {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.on('error', () => resolve(false));
        server.listen(port, host, () => {
            server.close(() => resolve(true));
        });
    });
}

/**
 * Find available port
 */
async function findAvailablePort(startPort: number, host: string): Promise<number> {
    let port = startPort;
    while (!(await isPortAvailable(port, host))) {
        port++;
        if (port > startPort + 100) {
            throw new Error(`No available port found`);
        }
    }
    return port;
}
