# Urja — Governance Stress Test #2

## Request Summary
**Type**: Core Feature Update
**Proposal**: `NativeRustPipeline`
**Author**: Performance Team
**Description**: Refactor the core `execute.ts` and `planner.ts` into a Rust-based worker for 10x performance.
**Requirements**:
1. Move the `planBuild` logic from TypeScript to Rust.
2. Change the `BuildArtifact` interface to use SharedArrayBuffers for zero-copy.
3. Allow the core to dynamically load `.so` / `.dll` / `.dylib` binary modules.

---

## ⚖️ Contract Evaluation

### 1. Extension Surface Check (`EXTENSION_SURFACE.md`)
> **Rule**: Core logic (Planner, Pipeline) is frozen and protected. 
*   **Verdict**: ❌ **REJECTED**. Refactoring the core planner is a violation of the frozen core principle.
*   **Citation**: `EXTENSION_SURFACE.md` Section "Forbidden Extension Points" - "Core Pipeline Orchestration".

### 2. Compatibility Policy Check (`COMPATIBILITY_POLICY.md`)
> **Rule**: No breaking changes to the core engine types during the stabilization phase.
*   **Verdict**: ❌ **REJECTED**. Changing `BuildArtifact` to use `SharedArrayBuffers` is a breaking change for all existing plugins that expect strings or standard Buffers.
*   **Citation**: `COMPATIBILITY_POLICY.md` Section "Breaking Change Policy".

### 3. Stability Audit Check (`STABILITY_AUDIT.md`)
> **Rule**: Every release must pass the API surface audit.
*   **Verdict**: ❌ **REJECTED**. This proposal would cause a 100% failure in the API surface check because it fundamentally changes the core data structures.

---

## 🚫 Final Decision: REJECTED

### Reasoning
While the performance gains are attractive, this proposal violates almost every governance rule established in Phase H2:
- It touches the "What NOT to Touch" core areas.
- It introduces breaking changes that would invalidate the entire plugin ecosystem.
- It shifts the maintenance burden to a new language (Rust) without a governance review.

### Recommendation for Requester
Urja already supports **Native Workers** via the existing plugin contract. Instead of refactoring the core:
1. Implement the Rust logic *inside a plugin* using the `transformModule` or `renderChunk` hooks.
2. Use the existing NAPI-RS bridge which is already part of Urja's infrastructure.
3. If performance is critical, optimize the *plugin implementation* rather than the core *orchestration*.

---

## 🎯 Impact of Decision
- ✅ **Stability**: The core remains predictable and maintainable in TypeScript.
- ✅ **Ecosystem Integrity**: Existing plugins continue to work without modification.
- ✅ **Governance Proof**: The system successfully resisted a "performance-trap" that would have compromised the architecture.

**The Governance Framework prevented a premature architectural shift.**
