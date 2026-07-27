# React Guide

> Build React apps (18 & 19) with Lunx — Fast Refresh HMR, JSX, TypeScript, CSS Modules.

---

## Quick Start

```bash
# Scaffold a React + TypeScript project
lunx bootstrap --name my-react-app --template react-ts

cd my-react-app
lunx dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Manual Setup

### 1. Install

```bash
npm install --save-dev lunx
npm install react react-dom
npm install --save-dev @types/react @types/react-dom typescript
```

### 2. Create `lunx.config.js`

**JavaScript:**
```js
// lunx.config.js
module.exports = {
  entry: ['./src/main.jsx'],
  outDir: './dist',

  dev: {
    port: 3000,
    hmr: true,
  },

  build: {
    minify: true,
    sourcemap: 'external',
    target: 'es2020',
  },
};
```

**TypeScript:**
```ts
// lunx.config.ts
import { defineConfig } from 'lunx';

export default defineConfig({
  entry: ['./src/main.tsx'],
  outDir: './dist',

  dev: {
    port: 3000,
    hmr: true,
  },

  build: {
    minify: true,
    sourcemap: 'external',
    target: 'es2020',
  },
});
```

### 3. Create Entry Files

**`index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`src/main.tsx`:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**`src/App.tsx`:**
```tsx
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello from Lunx + React</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
```

---

## Hot Module Replacement (Fast Refresh)

Lunx integrates **React Fast Refresh** automatically for `.jsx`/`.tsx` files.

- Component state is **preserved** across saves
- Only the changed component re-renders — not the whole page
- Error overlay appears on runtime errors

**How it works:**
- Lunx detects React files by extension and framework config
- Injects React Refresh runtime in dev mode
- Communicates via WebSocket to the browser client

**Debugging HMR:**
```bash
# Check HMR WebSocket in browser DevTools → Network → WS
# You should see messages like: {"type":"update","updates":[...]}
```

If HMR stops working, try:
```bash
# Restart dev server
lunx dev --force
```

---

## CSS Modules

```bash
# File: src/Button.module.css
.button {
  background: #646cff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background: #535bf2;
}
```

```tsx
// src/Button.tsx
import styles from './Button.module.css';

function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.button}>{children}</button>;
}
```

Enable in config:
```js
module.exports = {
  css: {
    modules: true,
  },
};
```

---

## Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

```js
// lunx.config.js
module.exports = {
  css: {
    framework: 'tailwind',
  },
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

## Path Aliases

```js
// lunx.config.js
module.exports = {
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@hooks': './src/hooks',
    },
  },
};
```

```tsx
// Usage
import Button from '@components/Button';
import { useAuth } from '@hooks/useAuth';
```

---

## Production Build

```bash
lunx build
```

Output in `./dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      ← Main bundle (minified + tree-shaken)
│   ├── index-[hash].css
│   └── index-[hash].js.map  ← Source map (if sourcemap: 'external')
```

**Serve the production build:**
```bash
lunx preview
# Serves dist/ at http://localhost:4173
```

---

## React 19 Compatibility

Lunx fully supports React 19:

```bash
npm install react@19 react-dom@19
```

Works with:
- React Server Components (RSC) — via SSR preset
- `use()` hook
- Actions API
- New JSX transform (no `import React` needed)

---

## Framework Support Table

| Feature | Status | Notes |
|---------|--------|-------|
| JSX Transform | ✅ Built-in | No Babel config needed |
| Fast Refresh (HMR) | ✅ Active | State-preserving |
| React 18 | ✅ Stable | Full support |
| React 19 | ✅ Stable | Full support |
| TypeScript | ✅ Built-in | No ts-loader needed |
| CSS Modules | ✅ Built-in | `.module.css` |
| Tailwind CSS | ✅ Built-in | `css.framework: 'tailwind'` |
| Code Splitting | ✅ Auto | Dynamic imports |
| Tree Shaking | ✅ Auto | Production build |
| Source Maps | ✅ 3 modes | inline/external/hidden |

---

## Troubleshooting

**"React must be in scope" error:**
Add to `tsconfig.json`:
```json
{ "compilerOptions": { "jsx": "react-jsx" } }
```

**Fast Refresh not preserving state:**
Ensure your component is the **default export** of its file, and the file only exports React components.

**Import order issues:**
Put side-effect-only imports (like `import './styles.css'`) at the top of `main.tsx`.

---

## Next Steps

- [Module Federation with React](./federation.md) — share components across micro-frontends
- [Plugin Guide](../plugins.md) — extend Lunx
- [Migration from Vite](../migration.md) — step-by-step migration
