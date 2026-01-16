
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
    private db: any = null;
    private cacheDir: string;
    private initialized = false;

    constructor(rootDir: string) {
        this.cacheDir = path.join(rootDir, '.nexxo_cache');
        // Don't initialize DB here - lazy init on first use for faster cold start
    }

    private ensureInitialized() {
        if (this.initialized) return;

        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        try {
            const Database = require('better-sqlite3');
            this.db = new Database(path.join(this.cacheDir, 'cache.db'));
            this.init();
            this.initialized = true;
        } catch (e) {
            console.warn('Could not initialize persistent cache (better-sqlite3 missing or incompatible). Falling back to memory.');
            this.db = null;
            this.initialized = true; // Mark as initialized to avoid retrying
        }
    }

    private init() {
        if (!this.db) return;

        // Apply PRAGMA optimizations for faster startup and better performance
        try {
            // WAL mode for better concurrency
            this.db.pragma('journal_mode = WAL');

            // NORMAL synchronous for faster writes (acceptable for cache)
            this.db.pragma('synchronous = NORMAL');

            // Memory-mapped I/O for faster reads
            this.db.pragma('mmap_size = 30000000000'); // 30GB

            // Larger page size
            this.db.pragma('page_size = 4096');

            // Larger cache size (64MB)
            this.db.pragma('cache_size = -64000');

            // Temp store in memory
            this.db.pragma('temp_store = MEMORY');

            // Exclusive locking for single-process use
            this.db.pragma('locking_mode = EXCLUSIVE');
        } catch (e) {
            // Ignore PRAGMA errors on older SQLite versions
        }

        // Create tables with indexes
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT,
                timestamp INTEGER DEFAULT (strftime('%s', 'now'))
            );
            
            CREATE INDEX IF NOT EXISTS idx_timestamp ON cache(timestamp);
        `);
    }

    get(key: string): CachedResult | null {
        this.ensureInitialized(); // Lazy init
        if (!this.db) return null;
        const row = this.db.prepare('SELECT value FROM cache WHERE key = ?').get(key);
        if (row) {
            return JSON.parse(row.value);
        }
        return null;
    }

    set(key: string, value: CachedResult): void {
        this.ensureInitialized(); // Lazy init
        if (!this.db) return;
        this.db.prepare('INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)').run(
            key,
            JSON.stringify(value)
        );
    }

    clear() {
        this.ensureInitialized(); // Lazy init
        if (!this.db) return;
        this.db.prepare('DELETE FROM cache').run();
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        this.initialized = false;
    }
}
