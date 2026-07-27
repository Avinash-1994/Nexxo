# SolidJS Guide

> Build SolidJS apps with Lunx — fine-grained reactivity, signal-aware HMR, TypeScript.

---

## Quick Start

```bash
lunx bootstrap --name my-solid-app --template solid-ts
cd my-solid-app
lunx dev
```

---

## Manual Setup

### 1. Install

```bash
npm install --save-dev lunx typescript
npm install solid-js
```

### 2. Create `lunx.config.js`

**JavaScript:**
```js
module.exports = {
  entry: ['./src/index.jsx'],
  outDir: './dist',
  dev: { port: 3000, hmr: true },
  build: { minify: true, sourcemap: 'external' },
};
```

**TypeScript:**
```ts
import { defineConfig } from 'lunx';

export default defineConfig({
  entry: ['./src/index.tsx'],
  outDir: './dist',
  dev: { port: 3000, hmr: true },
  build: { minify: true, sourcemap: 'external' },
});
```

### 3. Entry Files

**`src/index.tsx`:**
```tsx
import { render } from 'solid-js/web';
import App from './App';
import './index.css';

render(() => <App />, document.getElementById('root')!);
```

**`src/App.tsx`:**
```tsx
import { createSignal } from 'solid-js';

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>Hello from Lunx + SolidJS</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count()}
      </button>
    </div>
  );
}

export default App;
```

---

## Signals & Fine-Grained Reactivity

SolidJS uses **signals** for reactivity. Unlike React, only the parts of the DOM that use a signal re-render:

```tsx
import { createSignal, createEffect, createMemo } from 'solid-js';

function Counter() {
  // Signal: reactive value
  const [count, setCount] = createSignal(0);

  // Memo: derived computation (cached)
  const doubled = createMemo(() => count() * 2);

  // Effect: side effects
  createEffect(() => {
    console.log('Count is:', count());
  });

  return (
    <div>
      <p>{count()} × 2 = {doubled()}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

> **Note:** In SolidJS, signals are functions — always call them as `count()` not `count`.

---

## HMR — Signal-Aware Hot Reload

Lunx provides signal-aware HMR for SolidJS:

- Signal values are **preserved** across saves when possible
- Component re-renders when code structure changes
- Solid DevTools works in dev mode

---

## Stores

```tsx
import { createStore } from 'solid-js/store';

function App() {
  const [state, setState] = createStore({
    user: { name: 'Alice', age: 30 },
    todos: [] as string[],
  });

  return (
    <div>
      <p>Name: {state.user.name}</p>
      <button onClick={() => setState('user', 'age', a => a + 1)}>
        Age: {state.user.age}
      </button>
    </div>
  );
}
```

---

## Control Flow

SolidJS uses components for control flow (not JS conditionals):

```tsx
import { Show, For, Switch, Match } from 'solid-js';

function App() {
  const [items] = createSignal(['Apple', 'Banana', 'Cherry']);
  const [isLoggedIn] = createSignal(true);

  return (
    <div>
      {/* Conditional rendering */}
      <Show when={isLoggedIn()} fallback={<p>Please log in</p>}>
        <p>Welcome!</p>
      </Show>

      {/* List rendering */}
      <For each={items()}>
        {(item) => <li>{item}</li>}
      </For>

      {/* Switch */}
      <Switch>
        <Match when={count() === 0}>Zero</Match>
        <Match when={count() > 0}>Positive</Match>
      </Switch>
    </div>
  );
}
```

---

## TypeScript

```tsx
import { Component, JSX } from 'solid-js';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      class={`btn btn-${props.variant ?? 'primary'}`}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
};
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true
  }
}
```

---

## CSS Modules

```tsx
import styles from './App.module.css';

function App() {
  return <div class={styles.container}>Hello</div>;
}
```

> **Note:** In SolidJS, use `class` (not `className`) for CSS class attributes.

---

## Solid Router

```bash
npm install @solidjs/router
```

```tsx
import { Router, Route } from '@solidjs/router';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}
```

---

## Production Build

```bash
lunx build
```

SolidJS compiles to **vanilla DOM operations** with no virtual DOM overhead. Bundles are typically 5–15KB gzipped for typical apps.

---

## Framework Support Table

| Feature | Status | Notes |
|---------|--------|-------|
| JSX (SolidJS) | ✅ Built-in | `jsxImportSource: 'solid-js'` |
| Signals HMR | ✅ Active | Signal values preserved |
| TypeScript | ✅ Built-in | |
| CSS Modules | ✅ Built-in | Use `class` not `className` |
| Solid Router | ✅ Compatible | `@solidjs/router` |
| Fine-grained reactivity | ✅ Native | No VDOM |
| Tree Shaking | ✅ Excellent | Minimal runtime |

---

## Next Steps

- [Plugin Guide](../plugins.md)
- [Migration Guide](../migration.md)
- [Module Federation Guide](./federation.md)
