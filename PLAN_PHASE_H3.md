# Urja — Phase H3: Governance Enforcement

**Status**: 🔧 **ACTIVE** (Started 2025-12-30)  
**Mode**: ENFORCEMENT (not formation, not growth)  
**Duration**: 4–6 weeks  
**Primary Goal**: Prove that Urja can evolve without touching the core

---

## 🧱 Entry Preconditions ✅ ALL MET

- ✅ Core snapshot-locked (v0.1.3)
- ✅ Phase H2 governance documents complete (9 docs, 2,893 lines)
- ✅ Extension surfaces defined and frozen
- ✅ Plugin contract binding internally

**➡️ Phase H3 may begin immediately**

---

## 🎯 Phase H3 Objective (Single Sentence)

**Convert governance from "documents people respect" into "rules the system enforces."**

---

## 🧭 PHASE H3 — WORK STREAMS

### H3.1 — Code-Level Boundary Enforcement (MANDATORY)

**Purpose**: Prevent accidental or intentional violations of governance rules.

#### Actions

- [ ] **Annotate codebase with**:
  - `@public` — Stable API, semantic versioning applies
  - `@internal` — Implementation detail, may change
  - `@experimental` — Unstable, requires opt-in

- [ ] **Identify all plugin-reachable entry points**:
  - `src/plugins/index.ts` (plugin system)
  - `src/config/index.ts` (config API)
  - `src/cli/*.ts` (CLI commands)

- [ ] **Explicitly block**:
  - Imports from `src/core/graph.ts`
  - Imports from `src/core/planner.ts`
  - Imports from `src/core/cache.ts`
  - Imports from `src/core/hash.ts`
  - Access to hashing or invalidation logic

#### Enforcement

- [ ] **Static checks (ESLint rules)**:
  - Rule: `no-restricted-imports` for internal modules
  - Rule: `no-internal-api-access` (custom)
  - Rule: `require-experimental-flag` (custom)

- [ ] **TypeScript visibility**:
  - Mark internal classes/functions as `private` or use `#private`
  - Export only public APIs from barrel files

- [ ] **CI Integration**:
  - Lint checks must pass before merge
  - No bypassing via `// eslint-disable`

#### Exit Condition

✅ **Governance violations fail before runtime**  
✅ **Core team cannot bypass rules "by accident"**

**Verification**:
1. Try to import `src/core/graph.ts` from a plugin → **Lint error**
2. Try to access internal API → **TypeScript error**
3. Try to use experimental API without flag → **Runtime error**

---

### H3.2 — Stability Audit Automation (CRITICAL)

**Purpose**: Make governance measurable and non-negotiable.

#### Actions

- [ ] **Convert `STABILITY_AUDIT.md` into executable checklist**:
  - Create `scripts/audit/api-surface.ts`
  - Create `scripts/audit/plugin-contract.ts`
  - Create `scripts/audit/inspector-schema.ts`
  - Create `scripts/audit/code-quality.ts`
  - Create `scripts/audit/breaking-changes.ts`

- [ ] **Automate checks for**:
  - Core API drift (compare public exports)
  - Plugin contract changes (hook signatures)
  - Snapshot mismatches (determinism)
  - Inspector schema changes (JSON schema)
  - Code quality (TODOs, FIXMEs, @ts-ignore)

- [ ] **Integrate audit into CI**:
  - Add `npm run audit:all` to CI pipeline
  - Run on every PR
  - Run before every release

#### Enforcement

- [ ] **Any audit failure**:
  - Blocks PR merge
  - Blocks release
  - Requires explicit override with justification (logged)

- [ ] **Audit report generation**:
  - Generate `AUDIT_REPORT_vX.X.X.md` for each release
  - Track violations over time
  - Publish audit history

#### Exit Condition

✅ **No release can occur without passing the audit**  
✅ **Human judgment removed from core safety decisions**

**Verification**:
1. Change a public API → **Audit fails**
2. Add a plugin hook → **Audit fails**
3. Break snapshot → **Audit fails**
4. All checks pass → **Release allowed**

---

### H3.3 — First Governance Stress Test (REALITY CHECK)

**Purpose**: Prove governance survives real pressure.

#### Actions

- [ ] **Take one real extension request** (plugin or compatibility):
  - Option 1: Community plugin submission
  - Option 2: Framework compatibility request (e.g., Preact, Qwik)
  - Option 3: Internal experimental feature (e.g., AI optimizer)

- [ ] **Treat it as hostile-by-default**:
  - Assume it will try to violate boundaries
  - Evaluate strictly via contracts

- [ ] **Evaluate strictly via**:
  - `EXTENSION_SURFACE.md` — Is this extension point allowed?
  - `PLUGIN_CONTRACT.md` — Does it violate determinism/performance rules?
  - `COMPATIBILITY_POLICY.md` — Is there real demand (5+ users)?

#### Possible Outcomes

- ✅ **Accepted without core change** — Plugin/adapter fits within boundaries
- ❌ **Rejected with contract citation** — Violates specific paragraph
- ⚠️ **Deferred** — Demand insufficient, revisit later

#### Hard Rule

- ❌ **Core CANNOT be modified to "make it fit"**
- ❌ **No new hooks allowed**
- ❌ **No "just this once" exceptions**

#### Exit Condition

✅ **Decision made purely by contract**  
✅ **Zero emotional or architectural debate**

**Verification**:
1. Request evaluated → Decision in <1 hour
2. Rejection cites specific contract paragraph
3. No core changes required
4. Requester understands reasoning

---

### H3.4 — Intentional Inactivity Window (VERY IMPORTANT)

**Purpose**: Expose hidden pressure points.

#### Actions

- [ ] **For 2 full weeks (Week 4-5)**:
  - ❌ Do NOT add features
  - ❌ Do NOT refactor core
  - ❌ Do NOT expand compatibility
  
- [ ] **Only allow**:
  - ✅ Bug fixes (correctness issues)
  - ✅ Documentation clarifications
  - ✅ Preset tweaks (plugin configs)
  - ✅ Performance optimizations (non-breaking)

- [ ] **Observation & Tracking**:
  - Keep a log: `INACTIVITY_LOG.md`
  - Track every time you want to change core
  - Document why that urge exists
  - **That urge = governance gap**

#### Observation Questions

1. **When did you want to change core?**
   - What triggered the urge?
   - Was it a user request?
   - Was it internal refactoring desire?

2. **Why did you want to change it?**
   - Was the current API insufficient?
   - Was it a performance issue?
   - Was it "while I'm here" syndrome?

3. **Could it be solved without core changes?**
   - Plugin solution?
   - Preset configuration?
   - Documentation improvement?

#### Exit Condition

✅ **You feel calm maintaining Urja**  
✅ **Core changes feel unnecessary, not tempting**

**Verification**:
1. 2 weeks pass with zero core changes
2. Inactivity log shows <3 urges to change core
3. All urges were resolved without core changes
4. Team feels confident, not frustrated

---

### H3.5 — Governance Review & Lock-In

**Purpose**: Finalize governance as infrastructure.

#### Actions

- [ ] **Review inactivity period**:
  - Analyze `INACTIVITY_LOG.md`
  - Identify any attempted violations
  - Identify friction points
  - Identify unclear rules

- [ ] **Update governance docs ONLY IF**:
  - Rules were insufficient (not inconvenient)
  - Genuine gap discovered
  - Contract was ambiguous

- [ ] **Do NOT relax rules to accommodate convenience**:
  - If it was hard, that's the point
  - If it required workaround, that's correct
  - If it felt restrictive, governance is working

- [ ] **Finalize governance version**:
  - Lock all contracts as `v1.0.0`
  - Any future changes require major version
  - Announce governance stability

#### Exit Condition

✅ **Governance rules unchanged for ≥1 minor cycle**  
✅ **Confidence > curiosity**

**Verification**:
1. Governance docs unchanged for 4+ weeks
2. No pressure to relax rules
3. Team trusts the system
4. External contributors understand boundaries

---

## 🚫 ABSOLUTE PROHIBITIONS DURING H3

**Even if tempting — do NOT**:

- ❌ Change graph semantics
- ❌ Add new plugin hooks
- ❌ Expose internal APIs
- ❌ Enable SSR/Edge experiments
- ❌ Promote AI features
- ❌ Chase benchmarks
- ❌ Refactor core "for cleanliness"
- ❌ Add framework heuristics

**Breaking any of these invalidates Phase H3.**

---

## 📋 PHASE H3 — EXECUTION CHECKLIST

### Week 1–2: Enforcement Infrastructure
- [ ] Annotate all code with `@public`, `@internal`, `@experimental`
- [ ] Create ESLint rules for boundary enforcement
- [ ] Create TypeScript visibility barriers
- [ ] Implement static checks in CI
- [ ] Create audit automation scripts
- [ ] Integrate audit into CI pipeline
- [ ] Test enforcement (try to violate, verify it fails)

### Week 3: Stress Test
- [ ] Select one real extension request
- [ ] Evaluate via contracts (no emotions)
- [ ] Accept, reject, or defer with justification
- [ ] Document decision process
- [ ] Verify no core changes required

### Week 4–5: Inactivity Window
- [ ] Announce inactivity period to team
- [ ] Create `INACTIVITY_LOG.md`
- [ ] Track all urges to change core
- [ ] Resolve issues without core changes
- [ ] Only allow bug fixes and docs

### Week 6: Review & Lock-In
- [ ] Analyze inactivity log
- [ ] Review governance effectiveness
- [ ] Update contracts if gaps found (rare)
- [ ] Lock governance as `v1.0.0`
- [ ] Announce governance stability
- [ ] Generate Phase H3 completion report

---

## 🎯 Exit Conditions Summary

| Stream | Exit Condition | Verification |
|--------|---------------|--------------|
| **H3.1** | Violations fail before runtime | Lint/TS errors block bad imports |
| **H3.2** | No release without audit | CI blocks release on audit failure |
| **H3.3** | Decision by contract, not debate | Extension evaluated in <1 hour |
| **H3.4** | Core changes feel unnecessary | 2 weeks, <3 core change urges |
| **H3.5** | Rules unchanged for ≥1 cycle | 4+ weeks of governance stability |

---

## 🧠 SINGLE RULE FOR PHASE H3

**"If the core feels harder to change than to extend around, governance is working."**

---

## 📊 Success Metrics

### Quantitative
- **Boundary violations**: 0 (blocked by automation)
- **Audit failures**: 0 (before release)
- **Core changes during H3**: <5 (bug fixes only)
- **Extension requests processed**: ≥1
- **Governance doc changes**: 0 (or minimal)

### Qualitative
- **Team confidence**: High (trust the system)
- **External clarity**: High (contributors understand rules)
- **Maintenance burden**: Low (automation handles checks)
- **Core stability**: High (no temptation to change)

---

## 🚀 Phase H3 Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1-2 | Enforcement Infrastructure | Annotations, ESLint, Audit scripts, CI |
| 3 | Stress Test | Extension evaluation, Decision documentation |
| 4-5 | Inactivity Window | Inactivity log, Urge tracking |
| 6 | Review & Lock-In | Governance v1.0.0, Completion report |

**Start Date**: 2025-12-30  
**Target Completion**: 2026-02-10 (6 weeks)

---

## 📝 Deliverables

### Code Artifacts
1. API annotations (`@public`, `@internal`, `@experimental`)
2. ESLint rules (`eslint-plugin-urja-governance`)
3. Audit scripts (`scripts/audit/*.ts`)
4. CI integration (`.github/workflows/governance.yml`)

### Documentation
1. `INACTIVITY_LOG.md` — Tracking core change urges
2. `GOVERNANCE_v1.0.0.md` — Locked governance version
3. `PHASE_H3_COMPLETION_REPORT.md` — Final report
4. Audit reports (`AUDIT_REPORT_vX.X.X.md`)

### Process
1. Extension evaluation template
2. Governance override process
3. Audit failure escalation

---

**Status**: 🔧 **ACTIVE**  
**Next Action**: Begin H3.1 (Code-Level Boundary Enforcement)

---

*Created: 2025-12-30*  
*Team: Urja Core Engineering*
