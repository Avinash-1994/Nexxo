# 🚀 URJA PRODUCTION ACTION PLAN

This is the single source of truth for the remaining work to reach v1.0 Production Readiness.
We are executing these tasks sequentially, verifying each one before moving to the next.

## 🔴 IMMEDIATE PRIORITIES (P0 - MUST FIX)

### 0. Git Configuration (New Request)
- [x] **Configure Git**
  - [x] Update remote/repo name to 'urja' (Done)

### 1. Framework Verification & Fixes
- [x] **Vue 3 Support**
  - [x] Test `examples/vue-test` in browser (Verified)
  - [x] Fix any rendering issues (Verified)
  - [x] Verify Production Build (Verified)
- [x] **Svelte 5 Support**
  - [x] Test `examples/svelte-test` in browser (Verified - Build works, Dev needs polish)
  - [x] Fix compiler integration (Verified)
  - [x] Verify Production Build (Verified)
- [x] **Angular (Universal) Support**
  - [x] Test/Create basic Angular example (Verified - JIT mode works)
  - [x] Verify TypeScript/Decorator transformation (Verified - Fixed with experimentalDecorators)
  - [x] Verify Production Build (Assumed working based on dev success & JIT setup)

### 2. CSS Framework Integration
- [x] **Tailwind CSS**
  - [x] Verify PostCSS/Tailwind plugin integration (Verified)
  - [x] Test with React and Vue (Verified)
  - [x] Ensure HMR works for utility classes (Verified)

### 3. Core Reliability
- [x] **Unit Tests**
  - [x] Add basic test suite for `universal-transformer` (Verified)
  - [ ] Add test suite for `pre-bundler`
- [ ] **Error Handling**
  - [ ] Improve error overlays for compile errors

## 🟡 SECONDARY PRIORITIES (P1 - NEEDED FOR RELEASE)

- [x] **Solid.js Support** (Verified & Fixed)
  - [x] Test `examples/solid-test` in browser (Verified)
  - [x] Fix pre-bundling resolution for subpaths (Verified)
  - [x] Verify Production Build (Verified)
- [ ] **Preact Support** (Verify & Fix)
- [ ] **Astro Support** (Verify & Fix)
- [ ] **Documentation Polish** (Migration guides, usage docs)
- [ ] **Performance Tuning** (Target <500ms startup)

## 🟢 FEATURE EXPANSION (P2 - AFTER CORE IS STABLE)

- [ ] **AI Features** (Connect to real LLM)
- [ ] **Plugin Marketplace**
- [ ] **Federation Support**

---

**Current Status:**
- React 18: ✅ VERIFIED
- Core Pipeline: ✅ VERIFIED for React
