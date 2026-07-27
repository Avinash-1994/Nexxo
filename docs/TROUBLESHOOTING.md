# Troubleshooting Guide

> Top 10 common errors and how to fix them.

---

## Error 1 — `Cannot find module 'lunx'`

**Symptom:**
```
Error: Cannot find module 'lunx'
```

**Cause:** Lunx is not installed in the current project.

**Fix:**
```bash
# Install locally
npm install --save-dev lunx

# Or install globally
npm install -g lunx
```

If using a monorepo, ensure lunx is in the root `package.json` or the specific workspace's `package.json`.

---

## Error 2 — `Port 3000 is already in use`

**Symptom:**
```
⚠ Port 3000 is already in use. Trying port 3001...
```

**Fix — Option A:** Kill the existing process:
```bash
# Find what's using port 3000
lsof -i :3000
kill -9 <PID>
```

**Fix — Option B:** Change the port in config:
```js
// lunx.config.js
module.exports = {
  dev: {
    port: 4000, // Use a different port
  },
};
```

---

## Error 3 — HMR Not Updating (Hot Reload Not Working)

**Symptom:** You save a file but the browser doesn't update.

**Cause:** WebSocket connection dropped, or HMR is disabled.

**Fix:**
```js
// lunx.config.js
module.exports = {
  dev: {
    hmr: true,  // Ensure HMR is enabled
    port: 3000,
  },
};
```

Check the browser console for WebSocket errors. If you see `WebSocket connection failed`, it means the dev server is not reachable. Ensure the server is running and no firewall is blocking WebSocket connections.

**Debug:** Open DevTools → Network → WS tab to see the WebSocket connection.

---

## Error 4 — `SyntaxError: Unexpected token` in JSX

**Symptom:**
```
SyntaxError: Unexpected token '<'
```

**Cause:** The file extension is `.js` but contains JSX syntax.

**Fix:** Rename the file to `.jsx` (or `.tsx` for TypeScript):
```bash
mv src/App.js src/App.jsx
```

Or update your entry to use `.tsx`:
```js
module.exports = {
  entry: ['./src/main.tsx'],
};
```

---

## Error 5 — CSS Modules Not Working

**Symptom:** CSS class names are not scoped (global styles leaking).

**Cause:** CSS Modules not enabled in config.

**Fix:**
```js
// lunx.config.js
module.exports = {
  css: {
    modules: true, // Enable CSS Modules
  },
};
```

Then rename your CSS files to `*.module.css`:
```
src/Button.module.css   ← CSS Modules file
```

Import in your component:
```tsx
import styles from './Button.module.css';
// styles.button is now a unique scoped class name
```

---

## Error 6 — Module Federation Remote Not Loading

**Symptom:**
```
TypeError: Failed to fetch dynamically imported module: http://localhost:3001/remoteEntry.js
```

**Cause:** The remote app is not running, or the URL is wrong.

**Fix:**
1. Start the remote app first: `cd remote-app && lunx dev`
2. Check the URL matches the remote's dev port:
```js
// host lunx.config.js
module.exports = {
  federation: {
    name: 'host',
    remotes: {
      cart: 'http://localhost:3001/remoteEntry.js', // ← Must match remote port
    },
  },
};
```

3. Verify the remote exposes the correct module:
```js
// remote lunx.config.js
module.exports = {
  federation: {
    name: 'cart',
    exposes: {
      './CartWidget': './src/CartWidget.tsx', // ← Must match import path
    },
  },
};
```

---

## Error 7 — `TypeScript: Cannot find type declarations`

**Symptom:**
```
TS2307: Cannot find module '*.svg' or its corresponding type declarations.
```

**Fix:** Add type declarations to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["lunx/client"]
  }
}
```

Or create a `src/vite-env.d.ts` (compatible):
```ts
/// <reference types="lunx/client" />
```

---

## Error 8 — Build Fails with `Out of Memory`

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Very large bundle with too many modules.

**Fix — Option A:** Increase Node.js heap:
```bash
NODE_OPTIONS=--max-old-space-size=4096 lunx build
```

**Fix — Option B:** Enable code splitting:
```js
// lunx.config.js
module.exports = {
  build: {
    splitting: true,     // Enable chunk splitting
    chunkSizeLimit: 500, // Max chunk size in KiB
  },
};
```

---

## Error 9 — Tailwind CSS Not Applied

**Symptom:** Tailwind classes are in the HTML but have no effect.

**Cause:** Tailwind CSS framework not configured.

**Fix:**
```js
// lunx.config.js
module.exports = {
  css: {
    framework: 'tailwind',
  },
};
```

Ensure you have a `tailwind.config.js` at the project root and `@tailwind` directives in your CSS:
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Install Tailwind if not present:
```bash
npm install -D tailwindcss
npx tailwindcss init
```

---

## Error 10 — `lunx: command not found`

**Symptom:**
```
bash: lunx: command not found
```

**Cause:** Lunx is not globally installed, or the global npm bin directory is not in your PATH.

**Fix — Option A:** Use `npx` instead:
```bash
npx lunx dev
```

**Fix — Option B:** Fix global PATH:
```bash
# Check where npm installs global packages
npm config get prefix

# Add to your ~/.bashrc or ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload profile
source ~/.bashrc
```

**Fix — Option C:** Reinstall globally:
```bash
npm install -g lunx
```

---

## General Diagnostic Tool

Run `lunx doctor` to automatically detect common issues:

```bash
lunx doctor

# Example output:
✅ Node.js version: v20.11.0 (OK)
✅ lunx version: 1.0.9 (latest)
✅ lunx.config.js found
✅ Entry file exists: ./src/main.tsx
⚠️  No .env file found (optional)
✅ TypeScript config valid
✅ No conflicting devDependencies

All checks passed! 🎉
```

---

## Still Stuck?

- 💬 [GitHub Discussions](https://github.com/Avinash-1994/Lunx/discussions)
- 🐛 [File a Bug Report](https://github.com/Avinash-1994/Lunx/issues/new)
- 📖 [Full Documentation](https://avinash-1994.github.io/Lunx/)
