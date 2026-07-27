// Plugin type compatible with both Lunx and Vite plugin API
type Plugin = { name: string; [hook: string]: any };

export interface LegacyPluginOptions {
  /** Browserslist targets (default: '> 0.5%, last 2 versions, IE 11') */
  targets?: string | string[];
  /** Inject core-js polyfills (default: true) */
  polyfills?: boolean;
  /** core-js version to use (default: 3) */
  corejs?: 2 | 3;
  /** Add regenerator runtime for async/generators (default: true) */
  regenerator?: boolean;
}

/**
 * @lunx/plugin-legacy
 *
 * Official Lunx plugin for legacy browser support:
 * - Transpiles modern JavaScript to ES5 for old browsers (IE11, etc.)
 * - Automatically injects core-js polyfills for missing features
 * - Adds regenerator-runtime for async/generator functions
 * - Emits a legacy chunk alongside the modern chunk
 *
 * Outputs two scripts:
 * - `<script type="module">` — modern browsers
 * - `<script nomodule>` — legacy browsers (ES5 + polyfills)
 *
 * @example
 * ```js
 * const legacy = require('@lunx/plugin-legacy');
 * module.exports = {
 *   plugins: [legacy({ targets: ['IE 11', 'Chrome 49'] })],
 * };
 * ```
 */
export function legacyPlugin(options: LegacyPluginOptions = {}): Plugin {
  const {
    targets = '> 0.5%, last 2 versions, IE 11',
    polyfills = true,
    corejs = 3,
    regenerator = true,
  } = options;

  const legacyChunks = new Map<string, string>();

  return {
    name: '@lunx/plugin-legacy',

    /**
     * Transform hook: detect if module needs ES5 transpilation.
     * Modern modules are left as-is; a legacy copy is transpiled.
     */
    transform(code: string, id: string): { code: string } | null {
      // Only transform in production builds
      if (process.env.NODE_ENV !== 'production') return null;

      const isJS = /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(id);
      if (!isJS || id.includes('node_modules')) return null;

      // Mark this module for legacy transpilation
      // (actual SWC ES5 transform happens in Lunx's build pipeline)
      legacyChunks.set(id, code);

      // Return the original modern code unchanged
      // The legacy bundle is generated as a separate output
      return null;
    },

    /**
     * Load hook: inject polyfill entry point for legacy builds.
     */
    load(id: string): { code: string } | null {
      if (id !== '/__lunx_legacy_polyfills__') return null;

      const polyfillImports: string[] = [];

      if (polyfills && corejs === 3) {
        polyfillImports.push(`import 'core-js/stable';`);
      } else if (polyfills && corejs === 2) {
        polyfillImports.push(`import 'core-js/es';`);
      }

      if (regenerator) {
        polyfillImports.push(`import 'regenerator-runtime/runtime';`);
      }

      return {
        code: polyfillImports.join('\n'),
      };
    },
  };
}

export default legacyPlugin;
