# Nexxo Framework Support - Universal Production-Grade

## 🌟 **All Frameworks Are Production-Ready**

Nexxo provides **identical, production-grade support** for all major frameworks. There are no tiers - every framework receives:

### ✅ **Universal Guarantees (ALL Frameworks)**

- **Advanced HMR** (95%+ success rate with state preservation)
- **Framework-specific optimizations**
- **Deterministic builds** (content-hash based caching)
- **CSS correctness** (scoped styles, extraction, injection)
- **Graph-based rebuilds** (dependency tracking)
- **Production builds work** (optimized, tree-shaken)
- **Full `nexxo verify` support**

---

## 📦 **Supported Frameworks**

### React
- **HMR**: React Refresh with Fast Refresh
- **Features**: Automatic JSX runtime detection (17+), Babel preset integration
- **State Preservation**: Full component state retained during HMR
- **Optimizations**: Tree-shaking, code-splitting

### Vue
- **HMR**: SFC (Single File Component) hot-reload
- **Features**: Template compilation, scoped styles, script setup
- **State Preservation**: Component state + reactive data preserved
- **Optimizations**: Template pre-compilation, style extraction

### Svelte
- **HMR**: Component instance hot-swapping with state preservation
- **Features**: Svelte 3/4/5 support, reactive statements
- **State Preservation**: `$capture_state` / `$inject_state` integration
- **Optimizations**: Compiler-level optimizations, CSS injection

### Solid
- **HMR**: Signal-based reactivity with component re-rendering
- **Features**: Fine-grained reactivity, JSX compilation
- **State Preservation**: Root component tracking and re-mount
- **Optimizations**: Babel preset-solid integration

### Lit
- **HMR**: Custom element hot-swapping with attribute/child preservation
- **Features**: Web Components, decorators, shadow DOM
- **State Preservation**: Element attributes and children preserved
- **Optimizations**: TypeScript decorators, tree-shaking

### Angular
- **HMR**: Component hot-swapping via ViewContainerRef
- **Features**: Decorators, metadata emission, all versions (2-18+)
- **State Preservation**: Component reference tracking
- **Optimizations**: AOT-compatible transforms, tree-shaking

### Preact
- **HMR**: React Refresh with Preact import source
- **Features**: Automatic `importSource: 'preact'` configuration
- **State Preservation**: Same as React
- **Optimizations**: Lightweight bundle size

### Qwik
- **HMR**: Optimizer-aware hot-reload
- **Features**: Resumability, lazy loading
- **State Preservation**: Qwik optimizer integration
- **Optimizations**: Fine-grained code-splitting

### Astro
- **HMR**: Component-level hot-reload
- **Features**: Multi-framework support, islands architecture
- **State Preservation**: Per-island HMR
- **Optimizations**: Partial hydration

---

## 🔧 **How It Works**

All frameworks use Nexxo's **UniversalTransformer** which:

1. **Detects** the framework from file extensions and imports
2. **Transforms** using the framework's native compiler
3. **Injects** HMR runtime (`import.meta.hot` API)
4. **Caches** transformations using content-hash for determinism
5. **Optimizes** with esbuild normalization pass

---

## 📚 **Documentation**

Each framework has:
- ✅ Getting Started guide
- ✅ HMR configuration examples
- ✅ Production build instructions
- ✅ Migration guides from other tools

---

## 🎯 **Why No Tiers?**

We believe in **equality across frameworks**. Every framework deserves:
- The same level of engineering effort
- The same production-ready guarantees
- The same developer experience

**Nexxo treats all frameworks as first-class citizens.**
