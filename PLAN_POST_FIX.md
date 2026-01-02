# Urja — Post-Fix Execution Plan (Master Roadmap) [SUPERSEDED]
> **Status**: Completed / Archived. See `PLAN_PHASE_H2.md` for current objectives.

## 🧱 CURRENT STATE (LOCKED & ACCEPTED)
- [x] Core frozen and snapshot-locked
- [x] Adoption friction resolved
- [x] DX stabilized
- [x] Incremental performance correct
- [x] Experimental scope isolated

---

### Phase F: Dogfooding & Real-World Validation (Current Focus)
Goal: Use Urja to build a real React application, verifying "Honest Code Splitting" and runtime integrity.

**F1. Internal Dogfooding (Validation App)**
- [x] **Setup**: Create `validation/react-app` with `urja bootstrap`.
- [x] **Complex App**: Add `react-router-dom`, Lazy Loading (`import()`), and minimal state.
- [x] **Honest Code Splitting**:
    - [x] Implement robust dynamic import parsing in `Graph`.
    - [x] Modify `Plan` to emit separate chunks for async boundaries.
    - [x] **Verify**: Ensure `chunk.Home.bundle.js` is generated and contains ONLY Home component code.
- [x] **CJS Normalization**:
    - [x] Ensure `UniversalTransformer` outputs CommonJS for Urja runtime compatibility.
    - [x] Fix ESM leakage by adding `@babel/plugin-transform-modules-commonjs`.
    - [x] Validate production build artifacts.
- [x] **CSS-Heavy App Validation**
    - [x] Large styles, Tailwind / CSS Modules.
    - [x] Validate bundle size and ordering.
- [x] **CI Pipeline Integration**
    - [x] Run Urja in a real CI environment.

### F2. Plugin & Pipeline Stress Testing
- [x] **Rollup/Webpack Stress Test** (Implemented Rollup adapter + Linker)
- [x] **Incremental Build Stability Check**
- [x] **Error Boundary & Recovery Test**
- [x] **Compatibility Table Update** (Added to URJA_STABILIZATION_REPORT.md).

### F3. Snapshot Stability Audit
- [x] **Cross-Node Version Test** (Verified via updated CI matrix: Node 18, 20, 22)
- [x] **Cross-Machine Bit-for-Bit Verification** (Verified via cross-machine-test.ts)
- [x] **Full Graph Snapshot Regression** (Implemented for React, Vue, Svelte in f3-snapshot-audit.ts)

---

## 🏁 MILESTONE: PRODUCTION-READY STABILIZATION COMPLETE
**Urja is now Snapshot-Locked and Verified for Production Usage.**

---

## 🧪 PHASE G — Limited External Preview (Current Focus)
*Duration: 1–2 weeks*
*Goal: Validate UX, not adoption*

### G1. Documentation & UX Reality Check
- [x] **Zero hand-holding bootstrap test** (Follow README strictly in fresh env)
- [x] **Rename legacy references** (Search/Replace NextGen -> Urja globally)
- [x] **Refine Error Messages** (Ensure AI Healer suggestions are relevant)

### G2. Controlled External Feedback Simulator (Current Focus)
- [x] **Bootstrap Challenge**: Verified a new user can start and build a project.
- [x] **Debugger Challenge**: Can a user fix a config error using only terminal output?

### G3. Production Readiness Verification
- [x] **YAML Config Support**: Validated loading and parsing of `urja.config.yaml`.
- [x] **Asset Pipeline Integrity**: Validated asset hashing, emission, and bundle referencing (`/assets/` paths).
- [x] **Core Engine Stability**: Validated incremental updates, determinism, and input sensitivity.
- [x] **Federation Basic Support**: Validated plugin-based federation manifest generation.
- [x] **Full Regression Suite**: `npm run test:all` passed (Config, Bootstrap, Integration, Asset, Federation, Engine).

---

## 🌱 PHASE H — Ecosystem Seeding (CONTROLLED)
*Goal: Grow safely without destabilizing the core*

### H1. Official Surface Area Maintenance
- [x] **Graph Inspector**: Implemented `urja inspect` CLI command to visualize dependency graph.
- [x] **Core Preset Audit**: Verified `presets/infrastructure.ts` uses clean factory pattern and honest asset pipeline.
- [x] **React Pipeline Audit**: Confirmed React defaults in `frameworks.ts` use automatic JSX runtime and correct Babel presets.
- [ ] **On-Demand Compatibility Expansion**.

---

## 🚫 ABSOLUTE NO-GO LIST (POST-FIX)
1. **DO NOT** change graph semantics.
2. **DO NOT** expose graph internals publicly.
3. **DO NOT** make AI features default.
4. **DO NOT** promise SSR/Edge timelines.
5. **DO NOT** chase benchmarks prematurely.

---

## 🚦 SINGLE GUIDING RULE
**Urja’s value is now stability. Everything else must prove it deserves to exist.**
