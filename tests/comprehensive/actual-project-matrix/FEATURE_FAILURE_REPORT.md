# 🔍 Lunx Feature Failure Report

This report provides a deep dive into specifically which Lunx features are failing and why, based on real-project edge cases.

| Project | Feature | Error Type | Root Cause | Status |
|---------|---------|------------|------------|--------|
| Alpine.js | CSS Modules | Config Schema | `entry` must be an array, not a string | 🛠️ Fix Applied |
| Alpine.js | TypeScript | Config Schema | `sourcemap` must be enum, not boolean | 🛠️ Fix Applied |
| Alpine.js | Tree Shaking | Config Schema | Cascade failure from config error | 🔄 Re-testing |

---

## 🛠️ Technical Deep Dive

### 1. Configuration Validation Rigidity
*   **Symptom**: Lunx fails immediately if `lunx.config.js` slightly deviates from the latest internal Zod schema.
*   **Issue**: Most build tools (like Vite) auto-convert strings to arrays for convenience. Lunx is currently too strict.
*   **Impact**: Blocks initial project setup unless configurations are "perfect".

### 2. Alpine.js ESM Resolution
*   **Symptom**: Tree shaking test failed.
*   **Hypothesis**: Lunx might not be correctly identifying the "sideEffects" flag in Alpine's vanilla structure, leading to over-aggressive or under-aggressive shaking.

---

*This report is auto-updated by `runner.ts` during execution.*
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| React Query | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| React Query | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| VueUse | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| VueUse | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| VueUse | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| VueUse | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| VueUse | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| React Query | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| React Query | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|l\|i\|b\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| SvelteKit Skeleton | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| React Query | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| VueUse | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| SvelteKit Basic | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-21) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|s\|p\|a\|w\|n\| \|/\|b\|i\|n\|/\|s\|h\| \|E\|N\|O\|E\|N\|T\| | 🔴 Failed (2026-01-21) |
| Lit Todo App | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-21) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-21) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|E\|N\|O\|E\|N\|T\|:\| \|n\|o\| \|s\|u\|c\|h\| \|f\|i\|l\|e\| \|o\|r\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\|,\| \|s\|c\|a\|n\|d\|i\|r\| \|'\|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|t\|e\|s\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Lit Project | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tree Shaking | failed | \|N\|o\| \|J\|S\|/\|M\|J\|S\| \|o\|u\|t\|p\|u\|t\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| \|t\|o\| \|v\|e\|r\|i\|f\|y\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|N\|o\| \|e\|x\|e\|c\|u\|t\|a\|b\|l\|e\| \|J\|S\| \|f\|i\|l\|e\|s\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|R\|u\|n\|t\|i\|m\|e\| \|C\|h\|e\|c\|k\| \|F\|a\|i\|l\|e\|d\|:\| \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|-\|-\|c\|h\|e\|c\|k\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|.\|.\|.\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| React Query | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| VueUse | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Lit Project | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | TypeScript | error | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| \|-\|-\|s\|o\|u\|r\|c\|e\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Server-Side Rendering | N/A | \|P\|r\|o\|j\|e\|c\|t\| \|d\|o\|e\|s\| \|n\|o\|t\| \|s\|u\|p\|p\|o\|r\|t\| \|S\|S\|R\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Runtime Integrity | crashed | \|O\|u\|t\|p\|u\|t\| \|d\|i\|r\|e\|c\|t\|o\|r\|y\| \|n\|o\|t\| \|f\|o\|u\|n\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| TanStack Table | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| React Query | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| VueUse | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| SvelteKit Basic | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Svelte Motion | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Lit Project | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | CSS Modules | global | \|N\|o\| \|C\|S\|S\| \|f\|i\|l\|e\|s\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Alpine.js Starter | Library Mode | failed | \|L\|i\|b\|r\|a\|r\|y\| \|e\|n\|t\|r\|y\| \|p\|o\|i\|n\|t\|s\| \|m\|i\|s\|s\|i\|n\|g\| \|o\|r\| \|n\|o\|t\| \|g\|e\|n\|e\|r\|a\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tailwind CSS | skipped | \|T\|a\|i\|l\|w\|i\|n\|d\| \|n\|o\|t\| \|d\|e\|t\|e\|c\|t\|e\|d\| | 🔴 Failed (2026-01-22) |
| Nuxt Content | Tree Shaking | failed | \|E\|r\|r\|o\|r\|:\| \|C\|o\|m\|m\|a\|n\|d\| \|f\|a\|i\|l\|e\|d\|:\| \|n\|o\|d\|e\| \|/\|h\|o\|m\|e\|/\|a\|v\|i\|n\|a\|s\|h\|/\|D\|e\|s\|k\|t\|o\|p\|/\|f\|r\|a\|m\|e\|w\|o\|r\|k\|_\|p\|r\|a\|c\|t\|i\|s\|/\|b\|u\|i\|l\|d\|/\|d\|i\|s\|t\|/\|c\|l\|i\|.\|j\|s\| \|b\|u\|i\|l\|d\| | 🔴 Failed (2026-01-22) |
