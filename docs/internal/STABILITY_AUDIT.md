# Urja Ecosystem Stability Audit — Release Gate Checklist

**Purpose**: Recurring audit for every minor release  
**Frequency**: Before every `v1.x.0` release  
**Owner**: Core Team  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This is a **release gate**, not a review.

**Rule**: If any checklist item fails, the release is blocked.

---

## 📋 Audit Checklist

### 1. Core APIs Unchanged

**Verification**:
```bash
npm run audit:api-surface
```

**Checks**:
- [ ] No public API signatures changed
- [ ] No public APIs removed
- [ ] New APIs are optional only
- [ ] TypeScript types are backward compatible

**If failed**:
- ❌ Block release
- Requires major version bump
- Or, revert changes

---

### 2. Plugin Contract Unchanged

**Verification**:
```bash
npm run audit:plugin-contract
```

**Checks**:
- [ ] Plugin hook signatures unchanged
- [ ] Plugin execution order unchanged
- [ ] Plugin context API unchanged
- [ ] No new required hooks

**If failed**:
- ❌ Block release
- Requires major version bump
- Or, make hooks optional

---

### 3. Snapshot Tests Authoritative

**Verification**:
```bash
npm run test:snapshots
```

**Checks**:
- [ ] All snapshot tests pass
- [ ] No snapshot changes without justification
- [ ] Determinism verified
- [ ] Cross-platform snapshots match

**If failed**:
- ❌ Block release
- Fix determinism issues
- Or, update snapshots with approval

---

### 4. Inspector Schema Stable

**Verification**:
```bash
npm run audit:inspector-schema
```

**Checks**:
- [ ] Graph JSON schema unchanged
- [ ] Inspector API unchanged
- [ ] No breaking changes to visualization

**If failed**:
- ❌ Block release
- Requires major version bump
- Or, add backward compatibility

---

### 5. No "Temporary" Hacks in Core

**Verification**:
```bash
npm run audit:code-quality
```

**Checks**:
- [ ] No `// TODO: remove this hack` in `src/core/`
- [ ] No `// FIXME` in critical paths
- [ ] No `@ts-ignore` without justification
- [ ] No `any` types in public APIs

**If failed**:
- ⚠️ Warning (not blocking)
- Create issues to track
- Plan cleanup in next release

---

### 6. Performance Benchmarks

**Verification**:
```bash
npm run benchmark
```

**Checks**:
- [ ] No regressions > 5% in build time
- [ ] No regressions > 10% in memory usage
- [ ] No regressions in bundle size
- [ ] HMR latency < 100ms

**If failed**:
- ❌ Block release
- Investigate regression
- Optimize or revert

---

### 7. Framework Compatibility Maintained

**Verification**:
```bash
npm run test:frameworks
```

**Checks**:
- [ ] React builds successfully
- [ ] Vue builds successfully
- [ ] Svelte builds successfully
- [ ] Solid builds successfully
- [ ] Angular builds successfully
- [ ] All HMR tests pass

**If failed**:
- ❌ Block release
- Fix framework integration
- Or, mark as broken in docs

---

### 8. Documentation Accuracy

**Verification**:
```bash
npm run audit:docs
```

**Checks**:
- [ ] All code examples work
- [ ] API docs match implementation
- [ ] Migration guides are accurate
- [ ] No broken links

**If failed**:
- ⚠️ Warning (not blocking)
- Update docs before release
- Or, mark as known issue

---

### 9. Security Audit

**Verification**:
```bash
npm audit --production
npm run audit:security
```

**Checks**:
- [ ] No high/critical vulnerabilities
- [ ] Dependencies are up-to-date
- [ ] No known CVEs
- [ ] License compliance

**If failed**:
- ❌ Block release (if high/critical)
- Update dependencies
- Or, document known issues

---

### 10. Breaking Change Detection

**Verification**:
```bash
npm run audit:breaking-changes
```

**Checks**:
- [ ] CHANGELOG.md lists all breaking changes
- [ ] Migration guide exists (if needed)
- [ ] Deprecation warnings added
- [ ] Version bump is correct

**If failed**:
- ❌ Block release
- Update CHANGELOG.md
- Add migration guide
- Correct version number

---

## 🔄 Audit Frequency

### Every Minor Release (`v1.x.0`)
- ✅ Full audit required
- All 10 checklist items

### Every Patch Release (`v1.x.y`)
- ⚠️ Partial audit
- Items 3, 6, 7, 9 only

### Every Major Release (`v2.0.0`)
- ✅ Full audit + migration testing
- All 10 items + user migration tests

---

## 📊 Audit Report Template

```markdown
# Urja v1.x.0 Stability Audit Report

**Date**: YYYY-MM-DD
**Auditor**: [Name]
**Release Version**: v1.x.0

## Checklist Results

- [x] Core APIs Unchanged
- [x] Plugin Contract Unchanged
- [x] Snapshot Tests Authoritative
- [x] Inspector Schema Stable
- [ ] No "Temporary" Hacks in Core (2 warnings)
- [x] Performance Benchmarks
- [x] Framework Compatibility Maintained
- [x] Documentation Accuracy
- [x] Security Audit
- [x] Breaking Change Detection

## Warnings

1. **Temporary Hacks**: 2 `// TODO` comments in `src/core/cache.ts`
   - Tracked in issue #123
   - Plan to fix in v1.x+1.0

## Blockers

None.

## Recommendation

✅ **APPROVED FOR RELEASE**

**Signature**: [Auditor Name]
**Date**: YYYY-MM-DD
```

---

## 🚨 Blocking vs Warning

### Blocking Issues (Release MUST be delayed)
- ❌ Core API changes
- ❌ Plugin contract changes
- ❌ Snapshot test failures
- ❌ Performance regressions > 5%
- ❌ Framework compatibility broken
- ❌ High/critical security vulnerabilities
- ❌ Undocumented breaking changes

### Warning Issues (Release can proceed)
- ⚠️ Code quality issues (TODOs, FIXMEs)
- ⚠️ Documentation inaccuracies
- ⚠️ Low/medium security vulnerabilities
- ⚠️ Minor performance regressions < 5%

---

## 🎯 Exit Condition (H2.6)

> "You trust releases without rereading the core code."

**Verification**:
1. Audit checklist is comprehensive → ✅
2. All critical paths are covered → ✅
3. Automated checks exist → ✅
4. Manual review is minimal → ✅

---

## 🛠️ Automation Scripts

### `npm run audit:api-surface`
```bash
# Compare public API surface with previous version
node scripts/audit-api-surface.js
```

### `npm run audit:plugin-contract`
```bash
# Verify plugin interface unchanged
node scripts/audit-plugin-contract.js
```

### `npm run audit:inspector-schema`
```bash
# Verify inspector JSON schema
node scripts/audit-inspector-schema.js
```

### `npm run audit:code-quality`
```bash
# Check for TODOs, FIXMEs, @ts-ignore
node scripts/audit-code-quality.js
```

### `npm run audit:breaking-changes`
```bash
# Detect breaking changes
node scripts/audit-breaking-changes.js
```

---

## 📅 Audit Schedule

| Release | Date | Auditor | Status |
|---------|------|---------|--------|
| v1.0.0 | 2025-01-15 | TBD | Pending |
| v1.1.0 | 2025-02-15 | TBD | Pending |
| v1.2.0 | 2025-03-15 | TBD | Pending |

---

**This audit is mandatory. No exceptions.**

**Signed**: Urja Core Team  
**Effective**: Phase H2.6 Complete
