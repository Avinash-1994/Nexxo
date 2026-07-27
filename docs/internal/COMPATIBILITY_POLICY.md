# Lunx Compatibility Policy — Ruled, Not Open

**Status**: 🔒 Locked (Phase H2.4)  
**Version**: 1.0.0  
**Purpose**: Prevent Speculative Integrations  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This document defines **WHEN** and **HOW** compatibility is added to Lunx.

**Core Principle**: Compatibility grows because it was **needed**, not because it was **possible**.

---

## ✅ HARD RULES (Enforced)

### Rule 1: Real Usage First
**Compatibility is added ONLY after real usage is demonstrated.**

```
❌ BAD: "Let's add Angular AOT support in case someone needs it."
✅ GOOD: "3 users requested Angular AOT, here's the issue tracker."
```

**Evidence Required**:
- GitHub issue with upvotes (5+)
- Community discussion
- Real-world use case
- Willingness to test

---

### Rule 2: Determinism Snapshots Required
**Every compatibility adapter MUST pass determinism snapshots.**

```bash
npm run test:snapshots -- --adapter=angular-aot
```

**Snapshot tests verify**:
- Same input → same output
- No hidden side effects
- Reproducible builds

**If snapshots fail → adapter is rejected.**

---

### Rule 3: Fail Loudly When Unsupported
**If Lunx cannot handle a framework feature, it MUST fail with a clear error.**

```typescript
// ✅ GOOD
if (isAngularAOT(config)) {
  throw new Error(
    'Angular AOT is not yet supported. ' +
    'Use JIT mode or track: https://github.com/lunx/issues/123'
  );
}

// ❌ BAD
if (isAngularAOT(config)) {
  // Silently ignore, build may be broken
}
```

**Why**: Silent failures create false confidence.

---

### Rule 4: No Speculative Integrations
**Do not add compatibility "just in case."**

**Forbidden**:
- ❌ "Let's add Qwik support before anyone asks"
- ❌ "Let's prepare for Deno 2.0 just in case"
- ❌ "Let's support Bun before it's stable"

**Allowed**:
- ✅ "5 users need Qwik, here's the issue"
- ✅ "Deno 2.0 is stable, users are migrating"
- ✅ "Bun is production-ready, demand is proven"

---

## 🚫 EXPLICIT DEFERRALS (Locked)

The following are **explicitly deferred** until real demand exists:

### 1. **Angular AOT (Ahead-of-Time Compilation)**
**Status**: ❌ Deferred  
**Reason**: Complex compiler integration, no proven demand  
**Alternative**: Angular JIT works today  
**Tracking**: [Issue #TBD]

**Will reconsider if**:
- 10+ users request it
- Someone contributes a working prototype
- Angular team provides guidance

---

### 2. **Solid Compiler Internals**
**Status**: ❌ Deferred  
**Reason**: Solid's JSX transform is sufficient  
**Alternative**: Use `babel-preset-solid`  
**Tracking**: [Issue #TBD]

**Will reconsider if**:
- Solid team requests deeper integration
- Performance issues with current approach
- New Solid features require it

---

### 3. **Meta-Framework SSR Glue**
**Status**: ❌ Deferred  
**Reason**: SSR is meta-framework responsibility, not bundler  
**Alternative**: Use Next.js, Nuxt, SvelteKit directly  
**Tracking**: [Issue #TBD]

**Will reconsider if**:
- Clear separation of concerns emerges
- Standard SSR protocol is defined
- Multiple meta-frameworks request it

---

### 4. **Edge Runtime Optimization**
**Status**: 🧪 Experimental  
**Reason**: Edge runtimes are still evolving  
**Alternative**: Standard browser builds work  
**Tracking**: [Issue #TBD]

**Will promote if**:
- Edge runtimes stabilize
- Performance benefits are proven
- Demand is demonstrated

---

### 5. **WebAssembly Integration**
**Status**: ❌ Deferred  
**Reason**: WASM bundling is niche  
**Alternative**: Load WASM files as assets  
**Tracking**: [Issue #TBD]

**Will reconsider if**:
- WASM usage becomes mainstream
- Bundling provides clear benefits
- Standard WASM module format emerges

---

## ✅ CURRENT COMPATIBILITY MATRIX

| Framework | Status | HMR | SSR | Notes |
|-----------|--------|-----|-----|-------|
| **React** | ✅ Stable | ✅ | ❌ | Full JSX + Fast Refresh |
| **Vue** | ✅ Stable | ✅ | ❌ | SFC + HMR verified |
| **Svelte** | ✅ Stable | ✅ | ❌ | Full compiler integration |
| **Solid** | ✅ Stable | ✅ | ❌ | JSX transform only |
| **Angular** | ✅ Stable | ✅ | ❌ | JIT only (AOT deferred) |
| **Vanilla** | ✅ Stable | ✅ | N/A | Default fallback |
| **Preact** | ⚠️ Community | ✅ | ❌ | Via React compat |
| **Lit** | ⚠️ Community | ✅ | ❌ | Web components |
| **Qwik** | ❌ Deferred | ❌ | ❌ | No demand yet |
| **Astro** | ❌ Deferred | ❌ | ❌ | Meta-framework |
| **Remix** | ❌ Deferred | ❌ | ❌ | Meta-framework |
| **Next.js** | ❌ Deferred | ❌ | ❌ | Meta-framework |
| **Nuxt** | ❌ Deferred | ❌ | ❌ | Meta-framework |

---

## 📋 Compatibility Addition Checklist

Before adding new framework compatibility:

- [ ] **Demand Verified**: 5+ users requested it
- [ ] **Use Case Clear**: Real-world project needs it
- [ ] **Determinism Proven**: Snapshot tests pass
- [ ] **Error Handling**: Fails loudly when unsupported
- [ ] **Documentation**: Integration guide written
- [ ] **Maintenance Plan**: Who will maintain it?
- [ ] **Performance**: No regressions in benchmarks
- [ ] **Breaking Changes**: None required in core

**If any checkbox is unchecked → defer.**

---

## 🔄 Compatibility Request Process

### 1. User Opens Issue
**Template**:
```markdown
## Framework Compatibility Request

**Framework**: [e.g., Qwik]
**Use Case**: [Why do you need this?]
**Workaround**: [What are you doing today?]
**Willingness to Test**: [Yes/No]
```

### 2. Core Team Evaluates
**Criteria**:
- Is demand real? (5+ upvotes)
- Is use case valid?
- Is it technically feasible?
- Is maintenance burden acceptable?

### 3. Decision
- ✅ **Approved**: Add to roadmap
- ⚠️ **Deferred**: Wait for more demand
- ❌ **Rejected**: Out of scope

### 4. Implementation
- Prototype in experimental branch
- Snapshot tests added
- Documentation written
- Community testing

### 5. Release
- Mark as `@experimental` initially
- Promote to stable after 2 releases
- Announce in changelog

---

## 🎯 Exit Condition (H2.4)

> "Compatibility grows because it was needed, not because it was possible."

**Verification**:
1. Every framework has a demand justification → ✅
2. Every adapter has snapshot tests → ✅
3. Unsupported features fail loudly → ✅
4. No speculative integrations exist → ✅

---

## 🧠 Governance Rule

**"If we build it, they might not come. If they come, we'll build it."**

Demand first, implementation second.

---

**Signed**: Lunx Core Team  
**Effective**: Phase H2.4 Complete
