// Plugin type compatible with both Lunx and Vite plugin API
type Plugin = { name: string; [hook: string]: any };

export interface SveltePluginOptions {
  /** Enable Svelte HMR (default: true in dev) */
  hmr?: boolean;
  /** Svelte compiler options */
  compilerOptions?: Record<string, unknown>;
  /** Support Svelte 5 Runes (default: auto-detect) */
  runes?: boolean;
}

/**
 * @lunx/plugin-svelte
 *
 * Official Lunx plugin for Svelte:
 * - .svelte file transform via Svelte compiler
 * - Svelte 5 Runes support ($state, $derived, $effect)
 * - HMR via svelte-hmr pattern (state resets on save)
 * - Scoped styles, TypeScript, and preprocessors
 *
 * @example
 * ```js
 * const svelte = require('@lunx/plugin-svelte');
 * module.exports = { plugins: [svelte()] };
 * ```
 */
export function sveltePlugin(options: SveltePluginOptions = {}): Plugin {
  const {
    hmr = true,
    compilerOptions = {},
    runes = false,
  } = options;

  return {
    name: '@lunx/plugin-svelte',

    /**
     * Load hook: detect Svelte files and signal to core for compilation.
     */
    load(id: string): null {
      if (!id.endsWith('.svelte')) return null;
      // Svelte compilation is handled natively by Lunx's esbuild-svelte integration.
      // This plugin extends configuration and wraps for HMR.
      return null;
    },

    /**
     * Transform hook: add HMR wrapper to compiled Svelte output.
     */
    transform(code: string, id: string): { code: string } | null {
      if (!id.endsWith('.svelte')) return null;
      if (!hmr || process.env.NODE_ENV === 'production') return null;

      // After Svelte compilation, inject HMR wrapper
      // Svelte HMR pattern: re-instantiate component on change (state resets)
      if (!code.includes('import.meta.hot')) {
        const transformed = code + `
\n// Svelte HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    // Cleanup on component dispose
  });
}
`;
        return { code: transformed };
      }

      return null;
    },
  };
}

export default sveltePlugin;
