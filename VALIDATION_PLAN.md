
# Option 3: Modules 1–4 Validation Plan (Frozen Phase)

## 🚫 Phase Rules
- **❌ No new features**
- **❌ No Dev Server / HMR work**
- **✅ Only bug fixes, hardening, and testing**

## 🏁 Objectives
Verify the "Core Truth" of the build engine:
1.  **Determinism**: Identical inputs = Identical hashes (Bit-for-bit).
2.  **Interop**: CJS/ESM mixing works seamlessly without config.
3.  **Resilience**: Deep dependency edits trigger correct upgrades.
4.  **Explainability**: Every decision is logged.

## 🧪 Validation Targets (Simulated "Real World")

We will construct complex scenarios in `tests/validation/` to mimic real-world complexity.

### 1. The "Kitchen Sink" Monorepo
- **Structure**:
    - `packages/ui` (React + ESM + CSS)
    - `packages/utils` (TS + CJS exports)
    - `apps/web` (Next.js-like structure, consuming ui/utils)
- **Goal**: Verify dependency graph traversal across workspaces and interop between internal packages.

### 2. The "Legacy Nightmare"
- **Dependencies**: 
    - `legacy-lib` (CommonJS with `module.exports = function`, `exports.foo = ...`)
    - `mixed-lib` (ESM wrapper around CJS)
    - `circular-a` <-> `circular-b`
- **Goal**: Verify Module 4 (Interop) handles legacy patterns and Module 2 handles cycles correctly.

### 3. The "Determinism Loop"
- **Action**: Build the Kitchen Sink project 10 times in a row.
- **Expectation**: `InputHash`, `PlanHash`, `GraphHash`, `OutputHash` must be identical every single time.

### 4. The "Butterfly Effect" (Change Sensitivity)
- **Action**: Modify 1 line in a deep leaf node (`packages/utils/src/date.ts`).
- **Expectation**:
    - `utils` output hash changes.
    - `ui` (dependent) output hash changes.
    - `web` (dependent) output hash changes.
    - **Explain Log** shows exactly why cache was invalidated.

## 📅 Execution Schedule

1.  **Setup**: Create `scripts/validation/run-validation.ts`.
2.  **Baseline**: Run targets 1 & 2.
3.  **Stress**: Run target 3 (Determinism).
4.  **Sensitivity**: Run target 4.
5.  **Audit**: Review `build-explain.json` manually.

## 📦 Artifacts
- **Validation Script**: `scripts/validation/run-validation.ts`
- **Report**: `VALIDATION_REPORT.md`
