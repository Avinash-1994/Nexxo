# Vue 3 Guide

> Build Vue 3 apps with Lunx — SFC hot-reload, Composition API, TypeScript, CSS Modules.

---

## Quick Start

```bash
lunx bootstrap --name my-vue-app --template vue-ts
cd my-vue-app
lunx dev
```

---

## Manual Setup

### 1. Install

```bash
npm install --save-dev lunx
npm install vue
npm install --save-dev typescript @vue/tsconfig
```

### 2. Create `lunx.config.js`

**JavaScript:**
```js
module.exports = {
  entry: ['./src/main.js'],
  outDir: './dist',
  dev: { port: 5173, hmr: true },
  build: { minify: true, sourcemap: 'external' },
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
});
```

### 3. Entry Files

**`src/main.ts`:**
```ts
import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#app');
```

**`src/App.vue`:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div>
    <h1>Hello from Lunx + Vue 3</h1>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>

<style scoped>
button {
  background: #42b883;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

---

## HMR — SFC Hot-Reload

Lunx integrates **Vue SFC hot-reload** automatically for `.vue` files.

- `<script setup>` changes: component re-mounts
- `<template>` changes: hot-patched (state preserved)
- `<style scoped>` changes: CSS injected without reload

**Composition API + `ref` state is preserved** across template-only saves.

---

## Single File Components (SFC)

Full `.vue` SFC support:

```vue
<script setup lang="ts">
// Composition API (recommended)
import { ref, computed, onMounted } from 'vue';

const name = ref('World');
const greeting = computed(() => `Hello, ${name.value}!`);

onMounted(() => console.log('Component mounted'));
</script>

<template>
  <div>
    <p>{{ greeting }}</p>
    <input v-model="name" placeholder="Enter name" />
  </div>
</template>

<style scoped>
div { padding: 1rem; }
input { margin-top: 0.5rem; }
</style>
```

---

## CSS Modules in Vue

```vue
<template>
  <button :class="$style.button">Click me</button>
</template>

<style module>
.button {
  background: #42b883;
  color: white;
  padding: 8px 16px;
}
</style>
```

Or use the `useCssModule` composable:
```ts
import { useCssModule } from 'vue';
const style = useCssModule();
```

---

## TypeScript in Vue SFCs

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

const emit = defineEmits<{
  update: [value: number];
}>();
</script>
```

**`tsconfig.json`:**
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## Vue Router

```bash
npm install vue-router
```

```ts
// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
});
```

```ts
// src/main.ts
import { createApp } from 'vue';
import { router } from './router';
import App from './App.vue';

createApp(App).use(router).mount('#app');
```

---

## Pinia (State Management)

```bash
npm install pinia
```

```ts
// src/stores/counter.ts
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++; },
  },
});
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
│   ├── index-[hash].js    ← Vue runtime + app (minified)
│   └── index-[hash].css
```

---

## Framework Support Table

| Feature | Status | Notes |
|---------|--------|-------|
| Vue SFC (`.vue`) | ✅ Built-in | Full parser support |
| Composition API | ✅ Full | `<script setup>` supported |
| Template HMR | ✅ State-preserving | Hot-patches template |
| TypeScript | ✅ Built-in | `lang="ts"` in SFC |
| `<style scoped>` | ✅ Built-in | Auto-scoped CSS |
| CSS Modules | ✅ `<style module>` | `useCssModule` composable |
| Vue 3.4+ | ✅ Stable | Runes / Composition v2 |
| Tree Shaking | ✅ Auto | Removes unused Vue APIs |

---

## Next Steps

- [Module Federation Guide](./federation.md)
- [Migration from Vite](../migration.md)
- [Plugin Guide](../plugins.md)
