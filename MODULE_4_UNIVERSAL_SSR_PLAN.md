# 🌍 Nexxo v2.0 Module 4: Universal SSR/Edge Plan - "Run Everywhere"

**Goal**: Deliver a framework-agnostic SSR engine that unifies Node, Edge, and Bun deployments.
**Target Week**: Week 4 (Days 22-28)
**Stack**: Stream API, Edge Runtime, CoreJS, Rust MSVC.

---

## 📅 Daily Execution Plan

### Day 22: Universal SSR Runtime Lock
**Focus**: The Engine Core.
- [ ] Implement `src/ssr/universal-engine.ts` (Node/Edge/Bun dispatcher).
- [ ] Implement Streaming Support (AsyncIterable chunks).
- [ ] Implement Hydration Mismatch Detection (Auto-fix logic).
- [ ] **Checklist**: Verify React/Vue/Svelte/Qwik rendering strings/streams.

### Day 23: Framework-Agnostic SSR Lock
**Focus**: The Adapters.
- [ ] Create `src/ssr/adapters/` for React, Vue, Svelte, Angular, Lit, Solid.
- [ ] Implement Server Transforms (CSS collection, Head management).
- [ ] Implement ISR (Time-based revalidation).
- [ ] **Checklist**: 100% parity with Next/Nuxt native output.

### Day 24: Edge Runtime Support Lock
**Focus**: Cloud Primitives.
- [ ] Implement `src/ssr/edge/` (Vercel/Cloudflare/Netlify shims).
- [ ] Enforce Web-Standard APIs (No `process` or `fs`).
- [ ] **Verify**: Streaming Suspense boundaries on Edge.
- [ ] **Checklist**: Deploy to 3 platforms successfully.

### Day 25: Legacy Polyfills & Windows Lock
**Focus**: Compatibility.
- [ ] Implement `src/polyfills/corejs.ts` (IE11 opt-in).
- [ ] Audit for Windows (Path handling `\` vs `/`).
- [ ] **Checklist**: IE11 Bundle <2MB, Windows CI passing.

### Day 26: Environment API Lock
**Focus**: Unified Context.
- [ ] Implement `src/env/api.ts` (Unified HMR Browser/SSR/Edge).
- [ ] Shared State Management (Config/Env vars).
- [ ] Type-Safe environment definitions.
- [ ] **Checklist**: Seamless HMR (Browser -> SSR -> Edge).

### Day 27: SSR Benchmarks & Optimization Lock
**Focus**: Speed.
- [ ] Create Docker Benchmarking Suite.
- [ ] Measure TTFB vs Next.js/Nuxt.
- [ ] Optimize Memory (<100MB peak).
- [ ] **Checklist**: Beat framework natives on TTFB.

### Day 28: Multi-Target Pipeline & Production Lock
**Focus**: The "Build Once" Dream.
- [ ] Implement `src/build/pipeline.ts` (SPA/SSR/SSG/Edge/Lib modes).
- [ ] Single Config `nexxo.config.ts`.
- [ ] **Verify**: Production Load Test (10k req/min).
- [ ] **Checklist**: Zero regressions vs SPA.

---

## 🏆 Success Criteria
1.  **Universality**: One codebase deploys to Node, Cloudflare Workers, and Bun.
2.  **Performance**: SSR TTFB faster than Next.js.
3.  **Compatibility**: Supports 12 frameworks and IE11.
4.  **Stability**: Zero hydration mismatches.
