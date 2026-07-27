# Lunx Extension Surface — Internal Contract

**Status**: 🔒 Locked (Phase H2.1)  
**Version**: 1.0.0  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This document defines the **ONLY** extension points in Lunx that are safe, supported, and guaranteed stable across minor versions.

**Governance Rule**: If it's not listed here, it's internal and subject to change without notice.

---

## ✅ ALLOWED Extension Points

### 1. **Plugins** — Transform-Level Only

**What**: Deterministic transformations of module content.

**Interface**: 
```typescript
interface LunxPlugin {
  name: string;
  transform?(code: string, id: string): { code: string; map?: SourceMap } | null;
  load?(id: string): { code: string; map?: SourceMap } | null;
  resolveId?(source: string, importer?: string): string | null;
}
```

**Guarantees**:
- ✅ Stable across v1.x
- ✅ Deterministic (same input → same output)
- ✅ No side effects allowed
- ✅ Snapshot-tested

**Forbidden**:
- ❌ Graph mutation
- ❌ Planner overrides
- ❌ Cache invalidation hooks
- ❌ Global state

---

### 2. **Framework Pipelines** — Composition Only

**What**: Pre-configured plugin chains for specific frameworks.

**Interface**:
```typescript
interface FrameworkPreset {
  name: string;
  plugins: LunxPlugin[];
  config?: Partial<BuildConfig>;
}
```

**Guarantees**:
- ✅ Composable with other presets
- ✅ No core logic modification
- ✅ Framework-specific transforms only

**Forbidden**:
- ❌ Core bundler logic changes
- ❌ Graph algorithm modifications
- ❌ Hashing logic overrides

---

### 3. **Inspector Extensions** — Read-Only Graph Consumers

**What**: Tools that visualize or analyze the dependency graph.

**Interface**:
```typescript
interface InspectorExtension {
  name: string;
  analyze(graph: DependencyGraph): Report;
}

// DependencyGraph is read-only
type DependencyGraph = Readonly<{
  nodes: ReadonlyArray<GraphNode>;
  edges: ReadonlyArray<GraphEdge>;
}>;
```

**Guarantees**:
- ✅ Read-only access to graph
- ✅ No build impact
- ✅ Stable graph schema

**Forbidden**:
- ❌ Graph mutation
- ❌ Build process interference
- ❌ Cache manipulation

---

## ❌ EXPLICITLY FORBIDDEN

The following are **NEVER** exposed as extension points:

### 1. **Graph Internals**
- Node creation/deletion
- Edge manipulation
- Topological sort algorithm
- Cycle detection logic

### 2. **Planner Logic**
- Chunk splitting decisions
- Module ordering
- Optimization passes
- Tree-shaking rules

### 3. **Hashing System**
- Content hash generation
- Cache key computation
- Invalidation triggers

### 4. **Cache Layer**
- Cache read/write
- Invalidation hooks
- Storage backend

---

## 🔍 API Visibility Annotations

All code in `src/` is annotated with one of:

### `@public`
- Stable API
- Semantic versioning applies
- Breaking changes require major version bump

### `@internal`
- Implementation detail
- May change in any release
- Do not depend on this

### `@experimental`
- Unstable, may be removed
- Requires explicit opt-in
- No compatibility guarantees

---

## 🛡️ Enforcement

### At Development Time
- TypeScript visibility modifiers
- ESLint rules for internal imports
- Code review checklist

### At Runtime
- Plugins cannot import from `src/core/*`
- Graph mutations throw errors
- Cache access is proxied

### At Release Time
- API surface diff check
- Breaking change detection
- Changelog validation

---

## 📋 Extension Surface Checklist

Before exposing a new API, verify:

- [ ] Is it deterministic?
- [ ] Can it be snapshot-tested?
- [ ] Does it avoid global state?
- [ ] Is the interface minimal?
- [ ] Can we maintain it for 2+ years?
- [ ] Does it have a clear use case?

**If any answer is "no", it stays internal.**

---

## 🚨 Exit Condition (H2.1)

> "A contributor cannot accidentally touch core graph or planner APIs."

**Verification**:
1. Try to import `src/core/graph.ts` from a plugin → **Should fail**
2. Try to mutate graph in inspector → **Should throw**
3. Try to override planner → **No API exists**

---

**Signed**: Lunx Core Team  
**Effective**: Phase H2.1 Complete
