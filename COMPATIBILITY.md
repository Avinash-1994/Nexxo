# COMPATIBILITY MATRIX

> Honest status of what works, what has known issues, and what is not yet supported.
> Updated: 2026-04-07 | Lunx v1.0.9

---

## Core Build Features

| Feature | Status | Confidence | Notes |
|---------|--------|------------|-------|
| TypeScript compilation | ✅ Stable | High | SWC-based, no type-checking at build time |
| JSX (React) | ✅ Stable | High | react-jsx transform, no Babel needed |
| JSX (Solid) | ✅ Stable | High | `jsxImportSource: 'solid-js'` |
| Vue SFC (`.vue`) | ✅ Stable | High | Full `@vue/compiler-sfc` |
| Svelte SFC (`.svelte`) | ✅ Stable | High | Svelte 4 & 5 (Runes) |
| CSS Processing | ✅ Stable | High | LightningCSS + PostCSS |
| CSS Modules | ✅ Stable | High | `.module.css` convention |
| Source Maps | ✅ Stable | High | inline / external / hidden |
| Tree Shaking | ✅ Stable | High | AST-based dead code elimination |
| Code Splitting | ✅ Stable | High | Dynamic `import()` |
| Asset Handling | ✅ Stable | High | Images, fonts, JSON, WASM |
| Environment Variables | ✅ Stable | High | `.env`, `.env.local`, `.env.production` |
| Path Aliases | ✅ Stable | High | `resolve.alias` in config |
| Minification (JS) | ✅ Stable | High | SWC minifier |
| Minification (CSS) | ✅ Stable | High | LightningCSS |
| Gzip/Brotli output | ✅ Stable | High | `build.compress: true` |

---

## Hot Module Replacement (HMR)

| Scenario | Status | Notes |
|----------|--------|-------|
| React Fast Refresh | ✅ Stable | State preserved across saves |
| Vue SFC template changes | ✅ Stable | Hot-patched without remount |
| Vue SFC script changes | ✅ Stable | Component remounts |
| Svelte component changes | ✅ Stable | State resets on save |
| CSS / style changes | ✅ Stable | Injected without page reload |
| JSON file changes | ✅ Stable | Triggers module re-import |
| Circular dependencies + HMR | ⚠️ Known Issue | May cause full reload instead of HMR |
| HMR over HTTPS | ✅ Stable | WebSocket via wss:// |
| HMR in Docker / WSL | ⚠️ Known Issue | Polling may be required for some setups |

---

## Framework Support

| Framework | Status | HMR | TypeScript | CSS Modules | Notes |
|-----------|--------|-----|------------|-------------|-------|
| React 18 | ✅ Stable | ✅ Fast Refresh | ✅ | ✅ | Full support |
| React 19 | ✅ Stable | ✅ Fast Refresh | ✅ | ✅ | Full support |
| Vue 3 | ✅ Stable | ✅ SFC Hot-Reload | ✅ | ✅ | Composition API |
| Vue 2 | ❌ Not Supported | ❌ | ⚠️ | ❌ | Use Vite or webpack |
| Svelte 5 | ✅ Stable | ✅ | ✅ | N/A (scoped) | Runes supported |
| Svelte 4 | ✅ Stable | ✅ | ✅ | N/A (scoped) | |
| SolidJS | ✅ Stable | ✅ Signal-aware | ✅ | ✅ | |
| Preact | ✅ Stable | ✅ Fast Refresh | ✅ | ✅ | Via React compat |
| Lit | ✅ Verified | ✅ Web Component | ✅ | N/A | es2020 target |
| Alpine.js | ✅ Verified | ✅ Core Reload | ✅ | N/A | HTML-first |
| Qwik | 🔶 Experimental | ⚠️ | ✅ | ✅ | May need workarounds |
| Mithril.js | ✅ Stable | ✅ | ✅ | ✅ | |
| Vanilla JS | ✅ Stable | ✅ | ✅ | ✅ | |
| Angular | ❌ Not Supported | ❌ | N/A | N/A | Use Angular CLI |
| Ember | ❌ Not Supported | ❌ | N/A | N/A | Use Ember CLI |
| Astro | ⚠️ Not Tested | N/A | N/A | N/A | Astro has its own bundler |

---

## Module Federation

| Scenario | Status | Notes |
|----------|--------|-------|
| Single remote | ✅ Stable | |
| Multiple remotes (3+) | ✅ Stable | Tested with up to 5 remotes |
| Dynamic remotes | ✅ Stable | Runtime URL configuration |
| Shared dependencies (React) | ✅ Stable | `singleton: true` option |
| Shared dependencies (Vue) | ✅ Stable | |
| Cross-framework remotes | ⚠️ Limited | React host + Vue remote works; Svelte remote has quirks |
| SSR + Module Federation | ⚠️ Experimental | Server-side rendering with remotes is WIP |
| Module Federation v2 spec | ✅ Supported | Compatible with Webpack MF v2 |

---

## CSS Ecosystem

| Feature | Status | Notes |
|---------|--------|-------|
| Plain CSS | ✅ Stable | |
| CSS Modules | ✅ Stable | `.module.css` |
| Tailwind CSS v3 | ✅ Stable | `css.framework: 'tailwind'` |
| Tailwind CSS v4 | ⚠️ Experimental | API changes in v4 may need manual config |
| PostCSS | ✅ Stable | `postcss.config.js` auto-detected |
| Sass/SCSS | ✅ Stable | `npm install -D sass` |
| Less | ✅ Stable | `npm install -D less` |
| CSS-in-JS (styled-components) | ✅ Stable | Works via Babel or SWC plugin |
| CSS-in-JS (Emotion) | ✅ Stable | |
| UnoCSS | ⚠️ Experimental | Plugin available but not first-party |
| LASS | ❌ Not Tested | |

---

## Build Scenarios

| Scenario | Status | Notes |
|----------|--------|-------|
| Single-page app (SPA) | ✅ Stable | |
| Multi-page app (MPA) | ✅ Stable | Multiple entry points |
| Library mode | ✅ Stable | `build.lib: true` |
| SSR (Server-Side Rendering) | ⚠️ Beta | Functional but less mature than Vite |
| SSG (Static Site Generation) | ⚠️ Experimental | Manual implementation required |
| Mono-repo (pnpm workspaces) | ✅ Stable | Symlinks resolved correctly |
| Mono-repo (npm workspaces) | ✅ Stable | |
| Mono-repo (Yarn workspaces) | ✅ Stable | |
| Docker builds | ✅ Stable | Standard Node.js container |
| CI/CD (GitHub Actions) | ✅ Stable | See `.github/workflows/ci.yml` |
| Windows | ⚠️ Limited | Path separator issues in some edge cases |
| macOS | ✅ Stable | |
| Linux | ✅ Stable | Primary development platform |

---

## Dynamic Imports & Code Splitting

| Scenario | Status | Notes |
|----------|--------|-------|
| Standard dynamic `import()` | ✅ Stable | |
| 50+ async chunks | ✅ Stable | |
| 200+ async chunks | ✅ Verified | Memory-tested in stress tests |
| Circular dynamic imports | ⚠️ Known Issue | May produce incorrect chunk ordering |
| Import with variables | ⚠️ Limited | Glob imports preferred over computed paths |
| Lazy-loaded routes | ✅ Stable | Works with all major routers |

---

## Known Issues (with Workarounds)

### Issue 1: HMR breaks after circular imports
**Severity:** Minor  
**Workaround:** If HMR stops responding, run `lunx dev --force` to restart. Break circular dependencies where possible.

### Issue 2: Windows path separator edge cases
**Severity:** Minor  
**Workaround:** Use forward slashes in config (`'./src'` not `.\\src`). This is a known Node.js path normalization issue.

### Issue 3: Large bundles (5000+ modules) may slow first cold-start
**Severity:** Minor  
**Workaround:** Warm the cache with one build: second and subsequent builds are dramatically faster (RocksDB cache).

### Issue 4: Svelte HMR resets component state
**Severity:** By Design  
**Workaround:** Move state that should persist across HMR updates to a Svelte store (`writable()`), which lives outside the component tree.

### Issue 5: SSR with Module Federation
**Severity:** Major (if you need this)  
**Status:** WIP — tracked at GitHub  
**Workaround:** Use client-side-only federation for now.

---

## Not Yet Supported

| Feature | Priority | Timeline |
|---------|----------|----------|
| Angular | Low | No ETA |
| Vue 2 | Low | No plans — use Vite |
| Astro integration | Medium | Community contribution welcome |
| Deno runtime | Medium | In investigation |
| Bun native bundler integration | Low | Experimental |
| Edge functions (Cloudflare Workers) | Medium | Community plugin WIP |
| iOS / React Native | ❌ Out of scope | Use Metro bundler |

---

## Reporting Issues

If you encounter behavior not listed here:

1. Run `lunx doctor` to self-diagnose
2. Check [GitHub Issues](https://github.com/Avinash-1994/Lunx/issues)
3. File a bug with: Lunx version, OS, Node version, config file, and error output
4. Use `lunx build --verbose` for detailed logs

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Stable | Tested in production, no known issues |
| ⚠️ Known Issue / Limited | Works but has documented edge cases |
| 🔶 Experimental | May work, not officially supported |
| ❌ Not Supported | Does not work, not planned |
