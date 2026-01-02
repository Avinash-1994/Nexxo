# What NOT to Touch in Urja Core — Internal Guide

**Audience**: New core engineers, contributors  
**Purpose**: Prevent accidental core breakage  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This guide explains **WHAT NOT TO TOUCH** in the Urja codebase.

**Rule**: If it's listed here, you need explicit approval from the core team before modifying it.

---

## 🚨 CRITICAL: Never Touch These

### 1. **Dependency Graph (`src/core/graph.ts`)**

**What it does**: Builds and maintains the module dependency graph.

**Why it's critical**:
- Foundation of all build correctness
- Determinism depends on it
- Snapshot tests verify it
- Changes break everything

**Protected APIs**:
```typescript
// ❌ DO NOT MODIFY
class DependencyGraph {
  addNode(node: GraphNode): void;
  addEdge(from: string, to: string): void;
  removeNode(id: string): void;
  topologicalSort(): string[];
  detectCycles(): string[][];
}
```

**If you need to modify**:
1. Write a design doc
2. Get approval from 2+ core engineers
3. Add comprehensive tests
4. Update all snapshots
5. Document breaking changes

---

### 2. **Planner Logic (`src/core/planner.ts`)**

**What it does**: Decides chunk splitting and module ordering.

**Why it's critical**:
- Deterministic chunk splitting
- Optimization passes
- Tree-shaking decisions
- Cache invalidation triggers

**Protected APIs**:
```typescript
// ❌ DO NOT MODIFY
class Planner {
  planChunks(graph: DependencyGraph): Chunk[];
  optimizeModuleOrder(chunk: Chunk): Module[];
  applyTreeShaking(module: Module): Module;
}
```

**If you need to modify**:
1. Prove the current behavior is incorrect
2. Provide failing test case
3. Propose minimal fix
4. Get approval from core team
5. Verify no performance regression

---

### 3. **Hashing System (`src/core/hash.ts`)**

**What it does**: Generates content hashes for modules and chunks.

**Why it's critical**:
- Cache invalidation correctness
- Deterministic builds
- Snapshot stability
- Long-term caching

**Protected APIs**:
```typescript
// ❌ DO NOT MODIFY
function hashContent(content: string): string;
function hashModule(module: Module): string;
function hashChunk(chunk: Chunk): string;
```

**If you need to modify**:
1. Understand this breaks ALL caches
2. Requires major version bump
3. Migration path required
4. Announce 2 versions in advance

---

### 4. **Cache Layer (`src/core/cache.ts`)**

**What it does**: Manages build cache and invalidation.

**Why it's critical**:
- Build performance
- Correctness guarantees
- Invalidation logic
- Persistence layer

**Protected APIs**:
```typescript
// ❌ DO NOT MODIFY
class Cache {
  get(key: string): CachedResult | null;
  set(key: string, value: CachedResult): void;
  invalidate(key: string): void;
  clear(): void;
}
```

**If you need to modify**:
1. Prove cache is incorrect
2. Provide reproducible case
3. Minimal fix only
4. Verify no perf regression

---

### 5. **Module Resolution (`src/core/resolver.ts`)**

**What it does**: Resolves bare specifiers to absolute paths.

**Why it's critical**:
- Node.js compatibility
- Package.json exports
- Alias resolution
- Deterministic resolution

**Protected APIs**:
```typescript
// ❌ DO NOT MODIFY (core logic)
function resolveModule(specifier: string, importer: string): string;
function resolvePackageExports(pkg: PackageJson, subpath: string): string;
```

**If you need to modify**:
1. Check if plugin can handle it
2. If not, propose minimal change
3. Add comprehensive tests
4. Verify Node.js compatibility

---

## ⚠️ CAUTION: Modify with Care

### 6. **Plugin System (`src/plugins/index.ts`)**

**What it does**: Plugin registration and execution.

**Why it's sensitive**:
- Public API surface
- Breaking changes affect ecosystem
- Performance critical

**What you CAN modify**:
- ✅ Add new optional hooks
- ✅ Improve error messages
- ✅ Add validation

**What you CANNOT modify**:
- ❌ Change hook signatures
- ❌ Change execution order
- ❌ Remove hooks
- ❌ Change error behavior

---

### 7. **Build Pipeline (`src/core/pipeline.ts`)**

**What it does**: Orchestrates the build process.

**Why it's sensitive**:
- Execution order matters
- Performance critical
- Error handling

**What you CAN modify**:
- ✅ Add logging
- ✅ Improve error messages
- ✅ Add metrics

**What you CANNOT modify**:
- ❌ Change step order
- ❌ Skip steps
- ❌ Change error handling

---

### 8. **Config System (`src/config/index.ts`)**

**What it does**: Loads and validates user configuration.

**Why it's sensitive**:
- Public API surface
- Breaking changes affect users
- Validation logic

**What you CAN modify**:
- ✅ Add new optional fields
- ✅ Improve validation
- ✅ Better error messages

**What you CANNOT modify**:
- ❌ Remove fields
- ❌ Change field types
- ❌ Change defaults (without deprecation)

---

## ✅ SAFE: Modify Freely

### 9. **CLI (`src/cli/*.ts`)**

**What it does**: Command-line interface.

**Why it's safe**:
- User-facing only
- No core logic
- Easy to test

**Modify freely**:
- ✅ Add new commands
- ✅ Improve help text
- ✅ Better error messages
- ✅ Add flags

**Just ensure**:
- Backward compatibility
- Help text updated
- Tests added

---

### 10. **Utilities (`src/utils/*.ts`)**

**What it does**: Helper functions.

**Why it's safe**:
- No state
- Pure functions
- Easy to test

**Modify freely**:
- ✅ Add new utilities
- ✅ Optimize existing ones
- ✅ Fix bugs

**Just ensure**:
- Tests pass
- No breaking changes

---

### 11. **Dev Server (`src/dev/devServer.ts`)**

**What it does**: Development server with HMR.

**Why it's moderately safe**:
- Development only
- No production impact
- Can be iterated

**Modify with care**:
- ✅ Improve HMR
- ✅ Better error overlay
- ✅ Performance improvements

**Just ensure**:
- No breaking changes to HMR API
- Framework compatibility maintained

---

## 🔍 How to Know If You Should Touch Something

### Ask These Questions

1. **Is it in `src/core/`?**
   - ❌ Probably don't touch it
   - Get approval first

2. **Does it affect determinism?**
   - ❌ Definitely don't touch it
   - Snapshot tests will break

3. **Is it a public API?**
   - ⚠️ Breaking changes require major version
   - Deprecation path required

4. **Is it performance-critical?**
   - ⚠️ Benchmark before and after
   - No regressions allowed

5. **Is it in `src/cli/` or `src/utils/`?**
   - ✅ Probably safe
   - Just add tests

---

## 📋 Modification Approval Process

### For Critical Code (src/core/*)

1. **Write Design Doc**
   - What are you changing?
   - Why is it necessary?
   - What are the risks?
   - What are the alternatives?

2. **Get Approval**
   - 2+ core engineers must approve
   - Security review if needed
   - Performance review if needed

3. **Implement**
   - Minimal change only
   - Comprehensive tests
   - Update snapshots

4. **Review**
   - Code review by 2+ engineers
   - Performance benchmarks
   - Snapshot verification

5. **Document**
   - Update CHANGELOG.md
   - Update migration guide if breaking
   - Update internal docs

---

### For Public APIs

1. **Deprecation First**
   - Mark as `@deprecated`
   - Log warnings
   - Document migration path

2. **Wait 2 Minor Versions**
   - Give users time to migrate
   - Monitor usage

3. **Remove in Major Version**
   - Announce in advance
   - Update all examples
   - Update documentation

---

## 🚨 Emergency Fixes

**If you find a critical bug in protected code**:

1. **Verify it's critical**
   - Security issue?
   - Data corruption?
   - Build failure?

2. **Minimal Fix**
   - Fix the bug, nothing else
   - No refactoring
   - No "while I'm here" changes

3. **Fast Review**
   - Get 1 core engineer approval
   - Merge quickly
   - Hotfix release

4. **Follow-up**
   - Write post-mortem
   - Add regression test
   - Document the issue

---

## 🎯 Key Takeaways

1. **`src/core/*` is sacred** — don't touch without approval
2. **Determinism is non-negotiable** — snapshots must pass
3. **Public APIs are frozen** — breaking changes require major version
4. **Performance matters** — benchmark before and after
5. **When in doubt, ask** — better safe than sorry

---

## 🧠 Mental Model

**Think of Urja core as a database**:
- You wouldn't modify PostgreSQL's B-tree implementation
- You wouldn't change MySQL's transaction log format
- You wouldn't alter Redis's persistence layer

**Same applies here**:
- Don't modify the graph
- Don't change the planner
- Don't touch the cache

**Instead**:
- Use plugins
- Extend the CLI
- Improve utilities
- Better error messages

---

**If you're unsure, ask in #urja-core Slack channel.**

**Better to ask than to break production.**
