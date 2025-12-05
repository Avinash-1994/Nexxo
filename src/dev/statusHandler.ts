import http from 'http';
import { log } from '../utils/logger.js';

export class StatusHandler {
    private startTime = Date.now();
    private requestCount = 0;
    private hmrPatches = 0;

    constructor() {
        // Start memory monitor
        setInterval(() => this.checkMemory(), 30000);
    }

    trackRequest() {
        this.requestCount++;
    }

    trackHMR() {
        this.hmrPatches++;
    }

    async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (req.url === '/__nextgen/status') {
            const stats = {
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                memory: process.memoryUsage(),
                requests: this.requestCount,
                hmrPatches: this.hmrPatches,
                pid: process.pid
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stats, null, 2));
            return true;
        }
        return false;
    }

    private checkMemory() {
        const mem = process.memoryUsage();
        const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);

        // Warn if heap usage > 800MB (arbitrary limit for dev server)
        if (heapUsedMB > 800) {
            log.warn(`High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`, { category: 'audit' });
            if (global.gc) {
                log.info('Triggering Garbage Collection', { category: 'audit' });
                global.gc();
            }
        }
    }
}
