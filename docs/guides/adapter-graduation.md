# Phase H4.1 — Adapter Graduation Policy

**Status**: 🔒 **HARD-ENFORCED**  
**Phase**: H4 (Ecosystem Lock-In)  
**Applies To**: All framework adapters (official & community)  
**Core Impact**: ❌ NONE

---

## 🎯 Purpose (Why This Exists)

Prevent adapter sprawl, unstable promises, and accidental “official” support.

This policy answers one question clearly:
**When can an adapter be trusted, and what does Lunx guarantee about it?**

Without this policy:
- “Works on my machine” becomes support
- Core team becomes implicit maintainers
- Ecosystem becomes fragile

---

## 🧱 Adapter Lifecycle States (LOCKED)

Every adapter MUST be in **exactly one** state.

### 1️⃣ Experimental
**Default state for all new adapters**

- **Definition**: New adapter, Unproven, No guarantees.
- **Characteristics**: 
    - Limited test coverage
    - May change without notice
    - No stability guarantees
    - No backwards compatibility promise
- **Rules**: 
    - ❌ Cannot be advertised as stable
    - ❌ Cannot be required by presets
    - ❌ No implied core team support
- **Owner**: Author only.

### 2️⃣ Candidate
**Opt-in evaluation state**

- **Definition**: Adapter shows promise, Under review for stability.
- **Entry Requirements**:
    - All Tier-1 capability tests passing
    - CI configured
    - Security checklist clean
    - Deterministic builds verified
- **Rules**:
    - ⚠️ Still no stability guarantee
    - ⚠️ API may still change
    - ✅ Eligible for graduation review
- **Owner**: Author + Governance review.

### 3️⃣ Stable
**Trusted adapter**

- **Definition**: Adapter is production-ready, Behavior is predictable and versioned.
- **Entry Requirements (MANDATORY)**:
    - Adapter exists for ≥ 2 minor releases
    - Zero unresolved critical bugs
    - Full Tier-1 capability checklist green
    - Deterministic output verified in CI
    - Security checklist clean
    - No core or Module 8 infra changes
    - Documentation complete
- **Rules**:
    - ✅ Semantic versioning required
    - ❌ Breaking changes in minor versions forbidden
    - ❌ Silent behavior changes forbidden
    - ⚠️ Deprecations must be announced
- **Owner**: Maintainer (may be core or external).

### 4️⃣ Deprecated
**Sunset state**

- **Definition**: Adapter is no longer recommended.
- **Triggers**: Maintainer unresponsive, Security risk discovered, Framework ecosystem abandoned, Better replacement exists.
- **Rules**:
    - ⚠️ Explicit deprecation notice required
    - ⚠️ Grace period (≥ 1 minor release)
    - ❌ No new features

### 5️⃣ Archived
**End-of-life**

- **Definition**: Adapter is frozen forever.
- **Rules**:
    - ❌ No updates
    - ❌ No support
    - ✅ Remains for historical reference only

---

## 🔒 Promotion & Demotion Rules (HARD LOCKS)

### Promotion
- Must be requested explicitly.
- Must pass governance checklist.
- Must be reviewed asynchronously (no rush approvals).

### Demotion
- May occur if:
    - Security violation discovered
    - Determinism broken
    - Governance rules violated
- Decision documented.

---

## 🚫 What This Policy Forbids

- ❌ “Implicitly stable” adapters
- ❌ Popularity-based promotion
- ❌ Emergency exceptions
- ❌ Retroactive promises
- ❌ Silent behavior changes

---

## 📋 Required Adapter Metadata

Every adapter MUST declare:

```yaml
adapter:
  name: <string>
  state: experimental | candidate | stable | deprecated | archived
  maintainer: <string>
  supported_capabilities: <array>
  last_reviewed: <date>
```

**No metadata → adapter is `experimental` by default.**

---

## 🧠 Governance Principle (NON-NEGOTIABLE)

**Stability is earned by time, evidence, and discipline — not enthusiasm.**

---

## 🏁 Exit Criteria — Phase H4.1 COMPLETE

H4.1 is DONE when:
- [x] This policy is documented
- [ ] Adapter states are declared (Lit, Alpine, Mithril)
- [x] Promotion rules are locked
- [x] No adapter can “accidentally” become official
