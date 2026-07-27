# Lunx

A build tool with a Rust-native core, 16 framework
adapters, and a built-in security CLI.

## Install

```bash
npm create lunx@latest my-app
cd my-app && npm install
npm run dev
```

## Performance

All numbers measured on real fixtures —
see [benchmarks repo](https://github.com/Avinash-1994/lunx-benchmarks).

| Metric                   | Value       |
|--------------------------|-------------|
| HMR latency p99          | 18ms        |
| HMR latency p50          | 12ms        |
| Cold build (5000 modules)| 286ms       |
| Warm pre-bundle          | 4ms         |
| SQLite cache hit rate    | 99.90%      |
| Remote cache reduction   | 92.5%       |
| Brotli compression       | 69.5%       |
| File detection latency   | 6.20ms      |

## 16 Framework Adapters

React, Vue, Svelte, Angular, SolidJS, Preact,
SvelteKit, Nuxt, Remix, Next.js (Pages Router),
Astro, SolidStart, Qwik City, TanStack Start,
Waku, Analog, React Router v7, VitePress,
Electron, Tauri

Each adapter validated with a real test fixture.
Zero mocks.

## Built-in Security CLI

```bash
lunx security audit      # lockfile + CVE + secrets + plugins
lunx security scan       # scan source for leaked credentials
lunx security cve        # check deps against OSV database
lunx security sbom       # generate CycloneDX 1.5 SBOM
lunx security headers    # generate Nginx/Vercel/Netlify CSP
lunx security fix        # auto-fix vulnerabilities
lunx security plugins    # audit plugin permissions
lunx security report     # full HTML/JSON security report
```

Security runs before every build. If a secret
is found in your source files, the build aborts
before writing to dist/.

## Official Plugins

| Plugin                    | What it does                          |
|---------------------------|---------------------------------------|
| @lunx/plugin-env          | LUNX_ env vars + .d.ts generation     |
| @lunx/plugin-pwa          | manifest.json + service worker        |
| @lunx/plugin-icons        | on-demand icon loading (mdi/fa/tabler)|
| @lunx/plugin-svg          | SVG as URL, raw string, or component  |
| @lunx/plugin-legacy       | IE11 polyfills via SWC downlevel      |
| @lunx/plugin-compression  | Rust brotli 69.5% + gzip fallback     |
| @lunx/plugin-auto-import  | auto-inject imports + .d.ts           |
| @lunx/plugin-inspect      | build graph at /__lunx_inspect__      |
| @lunx/plugin-checker      | TypeScript + ESLint in worker threads |
| @lunx/plugin-mock         | REST + GraphQL mock server            |
| @lunx/plugin-image        | AVIF + WebP + responsive srcset       |

## Configuration

```typescript
// lunx.config.ts
import { defineConfig } from 'lunx'

export default defineConfig({
  framework: 'sveltekit'
  // preset: 'ssr' and platform: 'node' implied
  // entry: auto-detected from src/
  // outDir: 'dist' (default)
})
```

## CLI

```bash
lunx dev          # start dev server with HMR
lunx build        # production build with security scan
lunx preview      # serve production build locally
lunx create       # interactive project scaffolding
lunx migrate      # migrate from older versions
lunx why <module> # print import chain to a module
lunx check        # TypeScript + circular import check
lunx info         # print environment info for bug reports
lunx env          # list and validate LUNX_ env vars
lunx doctor       # run project health diagnostics
lunx security     # 8-command security suite
```

## Docs

https://github.com/Avinash-1994/lunx/wiki
(full documentation at lunx.dev)

## License

MIT
