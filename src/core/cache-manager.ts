
/**
 * RocksDB Cache Manager
 * Day 6: Module 1 - Speed Mastery
 * 
 * Provides a high-level interface for the persistent RocksDB cache.
 * Manages cache partitions (Parse, Transform, Bundle) and enforces policies.
 */

import { BuildCache, createInputKey, createGraphKey, createPlanKey, createArtifactKey } from '../native/cache.js';
import { log } from '../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';

export type CacheCategory = 'parse' | 'transform' | 'bundle' | 'optimize' | 'meta';

export interface CacheOptions {
    enabled: boolean;
    root: string;
    compression?: boolean; // LZ4 enabled by default in native
    maxSizeBytes?: number; // Eviction policy trigger
}

export class CacheManager {
    private cache: BuildCache | null = null;
    private enabled: boolean;
    private root: string;
    private maxSizeBytes: number;

    constructor(options: CacheOptions) {
        this.enabled = options.enabled;
        this.root = options.root;
        this.maxSizeBytes = options.maxSizeBytes || 512 * 1024 * 1024; // 512MB default

        if (this.enabled) {
            this.init();
        }
    }

    private init() {
        try {
            const cachePath = path.join(this.root, '.nexxo_cache');
            this.cache = new BuildCache(cachePath);
            log.info(`🚀 Initialized RocksDB Cache at ${cachePath}`);
        } catch (error) {
            log.warn('Failed to initialize RocksDB cache, falling back to in-memory:', error);
            this.enabled = false;
        }
    }

    /**
     * Get a cached result
     */
    get(category: CacheCategory, key: string): string | null {
        if (!this.enabled || !this.cache) return null;
        try {
            return this.cache.get(`${category}:${key}`);
        } catch (e) {
            return null;
        }
    }

    /**
     * Set a cached result
     */
    set(category: CacheCategory, key: string, value: string) {
        if (!this.enabled || !this.cache) return;
        // Fire and forget, don't await I/O
        try {
            this.cache.set(`${category}:${key}`, value);
        } catch (e) {
            // ignore
        }
    }

    /**
     * Check existence
     */
    has(category: CacheCategory, key: string): boolean {
        if (!this.enabled || !this.cache) return false;
        return this.cache.has(`${category}:${key}`);
    }

    /**
     * Batch write (useful for warmup)
     */
    batchSet(entries: Record<string, string>, category: CacheCategory) {
        if (!this.enabled || !this.cache) return;
        const prefixed: Record<string, string> = {};
        for (const [k, v] of Object.entries(entries)) {
            prefixed[`${category}:${k}`] = v;
        }
        this.cache.batchSet(prefixed);
    }

    /**
     * Enforce cache policies (Compaction, Eviction simulation)
     */
    async enforcePolicy() {
        if (!this.enabled || !this.cache) return;

        try {
            const stats = this.cache.getStats();
            // log.debug('Cache Stats:', stats);

            // 1. Compaction
            // RocksDB does auto-compaction, but we can trigger it manually if fragmentation is high
            // For now, we just call it periodically or on shutdown
            // this.cache.compact(); // Expensive, maybe only do rarely?

            // 2. Eviction (Size limit)
            if (stats.sizeBytes > this.maxSizeBytes) {
                log.warn(`Cache size (${(stats.sizeBytes / 1024 / 1024).toFixed(2)}MB) exceeds limit. Clearing...`);
                // Simple strategy: Clear everything or specific targets. 
                // RocksDB makes LRU hard without column families or manual tracking.
                // We'll clear 'dev' builds first, preserving 'prod'.
                const initialSize = stats.totalEntries;
                const cleared = this.cache.clearTarget('dev:');
                log.info(`Evicted ${cleared} dev entries.`);

                // If still too big, compact
                this.cache.compact();
            }
        } catch (e) {
            log.error('Cache policy enforcement failed:', e);
        }
    }

    getStats() {
        if (!this.enabled || !this.cache) return { hitRate: 0, sizeBytes: 0, hits: 0, misses: 0 };
        return this.cache.getStats();
    }

    close() {
        if (this.cache) {
            this.cache.close();
            this.cache = null;
        }
    }
}

// Global instance helper
let _instance: CacheManager | null = null;
export function getCacheManager(root: string = process.cwd()): CacheManager {
    if (!_instance) {
        _instance = new CacheManager({
            enabled: true,
            root
        });
    }
    return _instance;
}
