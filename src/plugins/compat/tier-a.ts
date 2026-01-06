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

import { UrjaPlugin, PluginHookName, PluginManifest } from '../../core/plugins/types.js';
import { canonicalHash } from '../../core/engine/hash.js';
import { rollupAdapter } from './rollup.js';

function createStub(name: string, hookName?: PluginHookName, handler?: (input: any) => Promise<any>): UrjaPlugin {
    const hooks: PluginHookName[] = hookName ? [hookName] : [];
    const manifest: PluginManifest = {
        name,
        version: '0.0.0',
        engineVersion: '1.0.0',
        type: 'js',
        hooks,
        permissions: {}
    };
    return {
        manifest,
        id: canonicalHash(name + '0.0.0'),
        async runHook(h, input) {
            if (h === hookName && handler) {
                return handler(input);
            }
            return input;
        }
    };
}

/**
 * Babel plugin wrapper
 * Requires: npm install @rollup/plugin-babel @babel/core
 */
export function urjaBabel(options: any = {}): UrjaPlugin {
    try {
        // Dynamic import to avoid hard dependency
        const babel = require('@rollup/plugin-babel');
        return rollupAdapter(babel.default ? babel.default(options) : babel(options));
    } catch (e) {
        console.warn('[@urja/babel] @rollup/plugin-babel not found. Install with: npm install @rollup/plugin-babel @babel/core');
        return createStub('urja-babel-stub', 'transformModule', async ({ code }) => ({ code }));
    }
}

/**
 * Terser (minification) plugin wrapper
 * Requires: npm install @rollup/plugin-terser
 */
export function urjaTerser(options: any = {}): UrjaPlugin {
    try {
        const terser = require('@rollup/plugin-terser');
        return rollupAdapter(terser.default ? terser.default(options) : terser(options));
    } catch (e) {
        console.warn('[@urja/terser] @rollup/plugin-terser not found. Install with: npm install @rollup/plugin-terser');
        return createStub('urja-terser-stub', 'renderChunk', async (input) => input);
    }
}

/**
 * JSON plugin wrapper
 * Requires: npm install @rollup/plugin-json
 */
export function urjaJson(options: any = {}): UrjaPlugin {
    try {
        const json = require('@rollup/plugin-json');
        return rollupAdapter(json.default ? json.default(options) : json(options));
    } catch (e) {
        console.warn('[@urja/json] @rollup/plugin-json not found. Install with: npm install @rollup/plugin-json');
        // Provide basic fallback
        return {
            manifest: {
                name: 'urja-json-fallback',
                version: '0.0.0',
                engineVersion: '1.0.0',
                type: 'js',
                hooks: ['transformModule'],
                permissions: {}
            },
            id: canonicalHash('urja-json-fallback'),
            async runHook(hook, input) {
                if (hook === 'transformModule') {
                    const { code, id } = input;
                    if (id.endsWith('.json')) {
                        return { code: `export default ${code}` };
                    }
                }
                return input;
            }
        };
    }
}

/**
 * YAML plugin wrapper
 * Requires: npm install @rollup/plugin-yaml
 */
export function urjaYaml(options: any = {}): UrjaPlugin {
    try {
        const yaml = require('@rollup/plugin-yaml');
        return rollupAdapter(yaml.default ? yaml.default(options) : yaml(options));
    } catch (e) {
        console.warn('[@urja/yaml] @rollup/plugin-yaml not found. Install with: npm install @rollup/plugin-yaml');
        return createStub('urja-yaml-stub', 'transformModule', async ({ code }) => ({ code }));
    }
}

/**
 * MDX plugin wrapper
 * Requires: npm install @mdx-js/rollup
 */
export function urjaMdx(options: any = {}): UrjaPlugin {
    try {
        const mdx = require('@mdx-js/rollup');
        return rollupAdapter(mdx.default ? mdx.default(options) : mdx(options));
    } catch (e) {
        console.warn('[@urja/mdx] @mdx-js/rollup not found. Install with: npm install @mdx-js/rollup');
        return createStub('urja-mdx-stub', 'transformModule', async ({ code }) => ({ code }));
    }
}

/**
 * SVGR plugin wrapper (SVG to React components)
 * Requires: npm install rollup-plugin-svgr
 */
export function urjaSvgr(options: any = {}): UrjaPlugin {
    try {
        const svgr = require('rollup-plugin-svgr');
        return rollupAdapter(svgr.default ? svgr.default(options) : svgr(options));
    } catch (e) {
        console.warn('[@urja/svgr] rollup-plugin-svgr not found. Install with: npm install rollup-plugin-svgr');
        return createStub('urja-svgr-stub', 'transformModule', async ({ code }) => ({ code }));
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
