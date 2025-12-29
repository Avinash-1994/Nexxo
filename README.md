# Urja ⚡

> **Urja** (Sanskrit: ऊर्जा - Energy/Power) - The Zero-Config Build Tool for the Modern Stack.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/urja.svg)](https://www.npmjs.com/package/urja)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()

[Quick Start](#quick-start) • [Features](#features) • [Frameworks](#-supported-frameworks) • [Configuration](#-configuration) 

</div>

---

## 🚀 Quick Start

### Installation

```bash
# Install globally (once published)
npm install -g urja

# Or use with npx (recommended for new projects)
npx urja bootstrap --name my-app --template react
```

### Your First Project (30 seconds)

```bash
# 1. Bootstrap a new project
npx urja bootstrap --name my-app

# 2. Enter project and install
cd my-app && npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173
```

### Initializing in an Existing Project

```bash
cd existing-project
npx urja init
```

---

## ✨ Why Urja?

Urja is designed to be a simpler, faster alternative to complex build setups. It works out-of-the-box for the most popular frameworks.

### Core Features
- ⚡ **Lightning-fast Dev Server**: Starts in <500ms using native ESM.
- 🔄 **Reliable HMR**: Instant updates for React, Vue, Solid, and CSS.
- 📦 **Smart Bundling**: Handles dependency pre-bundling automatically (CJS $\to$ ESM).
- 🎨 **Universal Transformer**: One pipeline for JSX, TSX, Vue SFC, and Svelte.
- 🛠️ **Production Optimized**: Minification, Tree-shaking, and Code Splitting built-in.
- 📝 **TypeScript First**: Full type support without extra config.

---

## 📚 Supported Frameworks

Urja v0.1.5 is **Production Ready** for **ALL 12 Major Frameworks**:

### Core Frameworks
| Framework | Status | Features |
|-----------|--------|----------|
| **React 18** | 🟢 Production | Fast Refresh, JSX, Hooks, Suspense |
| **Vue 3** | 🟢 Production | SFC (.vue), Composition API, Reactivity |
| **Solid.js** | 🟢 Production | Signals, Stores, JSX, Fine-grained Reactivity |
| **Preact** | 🟢 Production | Compat, Signals, Lightweight |

### Advanced Frameworks
| Framework | Status | Features |
|-----------|--------|----------|
| **Svelte 5** | 🟢 Production | Runes, Reactive Statements, New Compiler |
| **Angular 17+** | 🟢 Production | AOT-like Transformation, Decorators, Templates |
| **Qwik 1.5** | 🟢 Production | Resumability, Optimizer, Lazy Loading |
| **Lit 3.0** | 🟢 Production | Web Components, Decorators, Reactive Properties |
| **Astro 4.0** | 🟢 Production | Island Architecture, Component Integration |

### Meta-Frameworks
| Framework | Status | Features |
|-----------|--------|----------|
| **Next.js 14** | 🟢 Production | Pages Router, App Router, File-based Routing |
| **Nuxt 3** | 🟢 Production | Auto-routing, Layouts, Server Components |
| **Remix** | 🟢 Production | Nested Routes, Loaders, Actions |

---

Urja is **Zero-Config** by default. However, you can customize it with `urja.config.json` or `urja.config.ts`:

```typescript
// urja.config.ts
import { defineConfig } from 'urja';

export default defineConfig({
  entry: ['src/main.tsx'],
  outDir: 'dist',
  mode: 'production',
  port: 5173
});
```

---

## 🖥️ CLI Commands

### `urja dev`
Start the high-performance development server.
- **Port**: Default 3000 (auto-increments if busy).
- **HMR**: Enabled by default.

### `urja build`
Build your application for production.
- **Output**: Optimized static files in `dist/`.
- **Features**: Minification, Source Maps, Asset Hashing.

### `urja init`
Interactively create a new project.
- Supports: React, Vue, Svelte, Vanilla etc.

---

## 📊 Performance Benchmarks

| Feature | Urja | Webpack |
|---------|------|---------|
| Dev Start | **<500ms** | ~5000ms |
| HMR | **<50ms** | ~500ms |
| Config Lines | **0** | ~50+ |

---

## 🤝 Contributing to Urja ⚡

We welcome contributions! Please check `CONTRIBUTING.md` for details on how to set up the development environment and run the stability audits.

### Development Commands
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/urja.git
cd urja

# Add upstream remote
git remote add upstream https://github.com/Avinash-1994/urja.git
```

---

## 📄 License

MIT © [Avinash-1994](https://github.com/Avinash-1994)

---

<div align="center">
Made with ⚡ for the Modern Web.
</div>
