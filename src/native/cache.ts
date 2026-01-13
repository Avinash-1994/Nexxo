// TypeScript bindings for Nexxo v2.0 native modules
// Day 2: Tokio Orchestrator & RocksDB Cache

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nativeModule = require('../../nexxo_native.node');

const { BuildCache: NativeBuildCache } = nativeModule;

import type { BuildCache as NativeBuildCacheType, CacheStats } from '../../nexxo_native.node';

export { CacheStats };

/**
 * RocksDB-based persistent build cache
 * 
 * Features:
 * - LSM tree architecture for efficient writes
 * - Automatic compaction and cleanup
 * - Multi-target support (dev/prod/lib)
 * - Cache warming and invalidation
 * 
 * @example
 * ```ts
 * const cache = new BuildCache('.nexxo_cache');
 * 
 * // Set a value
 * cache.set('input:src/App.tsx:abc123', JSON.stringify(transformResult));
 * 
 * // Get a value
 * const cached = cache.get('input:src/App.tsx:abc123');
 * 
 * // Get statistics
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 * ```
 */
export class BuildCache {
    private cache: NativeBuildCacheType;

    constructor(cachePath: string) {
        this.cache = new NativeBuildCache(cachePath);
    }

    /**
     * Get a value from the cache
     */
    get(key: string): string | null {
        return this.cache.get(key) || null;
    }

    /**
     * Set a value in the cache
     */
    set(key: string, value: string): void {
        this.cache.set(key, value);
    }

    /**
     * Delete a value from the cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Check if a key exists in the cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Batch set multiple key-value pairs
     */
    batchSet(entries: Record<string, string>): void {
        this.cache.batchSet(entries);
    }

    /**
     * Clear all entries for a specific target (dev/prod/lib)
     */
    clearTarget(target: 'dev' | 'prod' | 'lib'): number {
        return this.cache.clearTarget(target);
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        this.cache.clearAll();
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return this.cache.getStats();
    }

    /**
     * Compact the database to reclaim space
     */
    compact(): void {
        this.cache.compact();
    }

    /**
     * Close the cache (cleanup)
     */
    close(): void {
        this.cache.close();
    }
}

/**
 * Create cache key for input fingerprint
 */
export function createInputKey(filePath: string, contentHash: string): string {
    return `input:${filePath}:${contentHash}`;
}

/**
 * Create cache key for graph hash
 */
export function createGraphKey(graphHash: string): string {
    return `graph:${graphHash}`;
}

/**
 * Create cache key for plan hash
 */
export function createPlanKey(planHash: string, target: string): string {
    return `plan:${target}:${planHash}`;
}

/**
 * Create cache key for artifact
 */
export function createArtifactKey(artifactId: string, target: string): string {
    return `artifact:${target}:${artifactId}`;
}
