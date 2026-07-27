# Nuclie Adapter Documentation

This directory contains documentation for all official framework adapters supported by the Nuclie build system.

---

## Architecture

All adapters implement the `NuclieAdapter` interface from `@nuclie/adapter-core` and auto-register into the `AdapterRegistry`. When Nuclie starts, it calls `registry.detect(projectRoot, pkg)` against each registered adapter in priority order — the first match wins.

```ts
interface NuclieAdapter {
  name: string;
  detect(projectRoot: string, pkg: PackageJson): boolean;
  plugins(): Plugin[];
  config(config: NuclieConfig): NuclieConfig | Promise<NuclieConfig>;
  serverMiddleware?(): Middleware[];
  ssrEntry?(config: NuclieConfig): string | undefined;
  buildOutput?(outputDir: string): Promise<void>;
}
```

---

## Supported Adapters

### Phase 0 — Core Infrastructure
| Package | Path |
|---------|------|
| `@nuclie/adapter-core` | `packages/nuclie-adapter-core/` |

### Phase 1 — Highest ROI Meta-Frameworks

| Adapter | Detection Key | Path |
|---------|--------------|------|
| `angular` | `@angular/core` + `@angular/compiler` | `src/framework-adapters/angular/` |
| `sveltekit` | `@sveltejs/kit` | `src/meta-frameworks/sveltekit/` |
| `solid-start` | `@solidjs/start` | `src/meta-frameworks/solidstart/` |
| `qwikcity` | `@builder.io/qwik` | `src/meta-frameworks/qwikcity/` |
| `astro` | `astro` | `src/meta-frameworks/astro/` |
| `remix` | `@remix-run/react` + `@remix-run/node` | `src/meta-frameworks/remix/` |

### Phase 2 — High-Value Meta-Frameworks

| Adapter | Detection Key | Path |
|---------|--------------|------|
| `analog` | `@analogjs/router` | `src/meta-frameworks/analog/` |
| `react-router` | `@react-router/dev` | `src/meta-frameworks/react-router/` |
| `tanstack-start` | `@tanstack/start` | `src/meta-frameworks/tanstack-start/` |
| `waku` | `waku` | `src/meta-frameworks/waku/` |
| `vitepress` | `vitepress` | `src/meta-frameworks/vitepress/` |
| `tauri` | `@tauri-apps/api` | `src/meta-frameworks/tauri/` |
| `electron` | `electron` | `src/meta-frameworks/electron/` |

### Phase 3 — Community Adapters

| Adapter | Detection Key | Path |
|---------|--------------|------|
| `gatsby` | `gatsby` | `src/meta-frameworks/gatsby/` |
| `redwoodjs` | `@redwoodjs/core` | `src/meta-frameworks/redwoodjs/` |
| `stencil` | `@stencil/core` | `src/meta-frameworks/stencil/` |
| `marko` | `marko` | `src/meta-frameworks/marko/` |
| `docusaurus` | `@docusaurus/core` | `src/meta-frameworks/docusaurus/` |

---

## Caching Strategy

All adapters that perform code transformation use **SQLite-backed build caching** via `getLazyCacheDatabase()`. Cache keys are computed as:

```
sha256(file_path + source_code + compiler_version)
```

This ensures:
- Cache hits on unchanged files (even across rebuilds)
- Cache misses on any content or compiler version change  
- Graceful fallback to in-memory cache if SQLite lock contention occurs

---

## Writing a Custom Adapter

1. Implement `NuclieAdapter` from `@nuclie/adapter-core`
2. Call `registry.register(new MyAdapter())` on module load
3. Import your adapter in the entry point so it self-registers

```ts
import type { NuclieAdapter } from '@nuclie/adapter-core';
import { registry } from '@nuclie/adapter-core';

export class MyAdapter implements NuclieAdapter {
  name = 'my-framework';

  detect(projectRoot, pkg) {
    return 'my-framework' in { ...pkg.dependencies, ...pkg.devDependencies };
  }

  plugins() { return []; }
  config(c) { return c; }
}

registry.register(new MyAdapter());
```

---

## Inviolable Rules

1. **No Express.js** — all server middleware maps through `uWS` directly
2. **No Vinxi** — SolidStart and TanStack adapters bypass Vinxi entirely  
3. **All peer dependencies are optional** — adapters use dynamic `import()` with `@ts-ignore` and graceful `try/catch`
4. **All transformations are SQLite-cached** — no re-compilation on unchanged files
5. **Zero regressions** — `npm run test:all` core suites must pass before any phase advance
