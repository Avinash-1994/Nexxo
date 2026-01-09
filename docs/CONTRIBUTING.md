# Nexxo Contributor Guidelines & Deprecation Policy

## 📋 1. Versioning Strategy

Nexxo follows semantic versioning (**SemVer**). However, during the `1.0.0-freeze` phase, the core engine has special stability rules.

### 1.1 Core Stability (The "Freeze")
- **Phase 0-3** components in `src/core/engine` are considered **Frozen**.
- Any change to the 9-stage pipeline or the deterministic hashing contract MUST be accompanied by a version bump of the Core API and an update to `docs/ARCHITECTURE_FREEZE.md`.
- Snapshot tests in `tests/` MUST pass for every commit.

### 1.2 Deprecation Policy
1. **Notice**: A feature or API is marked as deprecated in `major.minor` release. A warning is added to the `log` and `explainReporter`.
2. **Support**: The deprecated feature is supported for at least one full major version cycle.
3. **Removal**: The feature is removed in the next major version.

---

## 🛠️ 2. Workflow-Driven Development

Contributors should follow this workflow to ensure core stability:

### Step 1: Stability Verification
Before making changes, run the determinism checks:
```bash
# Run core snapshot tests
npx tsx tests/determinism_snapshot_test.ts
```

### Step 2: Implementation
- Maintain **SHA-256** determinism for all new metadata.
- If adding a new stage to the engine, update the `BuildError` stage enum in `src/core/engine/types.ts`.
- Use `explainReporter.report()` liberally to maintain visibility.

### Step 3: API Mapping
- Public APIs: `src/core/engine/index.ts`.
- Internal / Unstable: `src/core/engine/hash.ts`, `src/core/engine/execute.ts`.

---

## 🧩 3. Plugin Authoring Onboarding

Nexxo plugins are more powerful than standard build tool plugins because they participate in the **Deterministic Execution Record**.

### 3.1 The Hook Contract
Plugins MUST return deterministic output for the same input. Side effects (reading files outside the root, network calls) are strictly prohibited inside `transform` hooks unless declared in permissions.

### 3.2 Metrics & Visibility
Your plugin execution time is tracked automatically. High-latency plugins will be flagged in the `explain-report.json`.

---

## 📄 4. License
MIT. Copyright (c) 2025 Avinash.
