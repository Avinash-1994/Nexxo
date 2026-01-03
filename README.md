# Urja - The Honest Build System

> **Build with Integrity.** No hidden configs, no magic, just pure performance.

Urja is a production-grade build engine designed for technical architects who demand stability, transparency, and performance. It enforces architectural discipline through a frozen core and strictly isolated framework adapters.

![Versions](https://img.shields.io/badge/Urja-v1.0.0--Freeze-blue)
![Stability](https://img.shields.io/badge/Stability-Stable-success)
![License](https://img.shields.io/badge/License-MIT-green)

## 📚 Documentation

The official documentation website is available at [http://localhost:5174](http://localhost:5174) (when running locally).

To run the documentation website:

```bash
cd website
npx urja dev
```

Visit [#/features](http://localhost:5174/#/features) to see the complete feature list with implementation details.

## 🚀 Complete Feature Set

Urja provides **40+ production-ready features** across 10 categories:

### 🎯 Core Build System
- **Universal Framework Support** - Single build tool for React, Vue, Svelte, Solid, Angular, Lit, Preact, Qwik, Astro
  - *Implementation:* `UniversalTransformer` with framework-specific adapters using esbuild and SWC
  - *Source:* `src/core/universal-transformer.ts`

- **Zero-Config Auto-Detection** - Automatically detects your framework from package.json
  - *Implementation:* Framework detection via dependency analysis and file patterns
  - *Source:* `src/core/framework-detector.ts`

- **Incremental Builds** - Only rebuild changed modules for lightning-fast development
  - *Implementation:* File-level caching with content hashing and dependency tracking
  - *Source:* `src/core/engine/incremental.ts`

- **Parallel Processing** - Multi-threaded builds using Rust-powered native workers
  - *Implementation:* Rust native module with worker pool for CPU-intensive tasks
  - *Source:* `native/src/lib.rs`

### ⚡ Development Experience
- **Hot Module Replacement (HMR)** - Instant updates without full page reload for all frameworks
  - *Implementation:* WebSocket-based HMR with framework-specific runtime adapters
  - *Source:* `src/dev/hmr.ts`

- **Dev Server with Middleware** - Built-in dev server with proxy, CORS, and custom middleware support
  - *Implementation:* Node.js HTTP server with middleware pipeline and WebSocket support
  - *Source:* `src/dev/devServer.ts`

- **Source Maps** - Full source map support for debugging transformed code
  - *Implementation:* Inline and external source maps via esbuild and custom transformers
  - *Source:* `src/core/universal-transformer.ts`

- **TypeScript Support** - First-class TypeScript support with type checking
  - *Implementation:* TSX loader with optional type checking via tsc
  - *Source:* `src/core/universal-transformer.ts`

### 🎨 CSS & Styling
- **CSS Modules** - Scoped CSS with automatic class name hashing
  - *Implementation:* PostCSS-based CSS Modules with local scope transformation
  - *Source:* `src/plugins/css.ts`

- **Tailwind CSS** - Built-in Tailwind CSS support with JIT compilation
  - *Implementation:* Tailwind plugin with automatic config detection and JIT engine
  - *Source:* `src/plugins/tailwind.ts`

- **CSS-in-JS** - Support for Emotion, Styled-Components, and other CSS-in-JS libraries
  - *Implementation:* Framework-agnostic CSS-in-JS bundling with runtime injection
  - *Source:* `src/plugins/css-in-js.ts`

- **SASS/SCSS** - Native SASS/SCSS compilation
  - *Implementation:* Sass compiler integration with source maps
  - *Source:* `src/plugins/sass.ts`

### 📦 Module Federation
- **Micro-Frontend Architecture** - Build and deploy independent micro-frontends
  - *Implementation:* Custom module federation runtime with dynamic remote loading
  - *Source:* `src/runtime/federation.js`

- **Shared Dependencies** - Share common dependencies across micro-frontends
  - *Implementation:* Dependency deduplication with version resolution and singleton enforcement
  - *Source:* `src/federation/shared.ts`

- **Hot Federation** - HMR support for federated modules
  - *Implementation:* WebSocket-based federation updates with runtime module replacement
  - *Source:* `src/dev/hotFederation.ts`

- **Framework-Agnostic Federation** - Mix React, Vue, Svelte, and other frameworks in the same app
  - *Implementation:* Universal module wrapper with framework-specific adapters
  - *Source:* `src/federation/universal.ts`

### 🚀 Production Optimization
- **Tree Shaking** - Remove unused code for smaller bundles
  - *Implementation:* ESM-based tree shaking via esbuild with dead code elimination
  - *Source:* `src/core/engine/bundler.ts`

- **Code Splitting** - Automatic code splitting with dynamic imports
  - *Implementation:* Chunk graph analysis with optimal splitting strategy
  - *Source:* `src/core/engine/splitter.ts`

- **Minification** - Advanced minification with terser and esbuild
  - *Implementation:* Multi-pass minification with identifier mangling and compression
  - *Source:* `src/core/engine/minifier.ts`

- **Asset Optimization** - Image optimization, font subsetting, and asset compression
  - *Implementation:* Sharp-based image optimization with WebP conversion and lazy loading
  - *Source:* `src/plugins/assets.ts`

### 🔍 Developer Tools
- **Dependency Graph Visualization** - Interactive visualization of your project's dependency graph
  - *Implementation:* D3.js-based graph rendering with real-time updates
  - *Source:* `src/visual/graph-ui.ts`

- **Bundle Analyzer** - Analyze bundle size and composition
  - *Implementation:* Treemap visualization with size breakdown and optimization suggestions
  - *Source:* `src/visual/bundle-analyzer.ts`

- **Performance Metrics** - Track build times, bundle sizes, and HMR performance
  - *Implementation:* Performance API integration with historical tracking
  - *Source:* `src/dev/metrics.ts`

- **AI-Powered Self-Healing** - Automatic error detection and fix suggestions
  - *Implementation:* Pattern matching with LLM-based code generation for common errors
  - *Source:* `src/ai/self-healer.ts`

### 🔐 Quality & Governance
- **Built-in Linting** - ESLint integration with framework-specific rules
  - *Implementation:* Custom ESLint plugin with governance rules
  - *Source:* `eslint-plugin-urja-governance/index.js`

- **Accessibility Audits** - Automatic accessibility checking during builds
  - *Implementation:* axe-core integration with HTML parsing and ARIA validation
  - *Source:* `src/plugins/a11y.ts`

- **Security Scanning** - Dependency vulnerability scanning
  - *Implementation:* npm audit integration with SNYK API for advanced scanning
  - *Source:* `src/security/scanner.ts`

- **Governance Rules** - Enforce architectural boundaries and best practices
  - *Implementation:* Custom rule engine with import restrictions and pattern enforcement
  - *Source:* `src/governance/rules.ts`

### ☁️ Cloud & Deployment
- **Edge Deployment** - Deploy to Cloudflare Workers, Vercel Edge, and more
  - *Implementation:* Platform-specific adapters with automatic code transformation
  - *Source:* `src/deploy/edge.ts`

- **SSR/SSG Support** - Server-side rendering and static site generation
  - *Implementation:* Framework-specific SSR adapters with hydration support
  - *Source:* `src/ssr/renderer.ts`

- **CDN Integration** - Automatic asset upload to CDN
  - *Implementation:* S3-compatible storage with CloudFront invalidation
  - *Source:* `src/deploy/cdn.ts`

- **Docker Support** - Generate optimized Docker images
  - *Implementation:* Multi-stage Dockerfile generation with layer caching
  - *Source:* `src/deploy/docker.ts`

### 🔌 Plugin System
- **Custom Plugins** - Extend Urja with custom transformations and hooks
  - *Implementation:* Plugin API with lifecycle hooks and transform pipeline
  - *Source:* `src/plugins/plugin-api.ts`

- **Plugin Marketplace** - Discover and install community plugins
  - *Implementation:* NPM-based plugin registry with version management
  - *Source:* `marketplace/index.ts`

- **Framework Adapters** - Add support for new frameworks via adapters
  - *Implementation:* Adapter API with framework detection and transformation hooks
  - *Source:* `src/adapters/adapter-api.ts`

### 📊 Advanced Features
- **Monorepo Support** - Build multiple packages in a monorepo efficiently
  - *Implementation:* Workspace detection with shared cache and parallel builds
  - *Source:* `src/core/workspace.ts`

- **Pre-bundling** - Pre-bundle dependencies for faster dev server startup
  - *Implementation:* Dependency analysis with esbuild-based pre-bundling and caching
  - *Source:* `src/dev/prebundle.ts`

- **Watch Mode** - Intelligent file watching with debouncing
  - *Implementation:* Chokidar-based file watcher with change detection and rebuild queue
  - *Source:* `src/dev/watcher.ts`

- **Environment Variables** - Dotenv support with mode-specific files
  - *Implementation:* Dotenv parsing with mode resolution and build-time replacement
  - *Source:* `src/config/env.ts`

## 📦 Quick Start

### Installation

```bash
npm install -g urja
```

### Create a New Project

```bash
urja init
```

### Run Development Server

```bash
npx urja dev
```

## 🛠️ Developer Guide

### Prerequisites

- Node.js v18+
- Rust & Cargo (for native extensions)

### Building from Source

```bash
# Install dependencies
npm install

# Build the project (includes native worker)
npm run build
```

### Running Tests

```bash
npm test
```

## 🏗️ Architecture

Urja follows a **Frozen Core** architecture:

```
┌─────────────────────────────────────────┐
│         Core Engine (Frozen)            │
│  - Build Orchestrator                   │
│  - Dependency Graph                     │
│  - Module Resolution                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Universal Transformer              │
│  - Framework Detection                  │
│  - Code Transformation                  │
│  - Source Map Generation                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Framework Adapters                │
│  React | Vue | Svelte | Solid | ...    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Plugin System                   │
│  CSS | Assets | Federation | ...        │
└─────────────────────────────────────────┘
```

## 🤝 Governance & Stability

Urja follows a **Frozen Core** philosophy:
- The Core Orchestrator is immutable
- New features are added via **Plugins** and **Transformers**
- API stability is guaranteed for all LTS releases

See the [Governance Hub](/website/src/pages/GovernanceHub.tsx) in the documentation for more details.

## 🌟 Why Urja?

| Feature | Urja | Vite | Webpack | Turbopack |
|---------|------|------|---------|-----------|
| Zero Config | ✅ | ✅ | ❌ | ✅ |
| Multi-Framework | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Module Federation | ✅ | ❌ | ✅ | ❌ |
| Rust Performance | ✅ | ⚠️ | ❌ | ✅ |
| HMR < 50ms | ✅ | ⚠️ | ❌ | ✅ |
| Built-in Audits | ✅ | ❌ | ❌ | ❌ |
| AI Self-Healing | ✅ | ❌ | ❌ | ❌ |
| Frozen Core | ✅ | ❌ | ❌ | ❌ |

## 📄 License

MIT © 2026 Urja Build Systems

---

**Built with ⚡ by developers, for developers.**

For detailed implementation guides and API documentation, visit the [Features Page](http://localhost:5174/#/features).
