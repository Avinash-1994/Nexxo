# Urja Build Tool - Architecture

## Goals
- Lightweight, modular, extremely fast build tool for React, Vue, TypeScript
- Zero-config defaults, visual pipeline, CLI/config file parity
- Hybrid stack: TypeScript core + Rust for heavy lifting

## High-level modules

- CLI (TypeScript)
  - Parses CLI args, loads config, orchestrates build or dev server

- Config
  - JSON/YAML/TS config file support
  - Sync adapter for visual UI

- Resolver & Graph Builder
  - Module resolution, dependency graph, framework detection

- Bundler
  - Uses esbuild for prototype transforms
  - Handles code splitting, dynamic imports, asset loading

- Dev Server
  - Serves files, HMR via websocket, live reload fallback

- Plugin System
  - Plugin hooks, sandboxed execution via worker pool

- Cache & Watcher
  - File watching, incremental builds, persistent cache

- Native Workers (Rust)
  - Optional high-performance tasks: minify, analyze, chunking optimizer

- Visual Pipeline UI
  - Drag-and-drop editor that syncs to CLI config

## Contracts and data shapes

- BuildConfig
  - root: string
  - entry: string[]
  - mode: 'development' | 'production' | 'test'
  - outDir: string
  - plugins: Array<PluginConfig>

- DependencyGraph
  - nodes: Map<filePath, ModuleNode>
  - edges: Map<filePath, Set<depFilePath>>

## Worker model
- Thread pool for CPU-bound tasks. Node workers call Rust native binary via IPC for heavy transforms.

## Security & Sandboxing
- Plugins run in isolated VM context or worker process with strict IPC surface.

## Edge targets
- Output optimizations per platform (Cloudflare, Vercel, Deno), module formats (ESM/CJS), and edge runtime bundles.

## Next steps
- Implement minimal CLI and dev server
- Add resolver and esbuild-based bundler prototype
- Wire basic plugin hooks

## Deterministic build & cache (prototype)

- Disk cache stored under `.urja_cache/` keyed by a sha256 fingerprint of input files.
- On build, the tool computes a fingerprint from entry files content and uses it to check the cache.
- Cache stores a small manifest and a copy of output files under `.urja_cache/<key>/files`.
- On cache hit the tool restores cached files into the configured `outDir` and skips bundling.

Notes and guarantees (prototype):
- Prototype guarantees content-addressed keying based on SHA-256 over entry file contents. For production
  you'll want to expand the fingerprint to include config, plugin versions, environment, and dependency graph.
- Future improvements: deterministic chunk naming seed, manifest signing, partial cache restores, remote cache support.
