# Urja: Architecture in Practice

**Module**: 12 (Phase H.4)  
**Status**: ✅ Active

This document provides a technical deep dive into the practical implications of Urja’s architectural decisions, specifically focusing on the trade-offs of the Adapter System.

## 🏗️ The Adapter Isolation Model

Unlike mainstream tools like Vite or Webpack, where framework support is added via **Plugins** that share a global context, Urja uses **Adapters** that act as isolated sandboxes.

### The Benefit: Determinism
In a plugin-based system, a React plugin and a Vue plugin might interfere with the same file-graph logic. In Urja, the `MithrilAdapter` and `LitAdapter` never meet. They are orchestrated by the Core Engine but execute their framework-specific logic in total isolation.

### The Trade-off: Duplicate Logic
Because adapters are isolated, they cannot easily share internal optimizations (like shared esbuild instances). This leads to higher memory usage when multiple frameworks are built simultaneously in the same workspace.

---

## 🌩️ HMR Model: Neutrality vs. Speed

Urja’s HMR model is **Request-Driven**. The core detects a file change and notifies the adapter. The adapter then decides if it's an `update` or a `reload`.

- **Success**: This allowed us to support **Alpine.js** (runtime-based) and **Lit** (class-based) with the exact same core code.
- **Limitation**: We lose "Global State Preservation" that deeply integrated tools (like Next.js) offer. Because Urja doesn't "know" React, it cannot guarantee React state is preserved during a re-render unless the adapter manually handles the proxying—which adds significant complexity.

---

## 🚫 The Intentional Exclusion of SSR

A significant portion of Module 8 was spent ensuring **no SSR logic entered the core**.

**Why?**
SSR requires the build tool to understand the framework's runtime (e.g., how to stringify a component). If Urja included a `renderToString` helper, it would be biased towards React or Vue. 

**The Result**:
Urja remains a "Pure Bundler." It produces static assets (JS, CSS, HTML) that can be served by any server, but it does not participate in the server-side execution of framework code. This makes Urja an order of magnitude simpler than Meta-frameworks, but less "batteries-included."

---

## 🔍 Final Assessment

Urja’s architecture is an exercise in **Discipline**. 

By refusing to add "magic" helpers for specific frameworks, we have created a tool that is:
1. **Forever Framework-Agnostic**: It won't break when a new framework is released.
2. **Auditable**: Every build step is a direct consequence of an adapter promise.
3. **Deterministic**: No hidden core heuristics.

However, this discipline comes at the cost of **Developer Convenience**. Users must be comfortable managing their own server-side logic and accepting slightly higher cold-start times in exchange for architectural purity.
