
import { BuildCache, CachedResult } from './types.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
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
    private db: any;
    private cacheDir: string;

    constructor(rootDir: string) {
        this.cacheDir = path.join(rootDir, '.nexxo_cache');
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        try {
            const Database = require('better-sqlite3');
            this.db = new Database(path.join(this.cacheDir, 'cache.db'));
            this.init();
        } catch (e) {
            console.warn('Could not initialize persistent cache (better-sqlite3 missing or incompatible). Falling back to memory.');
            this.db = null;
        }
    }

    private init() {
        if (!this.db) return;
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
    }

    get(key: string): CachedResult | null {
        if (!this.db) return null;
        const row = this.db.prepare('SELECT value FROM cache WHERE key = ?').get(key);
        if (row) {
            return JSON.parse(row.value);
        }
        return null;
    }

    set(key: string, value: CachedResult): void {
        if (!this.db) return;
        this.db.prepare('INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)').run(
            key,
            JSON.stringify(value)
        );
    }

    clear() {
        if (!this.db) return;
        this.db.prepare('DELETE FROM cache').run();
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
