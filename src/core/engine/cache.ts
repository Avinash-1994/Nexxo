
import { BuildCache, CachedResult } from './types.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { initCacheInBackground } from '../cache/lazy-init.js';
const require = createRequire(import.meta.url);

export class InMemoryBuildCache implements BuildCache {
    private store = new Map<string, CachedResult>();

    get(key: string): CachedResult | null {
        return this.store.get(key) || null;
    }

    set(key: string, value: CachedResult): void {
        this.store.set(key, value);
    }

    clear() {
        this.store.clear();
    }

    close() { }
}

export class PersistentBuildCache implements BuildCache {
    private cacheDir: string;
    private dbPromise: Promise<any> | null = null;

    constructor(rootDir: string) {
        this.cacheDir = path.join(rootDir, '.lunx_cache');
        initCacheInBackground(this.cacheDir);
    }

    private async getDb() {
        if (this.dbPromise) {
            return this.dbPromise;
        }

        this.dbPromise = (async () => {
            try {
                const { getLazyCacheDatabase } = await import('../cache/lazy-init.js');
                return await getLazyCacheDatabase(this.cacheDir);
            } catch (e: any) {
                // Fallback to Memory Cache on Lock Error (Robustness)
                if (e.message?.includes('Lock') || e.message?.includes('IO error') || e.message?.includes('Resource temporarily unavailable')) {
                    const { log } = await import('../../utils/logger.js');
                    log.warn(`Cache locked, falling back to in-memory cache: ${e.message}`, { category: 'cache' });

                    const store = new Map<string, string>();
                    return {
                        get: (k: string) => store.get(k),
                        set: (k: string, v: string) => store.set(k, v),
                        clearAll: () => store.clear(),
                        close: () => { }
                    };
                }
                throw e;
            }
        })();

        return this.dbPromise;
    }

    get(key: string): Promise<CachedResult | null> {
        return this.getAsync(key);
    }

    async getAsync(key: string): Promise<CachedResult | null> {
        const db = await this.getDb();
        const val = db.get(key);
        if (val) return JSON.parse(val);
        return null;
    }

    async set(key: string, value: CachedResult): Promise<void> {
        const db = await this.getDb();
        db.set(key, JSON.stringify(value));
    }

    async clear(): Promise<void> {
        const db = await this.getDb();
        db.clearAll();
    }

    async close(): Promise<void> {
        // Managed by global lazy cache
    }
}
