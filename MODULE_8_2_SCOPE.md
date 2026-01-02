# Module 8.2 — Mithril.js Adapter Scope

**Status**: 🔓 **STARTED**  
**Parent Module**: 8 (Framework Adapter System)  
**Framework**: Mithril.js  
**Core Impact**: ❌ NONE (Hard-locked)

---

## 🟢 Scope Definition (Must Lock)

### 1. Mithril Adapter WILL (Responsibilities)

#### a. Accept normalized build job
- **Entry Points**: Explicit source files (typically JS/TS initializing Mithril mount).
- **Mode**: `dev` (fast, HMR) and `prod` (minified, optimized).
- **Env**: Respect the explicit environment variable allowlist provided by Urja.

#### b. Bundle Mithril runtime + user code
- Bundle `mithril` and user-defined script logic into standard JavaScript modules.
- **Toolchain**: Orchestrate an internal bundler (e.g., Vite/Rollup) to handle this transparently.
- **JSX Support**: Optional. If user opts in via tsconfig/babelrc, adapter respects it, but does not *enforce* it. Default assumption is hyperscript `m()`.

#### c. Emit normalized outputs
- **JS**: Standard ESM chunks.
- **CSS**: Extracted global styles or utility CSS bundles.
- **Assets**: Normalized paths and files for images/fonts.
- **Manifest**: Accurate mapping of source -> output.

#### d. Use neutral HMR interface
- Implement the standard Module 8 HMR contract:
    - `invalidate(module)`: Mark changed modules as stale.
    - `accept(module)`: Accept updates for logic.
    - `fullReload(reason)`: Trigger browser reload if HMR cannot safely swap (common in minimalist VDOMs without special HMR runtime).

### 2. Mithril Adapter WILL NOT (Forbidden)

- ❌ **Add JSX assumptions**: Default is vanilla JS/TS. JSX handled via standard transformations if configured, not hardcoded core logic.
- ❌ **Add template compilation to core**: Urja Core remains ignorant of `m()`.
- ❌ **Inject runtime hooks into Urja**: No runtime code injection into Urja's orchestrator.
- ❌ **Access Urja graph, planner, cache, or hash**: Strictly prohibited.
- ❌ **Implement routing or SSR**: This adapter is for client-side Mithril applications only.

### 3. CSS Stance

- ✅ **Global CSS supported**: Standard `import './style.css'` works.
- ❌ **Scoped CSS**: Not required (Mithril does not enforce scoping, relies on community patterns or global CSS).

---

## 🔁 Lifecycle Fit

The adapter must fit purely into the standard Module 8 lifecycle:

1.  `init(options)`: Configure internal toolchain.
2.  `build()` (dev/prod): Execute internal build, return `AdapterOutput` data.
3.  `handleHmr(event)`: Map file events to HMR actions or reloads.

---

## 🛑 Exit Gate (8.2 Scope)

- [x] Scope fits existing adapter system
- [x] No new hooks required
- [x] No hidden assumptions
