# Urja Adapter Authoring Guide

**Module**: 13 (Phase H.5)  
**Status**: ✅ Active

This guide explains how to build a production-grade framework adapter for Urja.

---

## 🏗️ Mental Model

An Urja Adapter is an **isolated bridge** between Urja's core and a framework's internal toolchain (e.g., Vite, esbuild, SWC). 

**The Golden Rule**: The adapter MUST NOT know about other adapters, and the Core MUST NOT know about the adapter's framework.

---

## 📦 Lifecycle Hooks

Every adapter must implement the `FrameworkAdapter` interface:

1.  **`init(options)`**: Receives the user's `urja.config.js` and sets up the internal toolchain.
2.  **`build()`**: Executes a production or dev build. Returns `AdapterOutput` containing assets and a module manifest.
3.  **`handleHmr(event)`**: Accepts a file path and returns whether to `update` a specific module or trigger a `reload`.

---

## 📄 Manifest Requirements

Every adapter folder must contain an `adapter.manifest.json` following the canonical [schema](./frameworks/adapter.manifest.json):

```json
{
  "name": "your-adapter",
  "tier": 3,
  "renderModel": "dom",
  "compiled": false,
  "hmr": true,
  "ssr": "none",
  "status": "experimental"
}
```

---

## 🥈 The Tier System

Adapters graduation path:
1.  **Tier 3 (Experimental)**: Newly created, unproven.
2.  **Tier 2 (Candidate)**: Passes `scripts/verify.ts`, 14-day stability, security audit.
3.  **Tier 1 (Stable/Frozen)**: Survives 2 minor releases, zero critical bugs, core team review.

---

## ✅ Validation Checklist (Before Submission)

- [ ] Passes `npm run test` inside the adapter directory.
- [ ] Passes `npx tsx scripts/verify.ts` in the Urja root.
- [ ] No `fs.writeFile` outside the designated output directory.
- [ ] No `eval()` or `new Function()` in the adapter logic.
- [ ] All dependencies are pinned to exact versions (no `^` or `~`).
- [ ] `README.md` includes setup instructions and a functional example.

---

## ❌ Common Mistakes & Anti-Patterns

1.  **Core Leakage**: Attempting to import modules from `src/core/` inside your adapter. Use the provided options in `init()`.
2.  **Global Pollution**: Modifying `process.env` or `global` without cleaning up.
3.  **Non-Deterministic Output**: Generating chunks with random IDs or timestamps that change without source changes.
4.  **Implicit Dependencies**: Depending on a tool that isn't listed in your adapter's `package.json`.

---

## 🏃 Getting Started

1.  Copy `frameworks/mithril-adapter` as a starting point.
2.  Update `adapter.manifest.json`.
3.  Implement the hooks in `src/index.ts`.
4.  Add a test app in `tests/app-hello`.
5.  Run the verification script.
