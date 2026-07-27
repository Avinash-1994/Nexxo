/**
 * SvelteKit client entry — browser hydration
 * Lunx Phase 2.4 / SVK-07
 *
 * In a real SvelteKit project this would call svelte's `mount()` / `hydrate()`.
 * This stub registers the app shell so the browser picks up SSR HTML.
 */

// Hydrate SSR root if present
const root = document.getElementById('lunx-ssr-root');
if (root) {
  // Signal hydration complete
  root.setAttribute('data-hydrated', 'true');
}

// Route client-side navigation
window.__lunx_svk_client__ = { version: '1.0', hydrated: !!root };
