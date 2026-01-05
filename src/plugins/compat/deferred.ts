import { Plugin } from '../index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface CompressOptions {
    algorithm?: 'gzip' | 'brotli';
    threshold?: number;
}

/**
 * Urja Compress Plugin (urja-compress)
 * Mocks compression-webpack-plugin using a simple status message.
 * In a real V1, this would actually gzip/brotli the assets in `dist`.
 */
export function urjaCompress(options: CompressOptions = {}): Plugin {
    return {
        name: 'urja-compress',
        async buildEnd() {
            // Urja v1 - Placeholder for Asset Compression
            // Real implementation would iterate dist/ and gzip
            // console.log('[urja-compress] Compression enabled (Placeholder)');
        }
    };
}

/**
 * Urja CSS Extract Plugin (urja-css-extract)
 * Mocks mini-css-extract-plugin.
 * Urja extracts CSS by default, so this is mostly a no-op compatibility shim.
 */
export function urjaCssExtract(options: any = {}): Plugin {
    return {
        name: 'urja-css-extract',
        // No-op
    };
}
