# Module 8.1 — Alpine.js Adapter Scope

**Status**: 🔓 **STARTED**
**Parent Module**: 8 (Framework Adapter System)
**Framework**: Alpine.js
**Core Impact**: ❌ NONE (Hard-locked)

---

## 🟢 Scope Definition (Must Lock)

### 1. Alpine Adapter WILL (Responsibilities)

#### a. Accept normalized build job
- **Entry Points**: Explicit source files (typically JS/TS initializing Alpine).
- **Mode**: `dev` (fast, HMR) and `prod` (minified, optimized).
- **Env**: Respect the explicit environment variable allowlist provided by Urja.

#### b. Bundle Alpine runtime + user code
- Bundle `alpinejs` and user-defined script logic into standard JavaScript modules.
- Ensure Alpine initializes correctly in the browser environment.
- **Toolchain**: Orchestrate an internal bundler (e.g., Vite/Rollup) to handle this bundling transparently.

#### c. Emit normalized outputs
- **JS**: Standard ESM chunks.
- **CSS**: Extracted global styles or utility CSS bundles.
- **Assets**: Normalized paths and files for images/fonts.
- **Manifest**: Accurate mapping of source -> output.

#### d. Use neutral HMR interface
- Implement the standard Module 8 HMR contract:
    - `invalidate(module)`: Mark changed modules as stale.
    - `accept(module)`: Accept updates for logic.
    - `fullReload(reason)`: Trigger browser reload for DOM structure or critical changes unmatched by HMR.

### 2. Alpine Adapter WILL NOT (Forbidden)

- ❌ **Add template compilation to core**: Urja Core will not learn about Alpine directives (`x-data`, `x-bind`) or HTML parsing.
- ❌ **Inject runtime hooks into Urja**: No runtime code injection into Urja's orchestrator.
- ❌ **Access Urja graph, planner, cache, or hash**: Strictly prohibited. The adapter is a client of the job configuration, not a participant in the core build logic.
- ❌ **Implement routing or SSR**: This adapter is for client-side Alpine applications only.
- ❌ **Assume Tailwind or any CSS framework**: While often paired, the adapter must work with *any* CSS or *no* CSS. It treats CSS as just another asset type.

### 3. CSS Stance

- ✅ **Global CSS supported**: Standard `import './style.css'` works.
- ✅ **Utility CSS supported**: Importing utility CSS files works.
- ❌ **Scoped CSS**: Not required (Alpine operates on Light DOM and typically relies on utility classes or global styles). Adapter should not attempt to enforce scoping.

---

## 🔁 Lifecycle Fit

The adapter must fit purely into the standard Module 8.1 lifecycle:

1.  `init(options)`: Configure internal toolchain.
2.  `build()` (dev/prod): Execute internal build, return `AdapterOutput` data.
3.  `handleHmr(event)`: Map file events to HMR actions or reloads.

---

## 🛑 Exit Gate (8.1 Scope)

- [x] Scope fits existing adapter system
- [x] No new hooks required
- [x] No implicit core assumptions
