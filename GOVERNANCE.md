# Urja Governance & Stability

**Module**: 13 (Phase H.5)  
**Status**: ✅ Active

This document defines the decision authority, freeze policies, and long-term stability guarantees for the Urja project.

---

## 🏛️ Decision Authority

1.  **Core Maintainers**: The Urja Core Team has absolute authority over the repository.
2.  **Architectural Veto**: Any maintainer can veto a PR if it violates the "Zero Core Change" rule or introduces framework coupling.
3.  **Governance Board**: Major policy changes (e.g., thawing a frozen module) require a 100% consensus from the core maintainers.

---

## ❄️ Freeze Policies

Urja uses a **Module-Based Freeze** system:

1.  **Modules 1-8 (Core)**: **HARD FROZEN**. No logic changes allowed unless fixing a critical security vulnerability or an engine regression.
2.  **Module 9 (Registry)**: **LOCKED**. The schema and tier rules are canonical.
3.  **Phase H (Ecosystem)**: Active but governed. New modules can be added only after the previous one is CLOSED.

---

## 💥 Breaking Change Rules

### Core (Modules 1-8)
Breaking changes are forbidden. Any evolution requiring a core change must be implemented as a separate tool or a major version fork (Urja v2), which is not currently planned.

### Adapters (Tier 1)
Reserved for "Frozen" status. No changes allowed unless security-critical.

### Adapters (Tier 2/3)
Breaking changes are allowed but must be communicated in `CHANGELOG.md` and involve a minor version bump.

---

## 🛡️ Long-Term Stability Guarantees

1.  **Predictability**: An `urja.config.js` that works today will work forever with the same major version of Urja.
2.  **Neutrality**: Urja will never pivot to being a "React-first" or "Vue-first" tool.
3.  **Efficiency**: We will never trade core performance for feature convenience.

---

## 🏁 Exit Criteria for Phase H

Urja is considered "Community Ready" only when all Phase H modules (9-13) are marked as **CLOSED**. This document marks the final administrative gate for Phase H.
