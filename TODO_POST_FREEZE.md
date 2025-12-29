# Urja — Real-World Validation & Deployment (Post-Freeze)

## 🚦 PHASE F — Real-World Validation (MANDATORY)
*Duration: 4–6 weeks*
*Primary Goal: Prove Urja survives real usage without core changes*

### F1. Internal Dogfooding
- [x] **React SPA Validation**
    - [x] Create/Select a real React app (Routing, Code-splitting).
    - [x] Validate daily development (HMR).
    - [x] Validate production builds.
- [x] **CSS-Heavy App Validation**
    - [x] Test with Tailwind CSS integration.
    - [x] Integrate with PostCSS/Tailwind for React.
- [x] Fix ESM transformation issues in validation.
- [x] Setup CI Pipeline Integration (dogfood-react.ts).
- [x] Verify Rollup/Webpack Adapter + Linker (stress-test-rollup.ts).
- [x] Implement Incremental Build Stability.
- [x] Add Error Boundaries for Plugins.

### F2. Plugin & Pipeline Stress Testing
- [x] **Rollup Plugin Compatibility**
    - [x] Test `@rollup/plugin-alias`.
    - [x] Test `@rollup/plugin-replace`.
    - [x] Test `@rollup/plugin-commonjs`.
- [x] **Webpack Loader Compatibility**
    - [x] Test `sass-loader` / `less-loader` adaptation.
- [x] **Compatibility Table**
    - [x] Generate `COMPATIBILITY.md` with "Works/Partial/Unsupported". (Integrated into stabilization report)

### F3. Snapshot Stability Audit
- [x] **Cross-Machine Verification**
    - [x] Validate bit-for-bit identity on different paths (scripts/validation/cross-machine-test.ts).
- [x] **Cross-Node Verification**
    - [x] Test on Node 18, 20, and 22. (Integrated into CI matrix)
- [x] **Semantic Graph Snapshots**
    - [x] Validate graph structure against baselines (scripts/validation/f3-snapshot-audit.ts).

---

## 🧪 PHASE G — Limited External Preview
*Duration: 2–4 weeks*
*Goal: Validate UX, not adoption*

### G1. Branding & Documentation Review
- [x] **Branding Transition**: Rename Urja to Urja globally.
- [x] **Bootstrap Flow**: Verify and fix `urja bootstrap` pathing and config.
- [x] **Doc Review**: Update README/USER_GUIDE with new CLI and branding.

### G2. Documentation & UX Reality Check (Simulated)
- [ ] **Bootstrap Challenge**: Can a new user start a project without discord/slack help?
- [ ] **Debugger Challenge**: Can a user fix a config error using only terminal output?

---

## 🌱 PHASE H — Ecosystem Seeding (CONTROLLED)
*Goal: Grow safely without destabilizing the core*

- [ ] **Official Preset Maintenance** (Lock down `urja:js-transform`, `urja:css`).
- [ ] **Plugin Author Onboarding** (Create `docs/PLUGINS.md`).

---

## 🚫 ABSOLUTE NO-GO LIST (POST-FIX)
- [ ] No changing graph semantics.
- [ ] No public exposure of `latestGraph`.
- [ ] No premature SSR/Edge public APIs.
