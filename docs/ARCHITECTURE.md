# Nexxo Build Tool - Architecture

## Goals
- **Performance First**: Sub-second HMR and rapid cold builds even at 10k+ module scale.
- **Hybrid Architecture**: TypeScript for extensibility (plugins) + Rust for computation-heavy hot paths.
- **Deterministic Reliability**: Advanced caching and graph-first verification for production stability.
- **Universal Compatibility**: Layered adapter system supporting React, Vue, Svelte, Solid, and more.

## High-level modules

### 1. Hybrid Orchestrator (TypeScript)
- **CLI & Config**: Loads environment, parses `nexxo.config.js`, and manages the build/dev lifecycle.
- **Pipeline Controller**: coordinates the flow between resolver, graph, and bundler.

### 2. Native Core (Rust Extensions)
- **Fast Hashing (XXH3)**: Native ultra-fast file fingerprinting for cache invalidation.
- **Native Scanner**: High-speed dependency scanning using Rust regex, bypassing heavy AST walks.
- **Graph Analyzer**: Industrial-grade cycle detection and topological sorting via `petgraph`.
- **Worker Pool**: NAPI-RS based multi-threaded worker pool for parallel task execution.

### 3. Dynamic Resolver & Graph (Hybrid)
- **Discovery**: Automatically detects frameworks (React, Vue, etc.) from `package.json`.
- **Dependency Graph**: Maintains a live, bi-directional map of the entire project structure.

### 4. Expansion Pipeline (Universal Transformer)
- **Transparent Adapters**: Framework-specific logic (JSX, SFCs) handled via an abstraction layer.
- **Compatibility Mode**: Seamless integration with Rollup/Vite plugins for ecosystem access.

### 5. Dev Server & HMR
- **Middleware Engine**: High-performance Express-based server with smart asset serving.
- **HMR Runtime**: Version-agnostic reload logic that preserves state across updates.
- **Hot-Reload Throttle**: Prevents "Update Storms" in massive file-change scenarios.

### 6. Persistent Cache (SQLite)
- **Build Database**: Tracks file hashes, transformation results, and artifact metadata.
- **Zero-Cold-Start**: Instant builds on subsequent runs via `sqlite3` indexed cache.

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

## Stable Build Determinism
Nexxo ensures 100% deterministic builds by calculating a **Global Fingerprint** before every execution.

- **Storage**: Highly efficient SQLite database (`.nexxo_cache/build.db`).
- **Fingerprint Scope**:
  - Full source file content hashes (Native XXH3).
  - Merged configuration hash.
  - Resolved dependency graph topology.
  - Plugin versions and identities.
  - Critical environment variables (`NODE_ENV`, etc.).

Guarantees:
- **Cache Integrity**: Automatic recovery if the cache database is corrupted.
- **Incremental Efficiency**: Only modules affected by a change (and their dependents) are re-processed.
- **Portability**: Relative path normalization ensures cache can potentially be shared across environments.
