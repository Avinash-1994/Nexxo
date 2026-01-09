# How Compatibility Adapters Work — Internal Guide

**Audience**: Core engineers  
**Purpose**: Understanding framework integration internals  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This guide explains **HOW** framework compatibility adapters work in Nexxo.

Written for core engineers who need to understand or modify framework integrations.

---

## 🧠 Mental Model

### Adapters Are Framework-Specific Transform Chains

```
React JSX → [Babel Transform] → JavaScript
Vue SFC → [Vue Compiler] → JavaScript + CSS
Svelte → [Svelte Compiler] → JavaScript + CSS
```

**Key Insight**: Each framework has a **compiler** that Nexxo wraps.

---

## 🏗️ Architecture

### 1. **Framework Detection**

```typescript
// src/config/index.ts
function detectFramework(config: BuildConfig): Framework {
  const pkg = readPackageJson(config.root);
  
  if (pkg.dependencies?.['react']) return 'react';
  if (pkg.dependencies?.['vue']) return 'vue';
  if (pkg.dependencies?.['svelte']) return 'svelte';
  // ...
  
  return 'vanilla'; // Default fallback
}
```

**How it works**:
1. Read `package.json`
2. Check for framework dependencies
3. Return framework name
4. Fallback to `'vanilla'` if none found

---

### 2. **Preset Loading**

```typescript
// src/presets/index.ts
export function getFrameworkPreset(framework: Framework): NexxoPlugin[] {
  switch (framework) {
    case 'react':
      return reactPreset();
    case 'vue':
      return vuePreset();
    case 'svelte':
      return sveltePreset();
    default:
      return [];
  }
}
```

**Presets are just plugin arrays**:
```typescript
function reactPreset(): NexxoPlugin[] {
  return [
    jsTransformPlugin({ jsx: 'automatic' }),
    reactRefreshPlugin(),
  ];
}
```

---

### 3. **Transform Pipeline**

```
Source File → [Framework Compiler] → JavaScript → [Nexxo Pipeline] → Bundle
```

**Example: React**
```typescript
// Input: App.tsx
function App() {
  return <div>Hello</div>;
}

// After jsTransformPlugin
import { jsx as _jsx } from 'react/jsx-runtime';
function App() {
  return _jsx('div', { children: 'Hello' });
}
```

---

## 🔧 Framework-Specific Adapters

### React Adapter

**Files**:
- `src/plugins/js-transform.ts` (Babel with React preset)
- `src/plugins/react-refresh.ts` (HMR integration)

**How it works**:
```typescript
// js-transform.ts
transform(code: string, id: string) {
  if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) {
    return null;
  }
  
  const result = babel.transformSync(code, {
    filename: id,
    presets: [
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
  });
  
  return {
    code: result.code,
    map: result.map,
  };
}
```

**HMR Integration**:
```typescript
// react-refresh.ts
transform(code: string, id: string) {
  if (!isReactComponent(code)) return null;
  
  return {
    code: `
      import RefreshRuntime from 'react-refresh/runtime';
      ${code}
      RefreshRuntime.register(Component, '${id}');
    `,
  };
}
```

---

### Vue Adapter

**Files**:
- `src/plugins/vue-transform.ts` (SFC compiler)

**How it works**:
```typescript
// vue-transform.ts
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

transform(code: string, id: string) {
  if (!id.endsWith('.vue')) return null;
  
  const { descriptor } = parse(code, { filename: id });
  
  // Compile script
  const script = compileScript(descriptor, { id });
  
  // Compile template
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: id,
  });
  
  return {
    code: `
      ${script.content}
      ${template.code}
      export default { ...script.default, render };
    `,
  };
}
```

---

### Svelte Adapter

**Files**:
- `src/plugins/svelte-transform.ts` (Svelte compiler)

**How it works**:
```typescript
// svelte-transform.ts
import { compile } from 'svelte/compiler';

transform(code: string, id: string) {
  if (!id.endsWith('.svelte')) return null;
  
  const result = compile(code, {
    filename: id,
    css: 'injected', // Inject CSS into JS
    hydratable: false,
  });
  
  return {
    code: result.js.code,
    map: result.js.map,
  };
}
```

---

### Angular Adapter (JIT Only)

**Files**:
- `src/plugins/js-transform.ts` (TypeScript compilation)

**How it works**:
```typescript
// Angular uses JIT compilation at runtime
// Nexxo only compiles TypeScript → JavaScript
transform(code: string, id: string) {
  if (!id.endsWith('.ts')) return null;
  
  const result = babel.transformSync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
  });
  
  return {
    code: result.code,
    map: result.map,
  };
}
```

**Why no AOT?**:
- AOT requires deep Angular compiler integration
- No proven demand yet (see `COMPATIBILITY_POLICY.md`)
- JIT works for development

---

### Solid Adapter

**Files**:
- `src/plugins/js-transform.ts` (Babel with Solid preset)

**How it works**:
```typescript
// js-transform.ts
transform(code: string, id: string) {
  if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) {
    return null;
  }
  
  const result = babel.transformSync(code, {
    filename: id,
    presets: ['babel-preset-solid'],
  });
  
  return {
    code: result.code,
    map: result.map,
  };
}
```

---

## 🔥 HMR Integration

### How HMR Works

```
File Change → [Watcher] → [Rebuild Module] → [Send Update] → [Browser]
```

**Framework-Specific HMR**:
- **React**: `react-refresh`
- **Vue**: `@vue/runtime-core` HMR API
- **Svelte**: `svelte-hmr`
- **Solid**: Built-in HMR

**Example: React Refresh**
```typescript
// Injected by react-refresh plugin
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    RefreshRuntime.performReactRefresh();
  });
}
```

---

## 🚫 What Adapters CANNOT Do

### 1. Modify Core Graph Logic
```typescript
// ❌ FORBIDDEN
transform(code: string, id: string) {
  graph.addNode({ id: 'virtual-module' });
}
```

**Why**: Graph integrity is core's responsibility.

---

### 2. Override Bundler Behavior
```typescript
// ❌ FORBIDDEN
transform(code: string, id: string) {
  bundler.setChunkStrategy('aggressive');
}
```

**Why**: Bundler behavior must be deterministic.

---

### 3. Add Framework Heuristics to Core
```typescript
// ❌ FORBIDDEN (in core)
if (isReactComponent(code)) {
  // Special React handling in core
}
```

**Why**: Core must remain framework-agnostic.

---

## 📋 Adding a New Framework Adapter

### Checklist

- [ ] **Demand Verified**: See `COMPATIBILITY_POLICY.md`
- [ ] **Compiler Available**: Framework has a compiler API
- [ ] **Deterministic**: Compiler output is deterministic
- [ ] **Source Maps**: Compiler generates source maps
- [ ] **HMR Support**: Framework has HMR runtime
- [ ] **Snapshot Tests**: Adapter passes snapshot tests
- [ ] **Documentation**: Integration guide written

---

### Implementation Steps

1. **Create Plugin File**
   ```bash
   touch src/plugins/my-framework-transform.ts
   ```

2. **Implement Transform Hook**
   ```typescript
   export function myFrameworkPlugin(): NexxoPlugin {
     return {
       name: 'my-framework',
       transform(code, id) {
         if (!id.endsWith('.myext')) return null;
         
         const result = myFrameworkCompiler.compile(code, { filename: id });
         
         return {
           code: result.code,
           map: result.map,
         };
       },
     };
   }
   ```

3. **Add to Presets**
   ```typescript
   // src/presets/index.ts
   export function myFrameworkPreset(): NexxoPlugin[] {
     return [
       myFrameworkPlugin(),
       jsTransformPlugin(),
     ];
   }
   ```

4. **Add Detection**
   ```typescript
   // src/config/index.ts
   if (pkg.dependencies?.['my-framework']) {
     return 'my-framework';
   }
   ```

5. **Write Snapshot Tests**
   ```typescript
   // tests/framework_verification_test.ts
   test('MyFramework builds correctly', async () => {
     const result = await build({ framework: 'my-framework' });
     expect(result).toMatchSnapshot();
   });
   ```

6. **Update Documentation**
   ```markdown
   # docs/frameworks/my-framework.md
   ```

---

## 🎯 Key Takeaways

1. **Adapters wrap framework compilers**
2. **Each framework has a preset** (plugin array)
3. **HMR is framework-specific**
4. **Core remains framework-agnostic**
5. **Determinism is mandatory**
6. **Demand drives compatibility**

---

**Next Steps**: Read `COMPATIBILITY_POLICY.md` for addition rules.
