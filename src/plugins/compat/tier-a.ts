/**
 * Tier-A Plugin Wrappers for Nexxo
 * 
 * These are pre-configured wrappers for popular Rollup plugins.
 * Users can import these directly or use the rollupAdapter for custom plugins.
 * 
 * Usage:
 * ```typescript
 * import { nexxoBabel, nexxoTerser } from 'nexxo/plugins/compat/tier-a';
 * 
 * export default {
 *   plugins: [
 *     nexxoBabel({ presets: ['@babel/preset-react'] }),
 *     nexxoTerser()
 *   ]
 * }
 * ```
 */

import { Plugin } from '../index.js';
import { rollupAdapter } from './rollup.js';

function createStub(name: string): Plugin {
    return {
        name,
        async transform(code: string) {
            return code;
        }
    };
}

/**
 * Babel plugin wrapper
 * Requires: npm install @rollup/plugin-babel @babel/core
 */
export function nexxoBabel(options: any = {}): Plugin {
    try {
        // Dynamic import to avoid hard dependency
        const babel = require('@rollup/plugin-babel');
        return rollupAdapter(babel.default ? babel.default(options) : babel(options));
    } catch (e) {
        console.warn('[@nexxo/babel] @rollup/plugin-babel not found. Install with: npm install @rollup/plugin-babel @babel/core');
        return createStub('nexxo-babel-stub');
    }
}

/**
 * Terser (minification) plugin wrapper
 * Requires: npm install @rollup/plugin-terser
 */
export function nexxoTerser(options: any = {}): Plugin {
    try {
        const terser = require('@rollup/plugin-terser');
        return rollupAdapter(terser.default ? terser.default(options) : terser(options));
    } catch (e) {
        console.warn('[@nexxo/terser] @rollup/plugin-terser not found. Install with: npm install @rollup/plugin-terser');
        return createStub('nexxo-terser-stub');
    }
}

/**
 * JSON plugin wrapper
 * Requires: npm install @rollup/plugin-json
 */
export function nexxoJson(options: any = {}): Plugin {
    try {
        const json = require('@rollup/plugin-json');
        return rollupAdapter(json.default ? json.default(options) : json(options));
    } catch (e) {
        console.warn('[@nexxo/json] @rollup/plugin-json not found. Install with: npm install @rollup/plugin-json');
        // Provide basic fallback
        return {
            name: 'nexxo-json-fallback',
            async transform(code: string, id: string) {
                if (id.endsWith('.json')) {
                    return `export default ${code}`;
                }
                return undefined;
            }
        };
    }
}

/**
 * YAML plugin wrapper
 * Requires: npm install @rollup/plugin-yaml
 */
export function nexxoYaml(options: any = {}): Plugin {
    try {
        const yaml = require('@rollup/plugin-yaml');
        return rollupAdapter(yaml.default ? yaml.default(options) : yaml(options));
    } catch (e) {
        console.warn('[@nexxo/yaml] @rollup/plugin-yaml not found. Install with: npm install @rollup/plugin-yaml');
        return createStub('nexxo-yaml-stub');
    }
}

/**
 * MDX plugin wrapper
 * Requires: npm install @mdx-js/rollup
 */
export function nexxoMdx(options: any = {}): Plugin {
    try {
        const mdx = require('@mdx-js/rollup');
        return rollupAdapter(mdx.default ? mdx.default(options) : mdx(options));
    } catch (e) {
        console.warn('[@nexxo/mdx] @mdx-js/rollup not found. Install with: npm install @mdx-js/rollup');
        return createStub('nexxo-mdx-stub');
    }
}

/**
 * SVGR plugin wrapper (SVG to React components)
 * Requires: npm install rollup-plugin-svgr
 */
export function nexxoSvgr(options: any = {}): Plugin {
    try {
        const svgr = require('rollup-plugin-svgr');
        return rollupAdapter(svgr.default ? svgr.default(options) : svgr(options));
    } catch (e) {
        console.warn('[@nexxo/svgr] rollup-plugin-svgr not found. Install with: npm install rollup-plugin-svgr');
        return createStub('nexxo-svgr-stub');
    }
}

/**
 * Export all Tier-A plugins
 */
export const TierA = {
    babel: nexxoBabel,
    terser: nexxoTerser,
    json: nexxoJson,
    yaml: nexxoYaml,
    mdx: nexxoMdx,
    svgr: nexxoSvgr
};
