import { Database } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { log } from '../../utils/logger.js';

/**
 * Lazy RocksDB/SQLite Initialization for <200ms Cold Start
 * 
 * Strategy:
 * 1. Defer cache initialization until first use
 * 2. Load critical config synchronously
 * 3. Initialize cache in background
 * 4. Preload only essential data
 */

interface LazyInitOptions {
    cacheDir: string;
    preload?: boolean;
    warmup?: boolean;
}

export class LazyCacheInitializer {
    private db: Database | null = null;
    private initPromise: Promise<void> | null = null;
    private isInitialized = false;
    private cacheDir: string;
    private preload: boolean;
    private warmup: boolean;

    constructor(options: LazyInitOptions) {
        this.cacheDir = options.cacheDir;
        this.preload = options.preload ?? false;
        this.warmup = options.warmup ?? false;
    }

    /**
     * Get database instance - initializes lazily on first access
     */
    async getDatabase(): Promise<Database> {
        if (this.db) {
            return this.db;
        }

        if (this.initPromise) {
            await this.initPromise;
            return this.db!;
        }

        this.initPromise = this.initialize();
        await this.initPromise;
        return this.db!;
    }

    /**
     * Initialize cache in background (non-blocking)
     */
    initializeInBackground(): void {
        if (this.isInitialized || this.initPromise) {
            return;
        }

        // Start initialization but don't wait
        this.initPromise = this.initialize().catch(err => {
            log.warn(`Background cache init failed: ${err.message}`, { category: 'cache' });
        });
    }

    /**
     * Core initialization logic
     */
    private async initialize(): Promise<void> {
        const startTime = Date.now();

        try {
            // Ensure cache directory exists
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true });
            }

            const dbPath = path.join(this.cacheDir, 'cache.db');

            // Initialize SQLite with optimized settings for fast startup
            this.db = new (await import('better-sqlite3')).default(dbPath, {
                // Performance optimizations
                fileMustExist: false,
                timeout: 5000,
                verbose: process.env.DEBUG ? console.log : undefined,
            });

            // Apply PRAGMA optimizations for speed
            this.applyOptimizations();

            // Create tables if needed
            this.createTables();

            // Preload critical data if requested
            if (this.preload) {
                await this.preloadCriticalData();
            }

            // Warm up cache if requested
            if (this.warmup) {
                await this.warmupCache();
            }

            this.isInitialized = true;

            const duration = Date.now() - startTime;
            log.info(`Cache initialized in ${duration}ms`, { category: 'cache' });

        } catch (error: any) {
            log.error(`Cache initialization failed: ${error.message}`, { category: 'cache' });
            throw error;
        }
    }

    /**
     * Apply SQLite PRAGMA optimizations for fast startup
     */
    private applyOptimizations(): void {
        if (!this.db) return;

        // Journal mode for better concurrency
        this.db.pragma('journal_mode = WAL');

        // Synchronous mode for faster writes (less safe, but acceptable for cache)
        this.db.pragma('synchronous = NORMAL');

        // Memory-mapped I/O for faster reads
        this.db.pragma('mmap_size = 30000000000'); // 30GB

        // Larger page size for better performance
        this.db.pragma('page_size = 4096');

        // Larger cache size (in pages)
        this.db.pragma('cache_size = -64000'); // 64MB

        // Temp store in memory
        this.db.pragma('temp_store = MEMORY');

        // Optimize for speed over safety (cache can be rebuilt)
        this.db.pragma('locking_mode = EXCLUSIVE');
    }

    /**
     * Create necessary tables
     */
    private createTables(): void {
        if (!this.db) return;

        this.db.exec(`
      CREATE TABLE IF NOT EXISTS build_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        size INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON build_cache(timestamp);

      CREATE TABLE IF NOT EXISTS module_cache (
        path TEXT PRIMARY KEY,
        hash TEXT NOT NULL,
        dependencies TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_module_hash ON module_cache(hash);
    `);
    }

    /**
     * Preload critical data into memory
     */
    private async preloadCriticalData(): Promise<void> {
        if (!this.db) return;

        try {
            // Preload recent build cache entries
            const stmt = this.db.prepare(`
        SELECT key, value FROM build_cache 
        ORDER BY timestamp DESC 
        LIMIT 100
      `);

            const entries = stmt.all();
            log.info(`Preloaded ${entries.length} cache entries`, { category: 'cache' });

        } catch (error: any) {
            log.warn(`Preload failed: ${error.message}`, { category: 'cache' });
        }
    }

    /**
     * Warm up cache by running common queries
     */
    private async warmupCache(): Promise<void> {
        if (!this.db) return;

        try {
            // Run common queries to warm up SQLite cache
            this.db.prepare('SELECT COUNT(*) FROM build_cache').get();
            this.db.prepare('SELECT COUNT(*) FROM module_cache').get();

            log.info('Cache warmed up', { category: 'cache' });

        } catch (error: any) {
            log.warn(`Warmup failed: ${error.message}`, { category: 'cache' });
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): { buildCache: number; moduleCache: number; isInitialized: boolean } {
        if (!this.db || !this.isInitialized) {
            return { buildCache: 0, moduleCache: 0, isInitialized: false };
        }

        const buildCount = this.db.prepare('SELECT COUNT(*) as count FROM build_cache').get() as { count: number };
        const moduleCount = this.db.prepare('SELECT COUNT(*) as count FROM module_cache').get() as { count: number };

        return {
            buildCache: buildCount.count,
            moduleCache: moduleCount.count,
            isInitialized: this.isInitialized,
        };
    }

    /**
     * Close database connection
     */
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isInitialized = false;
            this.initPromise = null;
        }
    }

    /**
     * Check if cache is ready (non-blocking)
     */
    isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Wait for initialization to complete
     */
    async waitForInit(): Promise<void> {
        if (this.isInitialized) return;
        if (this.initPromise) {
            await this.initPromise;
        }
    }
}

/**
 * Global lazy cache instance
 */
let globalLazyCache: LazyCacheInitializer | null = null;

/**
 * Get or create global lazy cache instance
 */
export function getLazyCache(cacheDir?: string): LazyCacheInitializer {
    if (!globalLazyCache) {
        const dir = cacheDir || path.join(process.cwd(), 'node_modules', '.nexxo');
        globalLazyCache = new LazyCacheInitializer({
            cacheDir: dir,
            preload: process.env.NEXXO_PRELOAD === 'true',
            warmup: process.env.NEXXO_WARMUP === 'true',
        });
    }
    return globalLazyCache;
}

/**
 * Initialize cache in background (non-blocking for fast startup)
 */
export function initCacheInBackground(cacheDir?: string): void {
    const cache = getLazyCache(cacheDir);
    cache.initializeInBackground();
}

/**
 * Get database with lazy initialization
 */
export async function getLazyCacheDatabase(cacheDir?: string): Promise<Database> {
    const cache = getLazyCache(cacheDir);
    return cache.getDatabase();
}
