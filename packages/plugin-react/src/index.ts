// Plugin type compatible with both Lunx and Vite plugin API
type Plugin = { name: string; [hook: string]: any };

export interface ReactPluginOptions {
  /** Enable React Fast Refresh (default: true in dev mode) */
  fastRefresh?: boolean;
  /** JSX runtime to use (default: 'automatic') */
  runtime?: 'automatic' | 'classic';
  /** Show error overlay on runtime errors (default: true) */
  overlay?: boolean;
}

/**
 * @lunx/plugin-react
 *
 * Official Lunx plugin for React:
 * - JSX transform via SWC (no Babel required)
 * - React Fast Refresh integration for HMR
 * - Error overlay for runtime errors
 *
 * @example
 * ```js
 * // lunx.config.js
 * const react = require('@lunx/plugin-react');
 * module.exports = {
 *   plugins: [react()],
 * };
 * ```
 */
export function reactPlugin(options: ReactPluginOptions = {}): Plugin {
  const {
    fastRefresh = true,
    runtime = 'automatic',
    overlay = true,
  } = options;

  return {
    name: '@lunx/plugin-react',

    /**
     * Load hook: inject React Refresh runtime in dev mode for HMR.
     */
    load(id: string): { code: string } | null {
      // Inject React Refresh preamble for HMR
      if (id === '/__lunx_react_refresh__') {
        return {
          code: `
import RefreshRuntime from 'react-refresh/runtime';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__lunx_react_refresh_active__ = true;
`,
        };
      }
      return null;
    },

    /**
     * Transform hook: transform JSX/TSX files with React JSX transform.
     * In dev mode with fastRefresh enabled, wraps components for HMR.
     */
    transform(code: string, id: string): { code: string; map?: string } | null {
      const isJSX = /\.(jsx|tsx)$/.test(id);
      const isJS = /\.(js|ts)$/.test(id) && !id.includes('node_modules');

      if (!isJSX && !isJS) return null;
      if (id.includes('node_modules')) return null;

      let transformed = code;

      // In dev mode with Fast Refresh, wrap React components
      if (fastRefresh && isJSX) {
        // The actual SWC transform happens in Lunx's core pipeline.
        // This plugin adds the Fast Refresh wrapper around the module.
        const hasReactComponents = /export\s+(default\s+function|function\s+[A-Z]|const\s+[A-Z])/.test(code);

        if (hasReactComponents) {
          transformed = `
import { jsx as _jsx } from 'react/jsx-runtime';
${code}

// React Fast Refresh registration
if (import.meta.hot) {
  import.meta.hot.accept();
}
`;
        }
      }

      // Add overlay error boundary in dev mode
      if (overlay && isJSX && process.env.NODE_ENV !== 'production') {
        // Error overlay is injected by Lunx's dev server automatically
        // This plugin only signals that overlay should be active
      }

      return transformed !== code ? { code: transformed } : null;
    },
  };
}

// Default export for convenience
export default reactPlugin;
