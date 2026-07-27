# Getting Started with Lunx

> Get from zero to a running app in **under 5 minutes**.

---

## Prerequisites

- **Node.js** ≥ 20 ([download](https://nodejs.org))
- **npm** ≥ 8 (bundled with Node.js)

---

## Step 1 — Install Lunx

```bash
npm install -g lunx
```

Verify the installation:

```bash
lunx --version
# ⚡ lunx v1.0.9
```

---

## Step 2 — Scaffold a New Project

Pick your framework:

```bash
# React + TypeScript (recommended)
lunx bootstrap --name my-app --template react-ts

# Vue 3 + TypeScript
lunx bootstrap --name my-app --template vue-ts

# Svelte + TypeScript
lunx bootstrap --name my-app --template svelte-ts

# Vanilla TypeScript
lunx bootstrap --name my-app --template vanilla-ts
```

This creates a `my-app/` directory with a working starter project.

---

## Step 3 — Start the Dev Server

```bash
cd my-app
lunx dev
```

You should see:

```
⚡ Lunx v1.0.9
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/

  ✔ Ready in 312ms
```

Open [http://localhost:3000](http://localhost:3000) in your browser. **HMR is active** — edit any file and changes appear instantly without a full reload.

---

## Step 4 — Production Build

```bash
lunx build
```

Output goes to `./dist/`. The build is minified, tree-shaken, and ready to deploy.

---

## Step 5 — Preview the Production Build

```bash
lunx preview
```

Serves the `dist/` folder locally so you can verify before deploying.

---

## Project Structure

After scaffolding, your project looks like this:

```
my-app/
├── src/
│   ├── main.tsx        ← Entry point
│   ├── App.tsx         ← Root component
│   └── index.css
├── index.html
├── lunx.config.js    ← Lunx configuration
└── package.json
```

---

## Minimal Configuration

The scaffolded `lunx.config.js` works out of the box:

```js
// lunx.config.js
module.exports = {
  entry: ['./src/main.tsx'],
  outDir: './dist',

  dev: {
    port: 3000,
    hmr: true,
  },

  build: {
    minify: true,
    sourcemap: 'external',
  },
};
```

> See the full [Configuration Reference](./guides/configuration.md) for all options.

---

## Adding to an Existing Project

If you already have a project, you can add Lunx without scaffolding:

```bash
# Install locally
npm install --save-dev lunx

# Generate a config file
npx lunx init
```

Then update your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "lunx dev",
    "build": "lunx build",
    "preview": "lunx preview"
  }
}
```

---

## CLI Reference

```bash
lunx dev                            # Start dev server with HMR
lunx build                          # Production build
lunx preview                        # Preview production build
lunx bootstrap --name n --template t  # Scaffold new project
lunx init                           # Generate lunx.config.js
lunx inspect                        # Inspect module graph
lunx analyze                        # Analyze bundle size
lunx doctor                         # Diagnose common issues
```

---

## Next Steps

- 📖 [Configuration Reference](./guides/configuration.md) — all config options with types and defaults
- 🔌 [Plugin Guide](./plugins.md) — extend Lunx with plugins
- 📦 [Module Federation](./guides/federation.md) — micro-frontend architecture
- 🔥 [HMR Guide](./HMR_IMPLEMENTATION_STATUS.md) — how HMR works and how to debug it
- 🚚 [Migration Guide](./migration.md) — moving from Vite or Webpack
- ❓ [Troubleshooting](./TROUBLESHOOTING.md) — common errors and fixes
