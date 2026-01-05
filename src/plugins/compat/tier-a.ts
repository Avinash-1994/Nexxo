/**
 * Tier-A Plugin Wrappers for Urja
 * 
 * These are pre-configured wrappers for popular Rollup plugins.
 * Users can import these directly or use the rollupAdapter for custom plugins.
 * 
 * Usage:
 * ```typescript
 * import { urjaBabel, urjaTerser } from 'urja/plugins/compat/tier-a';
 * 
 * export default {
 *   plugins: [
 *     urjaBabel({ presets: ['@babel/preset-react'] }),
 *     urjaTerser()
 *   ]
 * }
 * ```
 */

import { Plugin } from '../index.js';
import { rollupAdapter } from './rollup.js';

/**
 * Babel plugin wrapper
 * Requires: npm install @rollup/plugin-babel @babel/core
 */
export function urjaBabel(options: any = {}): Plugin {
    try {
        // Dynamic import to avoid hard dependency
        const babel = require('@rollup/plugin-babel');
        return rollupAdapter(babel.default ? babel.default(options) : babel(options));
    } catch (e) {
        console.warn('[@urja/babel] @rollup/plugin-babel not found. Install with: npm install @rollup/plugin-babel @babel/core');
        return {
            name: 'urja-babel-stub',
            transform: async (code) => code
        };
    }
}

/**
 * Terser (minification) plugin wrapper
 * Requires: npm install @rollup/plugin-terser
 */
export function urjaTerser(options: any = {}): Plugin {
    try {
        const terser = require('@rollup/plugin-terser');
        return rollupAdapter(terser.default ? terser.default(options) : terser(options));
    } catch (e) {
        console.warn('[@urja/terser] @rollup/plugin-terser not found. Install with: npm install @rollup/plugin-terser');
        return {
            name: 'urja-terser-stub',
            renderChunk: async (code) => code
        };
    }
}

/**
 * JSON plugin wrapper
 * Requires: npm install @rollup/plugin-json
 */
export function urjaJson(options: any = {}): Plugin {
    try {
        const json = require('@rollup/plugin-json');
        return rollupAdapter(json.default ? json.default(options) : json(options));
    } catch (e) {
        console.warn('[@urja/json] @rollup/plugin-json not found. Install with: npm install @rollup/plugin-json');
        // Provide basic fallback
        return {
            name: 'urja-json-fallback',
            transform(code, id) {
                if (id.endsWith('.json')) {
                    return `export default ${code}`;
                }
            }
        };
    }
}

/**
 * YAML plugin wrapper
 * Requires: npm install @rollup/plugin-yaml
 */
export function urjaYaml(options: any = {}): Plugin {
    try {
        const yaml = require('@rollup/plugin-yaml');
        return rollupAdapter(yaml.default ? yaml.default(options) : yaml(options));
    } catch (e) {
        console.warn('[@urja/yaml] @rollup/plugin-yaml not found. Install with: npm install @rollup/plugin-yaml');
        return {
            name: 'urja-yaml-stub',
            transform: async (code) => code
        };
    }
}

/**
 * MDX plugin wrapper
 * Requires: npm install @mdx-js/rollup
 */
export function urjaMdx(options: any = {}): Plugin {
    try {
        const mdx = require('@mdx-js/rollup');
        return rollupAdapter(mdx.default ? mdx.default(options) : mdx(options));
    } catch (e) {
        console.warn('[@urja/mdx] @mdx-js/rollup not found. Install with: npm install @mdx-js/rollup');
        return {
            name: 'urja-mdx-stub',
            transform: async (code) => code
        };
    }
}

/**
 * SVGR plugin wrapper (SVG to React components)
 * Requires: npm install rollup-plugin-svgr
 */
export function urjaSvgr(options: any = {}): Plugin {
    try {
        const svgr = require('rollup-plugin-svgr');
        return rollupAdapter(svgr.default ? svgr.default(options) : svgr(options));
    } catch (e) {
        console.warn('[@urja/svgr] rollup-plugin-svgr not found. Install with: npm install rollup-plugin-svgr');
        return {
            name: 'urja-svgr-stub',
            transform: async (code) => code
        };
    }
}

/**
 * Export all Tier-A plugins
 */
export const TierA = {
    babel: urjaBabel,
    terser: urjaTerser,
    json: urjaJson,
    yaml: urjaYaml,
    mdx: urjaMdx,
    svgr: urjaSvgr
};
