# Contributing to Urja

**Module**: 13 (Phase H.5)  
**Status**: ✅ Active

Thank you for your interest in Urja. Before contributing, please read this document carefully. Urja is a **frozen-core** project with strict architectural boundaries. We prioritize **determinism**, **isolation**, and **minimalism** over feature velocity.

---

## 🧠 Project Philosophy (NON-NEGOTIABLE)

1.  **Core Neutrality**: The core engine (Modules 1-8) must remain framework-agnostic forever. No JSX, no framework heuristics, and no magic detection.
2.  **Zero-Core Change**: We no longer accept PRs that modify the core logic of Modules 1-8 unless they fix a critical security vulnerability or a regression discovered in production.
3.  **Adapter Isolation**: Framework support lives exclusively in `frameworks/`. Adapters must act as isolated data producers, not policy engines.
4.  **No Hype**: Documentation and claims must be factual, measured, and reproducible.

---

## ✅ What Contributions are Welcome?

1.  **New Adapters (Tier-2+)**: We welcome high-quality adapters for new frontend paradigms. Please follow the [Adapter Authoring Guide](./ADAPTER_AUTHORING_GUIDE.md).
2.  **Starter Templates**: Well-structured, production-grade templates for Tier-1 and Tier-2 adapters.
3.  **Documentation**: Improvements to technical guides, benching methodologies, or onboarding flow.
4.  **Benchmarks**: Transparent performance measurements on diverse hardware.
5.  **Tooling**: External developer tools that consume Urja's manifest or output but live outside the core engine.

---

## ❌ What Contributions are NOT Welcome?

1.  **Core Refactors**: "Cleaning up" Modules 1-8 for stylistic reasons is forbidden.
2.  **Framework Coupling**: Any PR that introduces framework-specific code (e.g., `if (framework === 'react')`) into `src/core` or `src/resolve`.
3.  **JSX Requirements**: PRs that assume JSX is the primary or global authoring format.
4.  **Roadmap Speculation**: We do not accept PRs for features that are "planned" but not yet gated and documented in Phase H modules.

---

## 🛠️ Contribution Workflow

1.  **Discuss Before Coding**: Open a Detailed Technical Proposal (DTP) as an Issue.
2.  **Adhere to Governance**: Ensure your proposal aligns with `ADAPTER_GOVERNANCE.md` and `GOVERNANCE_LOCK_v1.md`.
3.  **Strict Linting**: PRs must pass the `urja-governance` ESLint rules.
4.  **Tests Mandatory**: No PR will be reviewed without 100% test coverage for the changes (unit and integration).
5.  **Audit Check**: PRs affecting adapters must pass `scripts/verify.ts`.

---

## ⚖️ Review & Acceptance Criteria

- **Safety**: Does this change threaten the "Zero Core Change" rule?
- **Isolation**: Does this change leak logic across framework boundaries?
- **Determinism**: Is the output of this change bit-for-bit identical across matching runs?
- **Maintenance**: Does this increase the core team's long-term maintenance burden?

PRs that fail any of these checks will be closed regardless of code quality.

---

## 🔒 Governance

Urja is governed by the **Urja Core Team**. Decision authority is absolute regarding core freezes and architectural drift. See [GOVERNANCE.md](./GOVERNANCE.md) for details.
