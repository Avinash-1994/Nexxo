# Svelte 5 Guide

> Build Svelte 5 apps with Lunx — component HMR, Runes, TypeScript, scoped styles.

---

## Quick Start

```bash
lunx bootstrap --name my-svelte-app --template svelte-ts
cd my-svelte-app
lunx dev
```

---

## Manual Setup

### 1. Install

```bash
npm install --save-dev lunx svelte typescript
```

### 2. Create `lunx.config.js`

**JavaScript:**
```js
module.exports = {
  entry: ['./src/main.js'],
  outDir: './dist',
  dev: { port: 5173, hmr: true },
  build: { minify: true, sourcemap: 'external' },
  css: { modules: false }, // Svelte scopes styles natively
};
```

**TypeScript:**
```ts
import { defineConfig } from 'lunx';

export default defineConfig({
  entry: ['./src/main.ts'],
  outDir: './dist',
  dev: { port: 5173, hmr: true },
  build: { minify: true, sourcemap: 'external' },
  css: { modules: false },
});
```

### 3. Entry Files

**`src/main.ts`:**
```ts
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app')! });
export default app;
```

**`src/App.svelte`:**
```svelte
<script lang="ts">
  let count = $state(0);
</script>

<main>
  <h1>Hello from Lunx + Svelte 5</h1>
  <button onclick={() => count++}>Count: {count}</button>
</main>

<style>
  main { padding: 2rem; }
  button {
    background: #ff3e00;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

---

## Svelte 5 Runes

Svelte 5 introduces **Runes** — a new reactivity primitive:

```svelte
<script lang="ts">
  // $state — reactive state
  let count = $state(0);
  let name = $state('World');

  // $derived — computed value
  let doubled = $derived(count * 2);

  // $effect — side effect
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<p>{count} × 2 = {doubled}</p>
<button onclick={() => count++}>Increment</button>
```

---

## HMR — Component Hot-Reload

Lunx integrates **svelte-hmr** for `.svelte` files:

- Component state is **reset** on save (Svelte's HMR model)
- Styles hot-injected without reload
- Template changes apply immediately

For state persistence across saves, use stores:
```ts
import { writable } from 'svelte/store';
export const count = writable(0); // persists across HMR
```

---

## Scoped Styles

Svelte scopes `<style>` blocks to the component automatically:

```svelte
<style>
  /* Only applies to elements in THIS component */
  h1 { color: #ff3e00; }
  
  /* Use :global() for global styles */
  :global(body) { margin: 0; }
</style>
```

---

## TypeScript

```svelte
<script lang="ts">
  interface Props {
    name: string;
    count?: number;
  }

  let { name, count = 0 }: Props = $props();
</script>

<p>Hello, {name}! Count: {count}</p>
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "verbatimModuleSyntax": true
  },
  "include": ["./src/**/*", ".svelte-kit/types"]
}
```

---

## Svelte Stores

```ts
// src/stores/counter.ts
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, $count => $count * 2);
```

```svelte
<script lang="ts">
  import { count, doubled } from './stores/counter';
</script>

<p>Count: {$count}, Doubled: {$doubled}</p>
<button onclick={() => $count++}>Increment</button>
```

---

## CSS Preprocessors

### Sass/SCSS

```bash
npm install -D sass
```

```svelte
<style lang="scss">
  $color: #ff3e00;
  button { background: $color; }
</style>
```

### Less

```bash
npm install -D less
```

```svelte
<style lang="less">
  @color: #ff3e00;
  button { background: @color; }
</style>
```

---

## Production Build

```bash
lunx build
```

Output:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    ← Svelte runtime + compiled components
│   └── index-[hash].css   ← Extracted + scoped styles
```

Svelte's compiler eliminates unused framework code — bundles are typically **very small**.

---

## Framework Support Table

| Feature | Status | Notes |
|---------|--------|-------|
| `.svelte` SFC files | ✅ Built-in | Full compiler integration |
| Svelte 5 Runes | ✅ Stable | `$state`, `$derived`, `$effect` |
| Svelte 4 (legacy) | ✅ Stable | `$: reactive`, stores |
| HMR | ✅ Active | State resets on save |
| TypeScript (`lang="ts"`) | ✅ Built-in | |
| Scoped Styles | ✅ Auto | Svelte compiler handles this |
| Sass/SCSS | ✅ Plugin | `npm install -D sass` |
| Tree Shaking | ✅ Excellent | Svelte compiler eliminates dead code |

---

## Next Steps

- [Module Federation Guide](./federation.md)
- [Migration Guide](../migration.md)
- [Plugin Guide](../plugins.md)
