# Urja Adapter Governance

**Module**: 9 (Phase H.1)  
**Status**: ✅ Active  
**Enforced By**: Urja Core Team

This document defines the rules for how adapters enter the ecosystem, how they are promoted, and strictly forbids breaking changes for Tier-1 adapters.

---

## 🚦 Tier Promotion Rules

### 🥉 Tier 3 (Experimental) → 🥈 Tier 2 (Candidate)
To move from Experimental to Candidate, an adapter must:
1.  **Exist for > 2 weeks** with active development.
2.  **Pass the complete Test Suite** (`scripts/verify.ts`).
3.  **Security Audit**: No `fs` writes outside root, no `eval`, no external shell commands.
4.  **Manifest Compliance**: Must have a valid `manifest.json`.

### 🥈 Tier 2 (Candidate) → 🥇 Tier 1 (Stable)
To move from Candidate to Stable (Tier 1), an adapter must:
1.  **Survive 2 minor Urja releases** without breaking.
2.  **Zero Critical Bugs** for at least 30 days.
3.  **Review by Core Team**: Manual code review of the entire adapter.
4.  **Production Verification**: Must be used in at least one reference production project.
5.  **Documentation**: Complete `README.md` and usage examples.

---

## 🔒 Security Expectations (Non-Negotiable)

All adapters (Tier 1-3) are subject to these Hard Limits:

1.  **Filesystem Constraints**:
    *   Adapters may **READ** from the user's source directory.
    *   Adapters may **WRITE** only to the build output directory or temp cache.
    *   Adapters **MUST NOT** modify Urja Core files or Configuration.

2.  **Isolation**:
    *   Adapters must not pollute global scope (`window`, `global`).
    *   Adapters must not depend on other adapters.

3.  **Dependencies**:
    *   Must use strictly versioned dependencies.
    *   No dynamic `require()` or `import()` of user code without sanitization.

---

## 💥 Breaking Change Policy

### Tier 1 (Stable)
*   **STRICTLY FORBIDDEN** in minor versions.
*   Breaking changes require a Major Version bump of the Adapter AND a migration script.
*   "Frozen" adapters (Lit, Mithril, Alpine) are exempt from changes entirely unless a security vulnerability is found.

### Tier 2 (Candidate)
*   Allowed with warning.
*   Must be documented in `CHANGELOG.md`.

### Tier 3 (Experimental)
*   Anything goes. No guarantees.

---

## 🌇 Deprecation & Exit

If an adapter is no longer maintained or safe:

1.  **Deprecation Notice**: Mark `status: "deprecated"` in manifest.
2.  **Grace Period**: 1 major release cycle.
3.  **Removal**: Moved to `frameworks/attic/` or deleted.

**Tier 1 adapters cannot be deprecated without a replacement.**
