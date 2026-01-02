# Urja Adapter Registry

**Phase**: H.1 (Module 9)  
**Status**: ✅ Active

This registry indexes all supported framework adapters for the Urja build system.

## 📖 What is an Adapter?

An **Adapter** is an isolated translation layer that allows Urja to build, bundle, and serve a specific frontend framework without modifying Urja's core logic. Adapters are **data producers**, not policy engines.

See: [Adapter Architecture](../MODULE_8_SCOPE.md)

---

## 🏆 Tiers & Stability

| Tier | Name | Definition | Support Level |
| :--- | :--- | :--- | :--- |
| **1** | **Core / Stable** | Fully verified, actively maintained by Core Team. Frozen API. | ✅ First-Class |
| **2** | **Candidate** | Community-maintained but high quality. Passing CI gate. | ⚠️ Best Effort |
| **3** | **Experimental** | New, unproven, or alpha. Use at own risk. | ❌ None |

**Schema**: All adapters must comply with the [Adapter Manifest Schema](./adapter.manifest.json).

---

## 📚 Registered Adapters

### Tier 1: Core / Stable

| Adapter Name | Render Model | Compiled | HMR | SSR | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[lit-adapter](./lit-adapter)** | `web-components` | ✅ Yes | ✅ Yes | `optional` | **FROZEN** |
| **[mithril-adapter](./mithril-adapter)** | `vdom` | ❌ No | ✅ Yes | `none` | **FROZEN** |
| **[alpine-adapter](./alpine-adapter)** | `dom` | ❌ No | ✅ Yes | `none` | **FROZEN** |

### Tier 2: Candidate
*None currently.*

### Tier 3: Experimental
*None currently.*

---

## ➕ Adding an Adapter

To add a new adapter:
1. Create a directory in `frameworks/`.
2. Implement the `FrameworkAdapter` interface.
3. Add a `manifest.json` complying with the schema.
4. Pass the `scripts/verify.ts` test suite.
5. Submit for Governance Review (See [ADAPTER_GOVERNANCE.md](../ADAPTER_GOVERNANCE.md)).
