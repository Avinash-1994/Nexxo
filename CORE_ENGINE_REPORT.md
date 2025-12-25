
# Module 1: Core Build Engine Implementation Report

## 1. Overview
We have successfully implemented **Module 1: The Core Build Engine**, the "heart" of the Urja build tool. This module provides absolute guarantees for **determinism**, **verifiability**, and **parallel execution safety**, serving as the trusted foundation for all higher-level features.

## 2. Architecture Implemented

The engine follows a strict **9-Stage Pipeline**:

| Stage | Name | Responsibility | Implementation Details |
|-------|------|----------------|------------------------|
| **1** | **Initialization** | Setup Context | Normalizes config, freezes environment, initializes cache. |
| **2** | **Fingerprinting** | Verify Inputs | **Scans entire source tree** and hashes config + engine + sources to stringently ID the build input. |
| **3** | **Graph Injection** | Dependency Graph | Attaches the dependency graph and computes a semantic `graphHash`. |
| **4** | **Planning** | Deterministic Plan | Traverses graph using **sorted keys** to generate a stable `ChunkPlan`. No IO/Transforms here. |
| **5** | **Parallel Plan** | Execution Strategy | Groups independent chunks for parallel execution. Currently treats all chunks as a parallel wave. |
| **6** | **Determinism** | Safety Check | Verifies plan integrity. **Throws error in CI mode** if non-deterministic behavior is detected. |
| **7** | **Execution** | Transform & Bundle | Executes chunks in parallel but collects results into a **sorted map** for consistent processing. |
| **8** | **Emission** | Write Artifacts | Writes files to disk and dumps the **Explain Mode** log (`build-explain.json`). |
| **9** | **Audit** | Output Fingerprint | Computes a final hash of all output artifacts for CI verification (`inputHash` + `outputHash`). |

## 3. Key Technical Features

### 🔐 3.1 Strict Determinism
- **Canonical Hashing**: A central `canonicalHash` utility ensures all hashes use SHA-256, sorted keys, and stable JSON serialization.
- **Sorted Traversal**: Graph traversal (BFS) and chunk generation explicitly sort dependencies to ensure `File A` + `File B` always produces the same chunk ID regardless of FS read order.
- **Artifact Sorting**: Even though execution is parallel, artifacts are re-sorted by their deterministic Plan ID before emission.

### 🛡️ 3.2 Verifiability (CI Ready)
- **Fingerprints**:
    - `InputFingerprint`: Uniquely identifies the *start* state.
    - `BuildFingerprint`: Uniquely identifies the *end* state.
- **Verification Rule**: If `InputFingerprint` is identical, `BuildFingerprint` **must** be identical. This is now automatically tested.

### ⚡ 3.3 Parallel Execution
- The `executeParallel` stage is designed to accept an `ExecutionPlan`.
- Chunks are grouped into `parallelGroups`.
- While currently simulating parallelism with `Promise.all`, the architecture is ready for actual worker threads without changing the planning logic.

### 🔍 3.4 Explain Mode
- An `ExplainReporter` singleton tracks every major decision.
- Events include: `init`, `config_resolved`, `plan_started`, `chunk_generated`, `cache_hit`, `emit`.
- **Outcome**: A `build-explain.json` file is generated with every build, allowing absolute transparency into *why* a build happened the way it did.

## 4. Verification & Testing

### Test Suite: `tests/core_engine_test.ts`
We created a comprehensive test suite that verifies the core guarantees:

1.  **Initial Build**: Confirms the pipeline runs end-to-end and produces artifacts.
2.  **Determinism Check**: Runs the **exact same build twice**. Asserts that Input Hash, Plan Hash, and Output Hash match **bit-for-bit**.
3.  **Input Sensitivity**: Modifies a single source file. Asserts that **Input Hash changes** AND **Output Hash changes**.
    *   *Note*: This required implementing full directory scanning in Stage 2 to catch non-entry file changes.
4.  **Explainability**: Verifies that `build-explain.json` is created and contains events for all stages.

### Status
- **Tests Passed**: ✅ All robust core engine tests are passing.
- **Integration**: Added to `npm run test:all`.

## 5. Next Steps
- **Module 2 (Dependency Graph)**: The engine currently uses a basic internal graph builder. This needs to be replaced by the full Module 2 implementation.
- **Real Transformers**: The execution phase currently acts as a pass-through concatenator. It needs to call actual transformers (esbuild/swc).
- **Worker Threads**: Upgrade `executeParallel` to use actual Node.js worker threads for CPU-heavy tasks.
