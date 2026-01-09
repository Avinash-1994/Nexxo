# Nexxo Build Tool - AI Agent Instructions

> Essential knowledge for productive development in the Nexxo codebase

## Architecture Overview

**Nexxo** is a hybrid build tool combining TypeScript orchestration with Rust native extensions for performance. The architecture enforces **strict architectural boundaries**:

- **Modules 1-8 (Core)**: Hard-frozen. Framework-agnostic engine using esbuild and SQLite caching. No framework-specific code allowed.
- **Module 9 (Adapter Registry)**: Locked schema defining framework tier system (Tier 1=Stable, Tier 2=Candidate, Tier 3=Experimental).
- **Phase H (Ecosystem)**: Active phase for framework adapters and extensibility (Modules 9-13).

### Component Boundaries

```
┌─────────────────────────────────────────────┐
│  CLI & Config                               │
│  (src/cli/*.ts, src/config/index.ts)        │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼─────────────────────────────────┐
│  FrameworkPipeline (Auto-detection)         │
│  (src/core/pipeline/framework-pipeline.ts)  │
└──────────┬──────────────────────────────────┘
           │
  ┌────────┴────────┐
  │                 │
┌─▼──────┐    ┌─────▼──────┐
│CoreBuild  │    │FrameworkAdapter
│Engine  │    │ (Isolated)
│        │    │
│esbuild │    │Vite/Custom
│cache   │    │Build Logic
└────────┘    └────────────┘
```

**Golden Rule**: Adapters are **isolated data producers**. They MUST NOT import from `src/core/`. Core MUST NOT contain framework heuristics.

## Critical Workflows

### Build Process
```bash
npm run build:native    # Compile Rust extensions (scripts/build_native.js)
npm run build           # TypeScript compilation → postbuild hook
npm run dev             # Start dev server with HMR
```

**Build Pipeline Steps** (in `src/build/bundler.ts`):
1. Load config via `loadConfig()` (reads nexxo.config.js)
2. Auto-detect framework using `detectFramework()` from package.json
3. Create `FrameworkPipeline` with detected framework
4. Execute pipeline.build() which returns `{ success, artifacts, manifest }`
5. Write artifacts to outDir

### Testing & Verification
```bash
npm run test            # Jest (ts-jest config, ESM preset)
npm test:all            # Integration suite: config/bootstrap/federation/HMR/framework tests
npm run audit:all       # ESLint governance + plugin contract checks
npm run lint            # ESLint on src/** and tests/**
```

**Test Architecture**: Tests use `tsx` for TypeScript execution. Key test files:
- `tests/pipeline_test.mjs` - Core build pipeline (resolver → transformer → bundler)
- `tests/phase_3_1_hmr_*_test.ts` - HMR (Hot Module Replacement) behavior
- `tests/framework_verification_test.ts` - All framework adapters

## Key Patterns & Conventions

### Framework Adapter Pattern
Every framework adapter (React, Vue, Svelte, etc.) implements `FrameworkAdapter` interface:

```typescript
// frameworks/lit-adapter/src/types.ts
interface FrameworkAdapter {
  name: string;
  init(options: AdapterOptions): Promise<void>;
  build(): Promise<AdapterOutput>;  // Handles both dev & prod
  handleHmr(event: HMREvent): Promise<{ type: 'reload' | 'update'; modules: string[] }>;
}
```

**Location**: `frameworks/{framework}-adapter/src/index.ts`
**Requirements**: Must include `adapter.manifest.json` declaring tier, renderModel (dom/string), ssr support.

### Plugin System
Plugins are **pure functions** in a transformation pipeline, registered in `nexxo.config.js`:

```typescript
// src/plugins/ implementations
export function myPlugin(options: PluginOptions): NexxoPlugin {
  return {
    name: 'my-plugin',
    resolveId(source: string): string | null { /* deterministic */ },
    load(id: string): { code; map } | null { /* I/O safe */ },
    transform(code: string, id: string): { code; map } | null { /* pure */ }
  };
}
```

**Rules**:
- `resolveId()` must be deterministic, return absolute paths or null
- `load()` can do I/O (only hook that should)
- `transform()` must be pure (no side effects)
- Virtual modules use `\0` prefix (e.g., `\0virtual:my-module`)

### Configuration
Entry point: `src/config/index.ts` exports `loadConfig()` which:
1. Reads `nexxo.config.js` from project root
2. Detects framework from `package.json`
3. Applies framework preset (CSS, plugins, etc.)
4. Validates config against BuildConfig schema

**Config location**: Root `nexxo.config.js` (see examples/ for templates)

### Universal Transformer
`src/core/universal-transformer.ts` bridges framework compilation to esbuild:
- Detects file extensions (.jsx, .vue, .svelte, etc.)
- Routes to appropriate transformer (JSX→JS, SFC→ESM, etc.)
- Returns transformed code + source maps
- Used by esbuild plugin in `src/plugins/esbuildAdapter.ts`

## Project-Specific Constraints

1. **Zero Core Change Policy**: Modules 1-8 are frozen. Only security/regression fixes allowed.
2. **No Framework Coupling in Core**: Never add `if (framework === 'react')` logic to `src/core/` or `src/resolve/`.
3. **Deterministic Builds**: Every build must hash the same given identical inputs (tracked in SQLite cache at `.nexxo_cache/build.db`).
4. **ESLint Governance**: Custom rules in `eslint-plugin-nexxo-governance/` enforce boundaries. Run `npm run lint` before commits.

## File Organization

- `src/cli/` - CLI entry points and commands
- `src/core/` - **Frozen core**: engine, resolver, framework detection, universal transformer
- `src/plugins/` - Extensibility: esbuild adapter, federation, CSS, asset plugins
- `src/presets/` - Framework presets (load plugins for detected framework)
- `src/config/` - Configuration loading and schema validation
- `src/dev/` - Dev server, HMR runtime, watcher
- `frameworks/` - Individual framework adapters (isolated, can change freely)
- `tests/` - Integration tests (use tsx/jest, NOT playwright for unit tests)

## Common Tasks

**Adding a new framework adapter**:
1. Copy `frameworks/mithril-adapter` template
2. Implement `FrameworkAdapter` in `src/index.ts`
3. Create `adapter.manifest.json` with tier, ssr, hmr capabilities
4. Add test app in `tests/app-{framework}`
5. Run `npm run audit:all` to verify plugin contract

**Fixing a build issue**:
1. Check if it's core vs adapter: run `npm run test:all` framework-verification test
2. If core: trace through pipeline (resolver → transformer → bundler) in `tests/pipeline_test.mjs`
3. If adapter: check `frameworks/{framework}-adapter/src/index.ts` (NOT core)

**Modifying plugins**:
1. Never add framework detection to plugin logic—use `getFrameworkConfig()` in `src/plugins/framework-plugins.ts`
2. Test with `npm run test`, verify in `tests/pipeline_test.mjs`

## References

- [GOVERNANCE.md](../GOVERNANCE.md) - Freeze policies, breaking change rules
- [ADAPTER_AUTHORING_GUIDE.md](../ADAPTER_AUTHORING_GUIDE.md) - Build your own adapter
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Deep architecture dive
- [docs/internal/HOW_PLUGINS_WORK.md](../docs/internal/HOW_PLUGINS_WORK.md) - Plugin internals
- [docs/internal/HOW_COMPATIBILITY_WORKS.md](../docs/internal/HOW_COMPATIBILITY_WORKS.md) - Adapter patterns
