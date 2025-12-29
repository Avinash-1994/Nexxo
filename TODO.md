# Urja Roadmap - Implementation Progress

## Phase 0: Stabilize & Freeze the Core
- [x] Create Architecture Freeze Document
    - [x] Define Graph model (nodes, edges, invalidation rules)
    - [x] Define Deterministic hashing contract
    - [x] Define CSS graph semantics (ordering, split/merge rules)
- [x] Map Public vs Internal APIs
    - [x] `CoreGraphAPI` -> stable
    - [x] Helpers / internals -> unstable
- [x] Version Core APIs (core@1.x)
- [x] Implement Determinism Snapshot Tests
    - [x] Ensure tests fail on semantic drift

## Phase 1: Adoption Enablement (P0)
### 1.1 Plugin Compatibility Layer
- [x] Rollup compatibility layer
    - [x] Explicitly supported hooks (transformModule, resolveId, load, renderChunk)
    - [x] Explicitly unsupported hooks (documented in code)
- [x] Webpack loader compatibility
    - [x] Transform-only, stateless loaders
- [x] Core plugin bundle (JS/TS, CSS, Assets)

### 1.2 Framework Pipelines
- [x] Framework pipeline interface (`src/core/pipeline/framework-pipeline.ts`)
- [x] First-class React pipeline
- [x] One-command project bootstrap (`urja bootstrap`)
- [x] Opinionated defaults with escape hatches

## Phase 2: Productivity & Visibility (P1)
### 2.1 Dev Server as a Product
- [x] Error overlays (build + runtime)
- [x] Proxy + HTTPS support
- [x] Clear rebuild reason reporting
- [x] Event-driven dev server integration

### 2.2 Graph Observability
- [x] Standard graph event model (`explainReporter`)
- [x] CLI analysis tools (added `/__graph` endpoint)
- [x] Dev-server-accessible graph UI (`src/visual/graph-ui.ts`)
- [x] Plugin execution visibility (Plugin metrics summary)

## Phase 3: Performance Intelligence (P2)
### 3.1 Incremental Build Precision
- [x] Node classification (JS / CSS / Asset)
- [x] Invalidation rules per node type (Content-hash based keys)
- [x] Persistent caching boundaries (SQLite persistent cache)

### 3.2 Optional Optimization Passes
- [x] Dedicated optimization phase (Stage 7.5 in Engine)
- [x] Isolated heuristic modules (Minification pass)
- [x] Fully opt-in configuration (Minify flag support)

## Phase 4: Scope Expansion (SSR / Edge)
- [x] Multi-target graph model (Target affinity in GraphNode/GraphEdge)
- [x] Client/server/edge separation (Target-aware scanAndAdd)
- [x] Hydration + manifest support (build-manifest.json emission)

## Phase 5: Operational Maturity
- [x] Workflow-driven documentation (`docs/CONTRIBUTING.md`)
- [x] Versioning & deprecation policy (Defined in CONTRIBUTING.md)
- [x] Contributor guidelines (Defined in CONTRIBUTING.md)
- [x] Plugin author onboarding (Plugin authoring section)
