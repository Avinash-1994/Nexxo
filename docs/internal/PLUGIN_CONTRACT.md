# Lunx Plugin Contract — Binding Internal Specification

**Status**: 🔒 Binding Contract (Phase H2.2)  
**Version**: 1.0.0  
**Authority**: Core Team  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This is **NOT documentation** — this is a **binding internal specification**.

Every plugin, official or community, MUST comply with this contract. Violations result in rejection.

---

## ✅ WHAT PLUGINS MAY DO

### 1. **Transform Module Content**

**Allowed**:
```typescript
transform(code: string, id: string): TransformResult | null {
  // ✅ Parse code
  // ✅ Modify AST
  // ✅ Generate source maps
  // ✅ Return transformed code
  return { code: transformedCode, map: sourceMap };
}
```

**Rules**:
- MUST be deterministic (same input → same output)
- MUST NOT read from filesystem beyond `id`
- MUST NOT make network requests
- MUST NOT use `Date.now()` or random values
- MUST generate valid source maps

---

### 2. **Resolve Module Specifiers**

**Allowed**:
```typescript
resolveId(source: string, importer?: string): string | null {
  // ✅ Map bare specifiers to paths
  // ✅ Apply aliasing rules
  // ✅ Return absolute path or null
  return resolvedPath;
}
```

**Rules**:
- MUST return absolute paths or null
- MUST be deterministic
- MUST NOT perform I/O (use `load` instead)

---

### 3. **Load Custom Content**

**Allowed**:
```typescript
load(id: string): LoadResult | null {
  // ✅ Read file from disk
  // ✅ Generate virtual modules
  // ✅ Return code + map
  return { code, map };
}
```

**Rules**:
- MUST be idempotent (multiple calls → same result)
- MUST NOT mutate global state
- MUST handle errors gracefully

---

### 4. **Declare Metadata**

**Allowed**:
```typescript
const plugin: LunxPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  enforce: 'pre' | 'post', // Optional ordering
  apply: 'build' | 'serve' | 'all', // Optional phase
};
```

---

## ❌ WHAT PLUGINS MUST NEVER DO

### 1. **Graph Mutation**
```typescript
// ❌ FORBIDDEN
graph.addNode(...);
graph.removeEdge(...);
graph.nodes[0].dependencies.push(...);
```

**Why**: Graph integrity is core's responsibility.

---

### 2. **Cache Manipulation**
```typescript
// ❌ FORBIDDEN
cache.invalidate(...);
cache.set(key, value);
delete cache[key];
```

**Why**: Cache invalidation is a solved problem in core.

---

### 3. **Planner Overrides**
```typescript
// ❌ FORBIDDEN
planner.setChunkingStrategy(...);
planner.overrideModuleOrder(...);
```

**Why**: Chunk splitting must remain deterministic.

---

### 4. **Global State**
```typescript
// ❌ FORBIDDEN
let globalCounter = 0;
const sharedCache = new Map();

transform(code, id) {
  globalCounter++; // Non-deterministic!
  sharedCache.set(id, code); // Leaks memory!
}
```

**Why**: Breaks determinism and snapshot testing.

---

### 5. **Async Side Effects**
```typescript
// ❌ FORBIDDEN
transform(code, id) {
  fetch('https://api.example.com/transform', { body: code });
  // Network calls break determinism
}
```

**Why**: Builds must be reproducible offline.

---

### 6. **Hidden Dependencies**
```typescript
// ❌ FORBIDDEN
transform(code, id) {
  const config = fs.readFileSync('/etc/app-config.json');
  // Undeclared dependency breaks caching
}
```

**Why**: All inputs must be explicit for cache keys.

---

## 🔒 DETERMINISM RULES

### Rule 1: Pure Functions
**Every plugin hook MUST be a pure function.**

```typescript
// ✅ GOOD
transform(code: string, id: string) {
  return { code: code.replace(/foo/g, 'bar') };
}

// ❌ BAD
let counter = 0;
transform(code: string, id: string) {
  return { code: code + `\n// Build ${counter++}` };
}
```

---

### Rule 2: No External I/O (Except `load`)
**Only `load()` may read from disk. `transform()` and `resolveId()` must not.**

```typescript
// ✅ GOOD
load(id: string) {
  if (id.endsWith('.custom')) {
    return { code: fs.readFileSync(id, 'utf-8') };
  }
}

// ❌ BAD
transform(code: string, id: string) {
  const config = fs.readFileSync('./config.json'); // Breaks caching
}
```

---

### Rule 3: Snapshot Compatibility
**All official plugins MUST pass snapshot tests.**

```bash
npm run test:snapshots -- --plugin=my-plugin
```

**Snapshot tests verify**:
- Same input → same output (determinism)
- Source maps are valid
- No hidden side effects

---

## ⚡ PERFORMANCE EXPECTATIONS

### Rule 1: No Blocking Operations
**Plugins MUST NOT block the event loop.**

```typescript
// ❌ BAD
transform(code: string, id: string) {
  const result = execSync('some-slow-command'); // Blocks!
}

// ✅ GOOD (if truly needed)
async transform(code: string, id: string) {
  const result = await exec('some-command'); // Non-blocking
}
```

---

### Rule 2: Bounded Memory
**Plugins MUST NOT leak memory.**

- Clear caches between builds
- Avoid global state
- Use WeakMaps for metadata

---

### Rule 3: Fail Fast
**If a plugin cannot handle input, throw immediately.**

```typescript
// ✅ GOOD
transform(code: string, id: string) {
  if (!id.endsWith('.custom')) return null; // Skip
  if (!isValidSyntax(code)) {
    throw new Error(`Invalid syntax in ${id}`);
  }
}
```

---

## 📸 SNAPSHOT SAFETY RULES

### Rule 1: No Timestamps
```typescript
// ❌ BAD
transform(code) {
  return { code: code + `\n// Built at ${new Date()}` };
}

// ✅ GOOD
transform(code) {
  return { code: code + `\n// Built with Lunx` };
}
```

---

### Rule 2: Stable Output Order
```typescript
// ❌ BAD
transform(code) {
  const imports = new Set(['a', 'b', 'c']);
  return { code: [...imports].join('\n') }; // Set order is unstable
}

// ✅ GOOD
transform(code) {
  const imports = ['a', 'b', 'c'].sort();
  return { code: imports.join('\n') };
}
```

---

## 🔄 VERSIONING GUARANTEES

### v1.x Promise
**No breaking changes to plugin API in v1.x.**

**What this means**:
- Plugin interface signatures are frozen
- Hook execution order is stable
- Error behavior is consistent

**What this does NOT mean**:
- Internal core changes are allowed
- Performance improvements may change timings
- New optional hooks may be added

---

### Deprecation Policy
**If we must deprecate a hook**:
1. Mark as `@deprecated` in TypeScript
2. Log warnings for 2 minor versions
3. Remove in next major version

---

## 🚨 REJECTION CRITERIA

A plugin design is **REJECTED** if:

1. ❌ It mutates the dependency graph
2. ❌ It requires access to cache internals
3. ❌ It is non-deterministic
4. ❌ It blocks the event loop
5. ❌ It has hidden global state
6. ❌ It fails snapshot tests
7. ❌ It requires core modifications

**No exceptions. No negotiations.**

---

## 📋 Plugin Submission Checklist

Before submitting a plugin for "official" status:

- [ ] Passes all snapshot tests
- [ ] No global state
- [ ] No network requests
- [ ] No filesystem reads (except in `load`)
- [ ] Deterministic output
- [ ] Valid source maps
- [ ] Memory-safe (no leaks)
- [ ] Documented error cases
- [ ] Versioned (semver)
- [ ] Has integration tests

---

## 🎯 Exit Condition (H2.2)

> "You can reject a plugin design by pointing to one paragraph, not an opinion."

**Verification**:
1. Plugin uses global state → **Point to Section: Global State**
2. Plugin mutates graph → **Point to Section: Graph Mutation**
3. Plugin is non-deterministic → **Point to Section: Determinism Rules**

---

## 🧠 Governance Rule

**"If extending Lunx is easier than understanding it, the extension surface is wrong."**

This contract exists to make **correctness the easiest path**.

---

**Signed**: Lunx Core Team  
**Binding**: All plugins (official, community, experimental)  
**Effective**: Phase H2.2 Complete
