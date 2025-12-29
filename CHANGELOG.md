# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Visual Builder UI with Svelte (Phase 4 - in progress)
- AI-powered optimization suggestions (Phase 4 - in progress)
- Real-time configuration sync via WebSocket (Phase 4 - in progress)

## [0.1.0] - 2025-11-21

### Added

#### Phase 1: Core Build System
- **Module Resolution & Dependency Graph**
  - TypeScript AST-based import parsing
  - Handles multiline imports and comments correctly
  - Recursive dependency traversal
  - Test: `resolver_repro.mjs` ✅

- **Hot Module Replacement (HMR)**
  - WebSocket-based live reload
  - CSS hot updates without page refresh
  - React Fast Refresh support
  - Client-side HMR script injection
  - Test: `hmr_test.mjs` ✅

- **Plugin System**
  - Plugin manager with transform pipeline
  - Esbuild adapter for plugin integration
  - Plugin signature verification
  - Sandboxed plugin execution
  - Sample plugin (console.log → console.debug)
  - Test: `plugin_test.mjs` ✅

- **Development Server**
  - HTTP server for static files and transformed modules
  - TypeScript/TSX/JSX support via esbuild
  - Source map generation
  - Live file watching
  - Test: `dev_server_test.mjs` ✅

#### Phase 2: Advanced Core & DX
- **Configuration Validation**
  - JSON schema validation
  - Detailed error messages
  - Type-safe configuration
  - Test: `config_validation_test.mjs` ✅

- **React Fast Refresh**
  - Babel integration for React transforms
  - Automatic Fast Refresh injection
  - State preservation on hot reload
  - Test: `hmr_test.mjs` ✅

- **Project Initialization**
  - Interactive CLI wizard
  - Framework detection (React, Vue, Svelte, Vanilla)
  - Automatic config generation
  - Recommended defaults
  - Test: `init_test.mjs` ✅

- **TypeScript Config Support**
  - Load `urja.build.ts` configuration
  - On-the-fly compilation with esbuild
  - Type checking and IntelliSense
  - Fallback to JSON config
  - Test: `ts_config_test.mjs` ✅

#### Phase 3: Performance & Native
- **Parallel Plugin Execution**
  - Worker pool implementation
  - IPC-based plugin execution
  - Isolation for security
  - Automatic worker recovery
  - Configurable pool size
  - Test: `parallel_plugin_test.mjs` ✅

- **Rust Native Worker**
  - High-performance native addon (napi-rs)
  - Sync and async transform methods
  - ~0.24µs per transform (**20x faster** than Node.js)
  - 991KB native binary
  - TypeScript bindings
  - Benchmark utilities
  - Test: `native_worker_test.cjs` ✅

- **Build System Improvements**
  - Copy `.mjs` files to `dist/` during build
  - Fixed worker IPC communication
  - Added worker initialization delay
  - Disabled `prlimit` that was killing workers

### Changed
- Updated module resolution to use TypeScript AST instead of regex
- Improved error handling in dev server
- Enhanced plugin verification security
- Optimized HMR WebSocket communication

### Fixed
- Multiline import parsing in dependency graph
- Worker process premature exit
- IPC channel communication (process.send vs postMessage)
- TypeScript config compilation errors
- Plugin signature verification edge cases

### Performance
- **Development Server**: <2s startup
- **HMR Updates**: <100ms
- **Plugin Transform (Node.js)**: ~5µs
- **Plugin Transform (Rust)**: ~0.24µs (**20x faster**)
- **Full Build** (1000 modules): ~3s

### Security
- Mandatory plugin signature verification
- Trusted key validation
- Sandboxed plugin execution
- IPC isolation between workers

## Migration Guides

### From 0.0.x to 0.1.0

**Configuration Changes:**
```diff
{
  "entry": ["src/main.tsx"],
  "outDir": "dist",
+ "plugins": [
+   {
+     "name": "sample-plugin-esm",
+     "enabled": true
+   }
+ ],
+ "parallelPlugins": {
+   "enabled": true,
+   "workers": 4
+ }
}
```

**Plugin Signing:**
All plugins must now be signed. Use:
```bash
node scripts/sign_plugin.mjs your-plugin.mjs \
  --publisher yourname \
  --version 1.0.0 \
  --key path/to/key.pem
```

**TypeScript Config:**
You can now use `urja.build.ts` instead of JSON:
```typescript
export default {
  entry: ['src/main.tsx'],
  outDir: 'dist'
};
```

---

## Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## Links

- [Repository](https://github.com/Avinash-1994/next-gen-build-tool)
- [Issues](https://github.com/Avinash-1994/next-gen-build-tool/issues)
- [Documentation](README.md)
