# How a Nexxo Plugin Works — Internal Guide

**Audience**: Core engineers, plugin authors (advanced)  
**Purpose**: Mental model, not marketing  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This guide explains **HOW** Nexxo plugins work internally, not **WHY** you should use them.

Written as if onboarding a new core engineer.

---

## 🧠 Mental Model

### Plugins Are Transform Pipelines

```
Source Code → [Plugin 1] → [Plugin 2] → [Plugin N] → Bundled Code
```

**Key Insight**: Plugins are **pure functions** in a pipeline.

---

## 🔄 Plugin Lifecycle

### 1. **Registration** (Build Start)

```typescript
// User's nexxo.config.ts
export default {
  plugins: [
    myPlugin({ option: 'value' }),
  ],
};
```

**What happens**:
1. Config loader calls `myPlugin({ option: 'value' })`
2. Plugin returns a `NexxoPlugin` object
3. Nexxo validates the plugin interface
4. Plugin is added to the pipeline

---

### 2. **Resolution** (Module Discovery)

```typescript
// Plugin hook
resolveId(source: string, importer?: string): string | null {
  if (source === 'virtual:my-module') {
    return '\0virtual:my-module'; // \0 = virtual module
  }
  return null; // Let other plugins handle it
}
```

**When called**:
- Every `import` statement
- Every `require()` call
- Every dynamic `import()`

**Return values**:
- `string`: Resolved absolute path
- `null`: Let next plugin try

**Rules**:
- MUST be deterministic
- MUST return absolute paths or null
- MUST NOT perform I/O (use `load` instead)

---

### 3. **Loading** (Module Content)

```typescript
// Plugin hook
load(id: string): { code: string; map?: SourceMap } | null {
  if (id === '\0virtual:my-module') {
    return {
      code: 'export const value = 42;',
      map: null,
    };
  }
  return null; // Let default loader handle it
}
```

**When called**:
- After `resolveId` returns a path
- Before `transform` is called

**Return values**:
- `{ code, map }`: Module content
- `null`: Use default file loader

**Rules**:
- MUST be idempotent (same `id` → same result)
- MAY read from filesystem
- MUST NOT mutate global state

---

### 4. **Transformation** (Code Modification)

```typescript
// Plugin hook
transform(code: string, id: string): { code: string; map?: SourceMap } | null {
  if (id.endsWith('.custom')) {
    return {
      code: code.replace(/OLD/g, 'NEW'),
      map: generateSourceMap(code, id),
    };
  }
  return null; // Skip this file
}
```

**When called**:
- After `load` returns code
- For every module in the graph

**Return values**:
- `{ code, map }`: Transformed code
- `null`: No transformation needed

**Rules**:
- MUST be deterministic
- MUST generate valid source maps
- MUST NOT read from filesystem (use `load` instead)
- MUST NOT use `Date.now()` or random values

---

## 🔍 Plugin Execution Order

### Default Order
```
[Pre Plugins] → [Normal Plugins] → [Post Plugins]
```

### Enforcement
```typescript
const plugin: NexxoPlugin = {
  name: 'my-plugin',
  enforce: 'pre', // Run before normal plugins
};
```

**Options**:
- `'pre'`: Run first (e.g., aliasing)
- `undefined`: Normal order
- `'post'`: Run last (e.g., minification)

---

## 🧪 Example: Virtual Module Plugin

```typescript
export function virtualModulePlugin() {
  const virtualModuleId = 'virtual:config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'virtual-module',
    
    resolveId(source: string) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },
    
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return {
          code: `export const config = ${JSON.stringify({ foo: 'bar' })};`,
        };
      }
      return null;
    },
  };
}
```

**Usage**:
```typescript
// User code
import { config } from 'virtual:config';
console.log(config.foo); // 'bar'
```

---

## 🧪 Example: Transform Plugin

```typescript
export function replacePlugin(options: { from: string; to: string }) {
  return {
    name: 'replace',
    
    transform(code: string, id: string) {
      if (!code.includes(options.from)) {
        return null; // No changes needed
      }
      
      const newCode = code.replace(
        new RegExp(options.from, 'g'),
        options.to
      );
      
      return {
        code: newCode,
        map: null, // Simple replace, no source map needed
      };
    },
  };
}
```

**Usage**:
```typescript
// nexxo.config.ts
export default {
  plugins: [
    replacePlugin({ from: 'process.env.NODE_ENV', to: '"production"' }),
  ],
};
```

---

## 🚫 Common Mistakes

### Mistake 1: Non-Deterministic Output
```typescript
// ❌ BAD
transform(code: string, id: string) {
  return {
    code: code + `\n// Built at ${Date.now()}`,
  };
}

// ✅ GOOD
transform(code: string, id: string) {
  return {
    code: code + `\n// Built with Nexxo`,
  };
}
```

---

### Mistake 2: Global State
```typescript
// ❌ BAD
let counter = 0;

transform(code: string, id: string) {
  counter++;
  return { code: code + `\n// File ${counter}` };
}

// ✅ GOOD
transform(code: string, id: string) {
  return { code: code + `\n// File ${id}` };
}
```

---

### Mistake 3: I/O in Transform
```typescript
// ❌ BAD
transform(code: string, id: string) {
  const config = fs.readFileSync('./config.json');
  return { code: code.replace('CONFIG', config) };
}

// ✅ GOOD
load(id: string) {
  if (id === 'virtual:config') {
    const config = fs.readFileSync('./config.json');
    return { code: `export default ${config}` };
  }
}
```

---

## 🔒 What Plugins CANNOT Do

### 1. Mutate the Dependency Graph
```typescript
// ❌ FORBIDDEN
transform(code: string, id: string) {
  graph.addNode({ id: 'new-module' }); // No access to graph
}
```

**Why**: Graph integrity is core's responsibility.

---

### 2. Override Planner Logic
```typescript
// ❌ FORBIDDEN
transform(code: string, id: string) {
  planner.setChunkStrategy('aggressive'); // No access to planner
}
```

**Why**: Chunk splitting must remain deterministic.

---

### 3. Invalidate Cache
```typescript
// ❌ FORBIDDEN
transform(code: string, id: string) {
  cache.invalidate(id); // No access to cache
}
```

**Why**: Cache invalidation is handled by core.

---

## 🧠 Advanced: Plugin Context

Plugins receive a `context` object with utilities:

```typescript
interface PluginContext {
  // Emit a warning
  warn(message: string): void;
  
  // Emit an error (non-fatal)
  error(message: string): void;
  
  // Get module info (read-only)
  getModuleInfo(id: string): ModuleInfo | null;
}
```

**Example**:
```typescript
transform(code: string, id: string) {
  if (code.includes('DEPRECATED_API')) {
    this.warn(`${id} uses deprecated API`);
  }
  return null;
}
```

---

## 📋 Plugin Development Checklist

Before submitting a plugin:

- [ ] No global state
- [ ] Deterministic output
- [ ] Valid source maps
- [ ] No filesystem reads in `transform`
- [ ] No network requests
- [ ] Passes snapshot tests
- [ ] Error handling
- [ ] TypeScript types

---

## 🎯 Key Takeaways

1. **Plugins are pure functions** in a pipeline
2. **`resolveId`** maps specifiers to paths
3. **`load`** provides module content
4. **`transform`** modifies code
5. **Determinism is mandatory**
6. **No graph/planner/cache access**

---

**Next Steps**: Read `PLUGIN_CONTRACT.md` for binding rules.
