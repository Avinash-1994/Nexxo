# Nexxo v2.0 Module 2: Zero-Trust Ecosystem Plan

**Goal**: Build an enterprise-safe plugin ecosystem with 100% sandbox isolation, verified signatures, and seamless Vite/Rollup compatibility.
**Focus**: Beat Vite (insecure plugins) and Rspack (recent hacks) via WASM + WebCrypto.
**Stack**: Wasmtime (Rust), WebCrypto (ECDSA P-256), tRPC + PostgreSQL (Marketplace).

---

## 📅 Implementation Schedule (Week 2)

### Day 8: WASM Runtime Infra Lock
- **Objective**: Establish zero-trust execution environment.
- **Tasks**:
  - [ ] Implement `src/native/wasmtime.rs` bindings
  - [ ] Create `src/plugins/wasm-runtime.ts` interface
  - [ ] Enforce Resource Limits:
    - CPU: 100ms timeout/op
    - Memory: 64MB max
    - Network: Blocked
    - FS: Read-only (whitelisted)
  - [ ] Implement Lifecycle (Load -> Verify -> Exec -> Teardown)
- **Deliverables**: `src/native/wasmtime.rs`, `src/plugins/wasm-runtime.ts`

### Day 9: WebCrypto Signing System Lock
- **Objective**: Ensure all plugins are verified and tamper-proof.
- **Tasks**:
  - [ ] Create `src/plugins/signer.ts` (ECDSA P-256)
  - [ ] Implement Key Generation & Signing CLI
  - [ ] Define Signed Manifest format (JSON + Sig)
  - [ ] Implement `nexxo plugin verify`
- **Deliverables**: `src/plugins/signer.ts`, Signing CLI

### Day 10: Marketplace MVP Lock
- **Objective**: Enable npm-style publish/search for verified plugins.
- **Tasks**:
  - [ ] Setup `src/marketplace/server.ts` (tRPC)
  - [ ] Configure PostgreSQL schema (Plugins table)
  - [ ] Implement `nexxo plugin search/install`
  - [ ] Backend: Publish endpoint with signature check
- **Deliverables**: Marketplace Server, CLI Plugin commands

### Day 11: Vite/Rollup Compat Layer Lock
- **Objective**: Auto-convert existing ecosystem to safe WASM.
- **Tasks**:
  - [ ] Create `src/plugins/adapter.ts`
  - [ ] Implement JS -> WASM Transformer (QuickJS or similar embed?)
  - [ ] Map Rollup hooks to Wasmtime exports
  - [ ] Blacklist dangerous APIs (FS write, exec, eval)
- **Deliverables**: `src/plugins/adapter.ts`, Migration Wizard

### Day 12: Curated Plugin Suite Lock
- **Objective**: Provide essential plugins, fully verified.
- **Tasks**:
  - [ ] Port/Verify Core 20 Plugins:
    - Frameworks: React, Vue, Svelte, Angular, Lit, Solid
    - CSS: Tailwind, PostCSS, Sass
    - Utils: Puppeteer audits, D3 visualizer
  - [ ] Sign and Publish to local marketplace
- **Deliverables**: 20 Verified Plugins in Repo

### Day 13: Integration & Benchmarks Lock
- **Objective**: Ensure zero performance regression and perfect security.
- **Tasks**:
  - [ ] Benchmark Pipeline: Bun -> Rolldown -> WASM Plugins
  - [ ] Security Suite: Run "Malicious Plugin Injection" tests
  - [ ] Optimize Context Switching (Host <-> WASM)
- **Deliverables**: `benchmarks/plugin-perf.ts`, Security Report

### Day 14: Final Polish & Audit Lock
- **AM: CLI Experience**:
  - [ ] Polish `nexxo plugin` commands (UX/colors)
  - [ ] Implement auto-updates
- **PM: Security Audit**:
  - [ ] Static Analysis (Rust/TS)
  - [ ] Fuzz Testing (IO boundaries)
  - [ ] Pen-test (Escape attempts)
- **Deliverables**: `MODULE_2_COMPLETE.md`

---

## ✅ Success Criteria
1. **Isolation**: 100% of plugins run in sandbox; malicious IO blocked.
2. **Compatibility**: >90% of Vite/Rollup plugins working via adapter.
3. **Performance**: Zero regression vs native plugins (overhead <5%).
4. **Ecosystem**: 20 curated, verified plugins available.

---

**Next Step**: Begin Day 8 - WASM Runtime Infra.
