# Urja Fix Plan - Implementation Tracking

## PHASE A: Correct the Foundation (MANDATORY)
- [x] **A1. Documentation & Scope Corrections**
    - [x] Rename `docs/ARCHITECTURE_FREEZE.md` to `docs/CORE_CONTRACT.md` and refine language.
    - [x] Explicitly mark Multi-target graph as **Internal/Experimental**.
    - [x] Explicitly mark AI features as **Non-Core/Future**.
    - [x] Renumber pipeline stages to remove decimals (7.5 -> 8, etc.).
    - [x] Tighten plugin compatibility language (transform-level only).
    - [x] Verify "Exit Condition": One authoritative contract exists.

## PHASE B: Fix Adoption Friction (HIGHEST PRIORITY)
- [x] **B1. Plugin Compatibility Hardening**
    - [x] Formalize compatibility matrix (Rollup: transform/bundle, Webpack: loader).
    - [x] Freeze compatibility behavior in Public API.
- [x] **B2. Core Plugin Baseline**
    - [x] Consolidate JS/TS, CSS, Assets, and Env into a single "Infrastructure" preset.
    - [x] Ensure this preset is applied by default in `FrameworkPipeline`.
- [x] **B3. Framework Pipelines (React First)**
    - [x] Refine `FrameworkPipeline` to fully own dev/build config.
    - [x] Ensure Graph API remains internal/hidden for standard users.

## PHASE C: Fix Daily Developer Experience
- [x] **C1. Dev Server Reliability & Transparency**
    - [x] Standardize error surfacing and rebuild reason reporting.
    - [x] Implement explicit state reset rules.
- [x] **C2. Graph Observability**
    - [x] Formalize the graph event stream schema.
    - [x] Stabilize the inspector JSON/UI schema (Live graph at /__graph).

## PHASE D: Fix Performance Intelligently
- [x] **D1. Incremental Precision**
    - [x] Classify nodes (JS/CSS/Asset).
    - [x] Content-hash based invalidation.
    - [x] Persistent cache enabled by default.
- [x] **D2. Optional Optimization Layer**
    - [x] Build optimization as a separate opt-in phase.
    - [x] Heuristic minification modules.

## PHASE E: Deferred Expansion
- [x] **E1. Multi-Target Orchestration (SSR / Edge)**
    - [x] Mark current implementation as Internal/Experimental.
    - [x] Defer public API until Phase B/C are stable.

---
## Operational Discipline (Continuous)
- [x] Enforce versioning rules.
- [x] Document all deprecations.
- [x] Update snapshot tests for any core metadata changes.
