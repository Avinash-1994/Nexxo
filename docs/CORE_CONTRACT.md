# Urja Core Contract (v1.x)

## 1. Unified Pipeline Specification
Urja operates on a strictly ordered **10-stage pipeline**. Any modification to the core engine must preserve this sequence.

1.  **Initialization**: Normalize config and initialize services.
2.  **Input Fingerprinting**: Hash all base inputs (config, source files).
3.  **Attach Graph**: Resolve dependency tree and attach to context.
4.  **Build Planning**: Calculate chunk boundaries and output mapping.
5.  **Parallel Execution Planning**: Wave-based task grouping.
6.  **Determinism Check**: Passive verification of internal stability.
7.  **Execution**: Parallel transformation and code generation.
8.  **Optimization**: Opt-in post-processing (Minification, etc.).
9.  **Emission**: Write artifacts and metadata to disk.
10. **Output Fingerprinting**: Final integrity audit.

---

## 2. Stability & Support Definitions

### 2.1 Component Status
| Component | Status | Guarantee |
|-----------|--------|-----------|
| **Core Engine** | **Frozen** | No behavioral changes; locked by snapshot tests. |
| **Graph Semantics** | **Frozen** | SHA-256 ID stability; content-hash invalidation. |
| **Plugin Compatibility** | **Stable** | Support for **Transform-level only** Rollup/Webpack adapters. |
| **Multi-Target Graph** | **Experimental**| Internal use only (SSR/Edge). Not part of public API. |
| **AI Features** | **Future** | Non-core; reserved for Phase 6. |

---

## 3. Plugin Compatibility Contract
Urja provides a compatibility layer for the ecosystem. However, this is strictly limited to:
- **Stateless Transforms**: Mapping Rollup `transform` or Webpack `loader` to Urja's `transformModule` hook.
- **Stateless Resolvers**: Mapping standard `resolveId` hooks.
- **Output Rendering**: Basic `renderChunk` support.

*Plugins requiring deep access to Urja's Internal Graph API are NOT supported.*

---

## 4. Determinism Guarantee
In `ci` mode, Urja asserts that identical inputs MUST produce identical `BuildFingerprint` outputs.
- Hashing Algorithm: **SHA-256**.
- Serialization: Sorted-key JSON stringification.
- Delta: Any drift results in a `DETERMINISM_VIOLATION`.

---

## 5. Exit Condition (Phase 0)
Phase 0 (Core Stabilization) is officially **Complete**. The engine is now in Phase B (Adoption Enablement).
