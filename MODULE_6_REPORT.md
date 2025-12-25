
# Module 6: Plugin System (JS + WASM) Implementation Report

## 1. Overview
We have implemented **Module 6: Plugin System**, providing a highly secure, deterministic, and extensible architecture for Urja. This module enables third-party extensions through JS and WASM sandboxes while enforcing strict correctness guarantees.

## 2. Implemented Features

### 🔹 1. Formal Plugin Contract (`types.ts`)
- **PluginManifest**: Strict schema for plugin metadata, versioning, and permissions.
- **Hook Registry**: Defined a curated set of deterministic hooks (`beforeGraph`, `transformModule`, etc.).
- **Execution Records**: Every plugin execution is tracked with `inputHash`, `outputHash`, and `validation` metrics for build fingerprinting.

### 🔹 2. JS Sandbox VM (`sandbox_js.ts`)
- **Isolation**: Uses Node.js `vm` module to execute JS plugins in a restricted context.
- **Global Lockdown**: Access to `fs`, `network`, and other dangerous globals is stripped or mocked.
- **Permission Gating**: Future-proofed for fine-grained permission control.

### 🔹 3. WASM Sandbox ABI (`sandbox_wasm.ts`)
- **ABI Frozen (6.5)**: Implemented the standard ABI for WASM plugins (`_init`, `_get_manifest`, `_run_hook`).
- **Memory Safety**: No host-level memory maps or hidden entry points; communication happens via explicit JSON pointers.
- **Zero Drift**: WASM ensures the exact same execution across Linux, macOS, and CI.

### 🔹 4. Validation Pipeline (`validation.ts`)
- **Determinism Check (6.3)**: Automating the "Double-Run" test. If a plugin produces different outputs for the same input (e.g., using `Math.random()` or `Date.now()`), the system auto-rejects it.
- **Performance Budgeting**: Tracks execution time and output size to identify inefficient plugins during development.

### 🔹 5. Plugin Manager (`manager.ts`)
- **Deterministic Load Order**: Plugins are sorted by their deterministic ID (`sha256(name+version)`), ensuring identical results across builds.
- **Atomic Hooks**: Orchestrates hook execution across multiple plugins with transparent error isolation.

## 3. Guarantees Enforced
- **❌ No Side Effects**: Sandboxing prevents plugins from polluting the build environment.
- **✅ Bit-for-Bit Determinism**: Validation pipeline kills non-deterministic plugins before they can corrupt a build.
- **✅ Observability**: Every plugin action is explainable via `ExplainEvents`.

## 4. Verification
The `tests/plugin_system_test.ts` suite validates:
1.  JS sandbox execution of code transformations.
2.  Successful detection and rejection of nondeterministic plugins.
3.  Formal manifest validation.

## 5. Next Steps
- **WASM Tooling**: Provide a Rust-based SDK for authors to build Urja WASM plugins following the frozen ABI.
- **Marketplace Integration**: Extend CLI to download and verify `PluginManifest` signatures.
