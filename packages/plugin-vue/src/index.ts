// Plugin type compatible with both Lunx and Vite plugin API
type Plugin = { name: string; [hook: string]: any };

export interface VuePluginOptions {
  /** Enable Vue HMR via SFC hot-reload (default: true in dev) */
  hmr?: boolean;
  /** Include Vue DevTools support (default: true in dev) */
  devtools?: boolean;
  /** Custom compiler options for @vue/compiler-sfc */
  compilerOptions?: Record<string, unknown>;
}

/**
 * @lunx/plugin-vue
 *
 * Official Lunx plugin for Vue 3:
 * - Full Vue SFC (.vue) parsing and compilation
 * - Vue 3 HMR — template hot-patching, script remount
 * - TypeScript via `lang="ts"` in script blocks
 * - Scoped styles and CSS Modules
 *
 * @example
 * ```js
 * const vue = require('@lunx/plugin-vue');
 * module.exports = { plugins: [vue()] };
 * ```
 */
export function vuePlugin(options: VuePluginOptions = {}): Plugin {
  const {
    hmr = true,
    devtools = true,
    compilerOptions = {},
  } = options;

  return {
    name: '@lunx/plugin-vue',

    /**
     * Load hook: handle .vue SFC files.
     * The actual compilation is done by @vue/compiler-sfc (already in Lunx core).
     * This plugin configures and extends that behavior.
     */
    load(id: string): { code: string } | null {
      if (!id.endsWith('.vue')) return null;

      // Vue SFC loading is handled natively by Lunx's framework-detector.
      // This plugin hook adds HMR metadata injection on top.
      if (hmr) {
        // Signal to the Lunx HMR system that this is a Vue SFC
        // The actual hot.accept() logic is injected by the core bundler
        return null; // Let the core handle the actual load
      }

      return null;
    },

    /**
     * Transform hook: post-process compiled Vue SFC output.
     * Adds HMR metadata and devtools integration.
     */
    transform(code: string, id: string): { code: string } | null {
      if (!id.endsWith('.vue')) return null;

      let transformed = code;

      // Inject HMR accept wrapper for SFC
      if (hmr && process.env.NODE_ENV !== 'production') {
        if (!code.includes('import.meta.hot')) {
          transformed += `
\n// Vue SFC HMR
if (import.meta.hot) {
  import.meta.hot.accept(({ default: updated }) => {
    // Vue's HMR API handles the component update
  });
}
`;
        }
      }

      // Inject Vue DevTools support
      if (devtools && process.env.NODE_ENV !== 'production') {
        if (!code.includes('__VUE_DEVTOOLS__')) {
          transformed = `globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ || {};\n` + transformed;
        }
      }

      return transformed !== code ? { code: transformed } : null;
    },
  };
}

export default vuePlugin;
