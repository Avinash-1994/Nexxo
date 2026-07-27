# Lunx Governance Model — Operational Truth

**Status**: 🔒 Active (Phase H2.3)  
**Version**: 1.0.0  
**Purpose**: Maintenance Liability Control  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This is **NOT categorization** — this is **maintenance liability control**.

Every plugin has a category that determines:
- Who maintains it
- What guarantees it has
- How it's tested
- Whether it can break

---

## 📊 Plugin Classification System

### 1. **Official Plugins**

**Definition**: Maintained by core team, guaranteed stable.

**Criteria**:
- ✅ Maintained by core team
- ✅ Snapshot-tested in CI
- ✅ Compatibility guaranteed across v1.x
- ✅ Breaking changes require major version
- ✅ Documented in official docs
- ✅ Performance benchmarked

**Examples**:
- `lunx:js-transform` (Universal transformer)
- `lunx:assets` (Hashed asset pipeline)
- `lunx:postcss` (CSS processing)
- `lunx:federation` (Module federation)

**Guarantees**:
- No breaking changes in minor versions
- Security patches within 48 hours
- Performance regressions are blockers
- Snapshot tests must pass

**Workload Impact**: **HIGH** — Core team is on the hook.

---

### 2. **Community Plugins**

**Definition**: Third-party maintained, no guarantees.

**Criteria**:
- ⚠️ Maintained by community
- ⚠️ No snapshot protection
- ⚠️ No compatibility guarantees
- ⚠️ May break between versions
- ⚠️ Not in official docs (linked only)

**Examples**:
- `lunx-plugin-graphql` (Community)
- `lunx-plugin-wasm` (Community)
- `lunx-plugin-mdx` (Community)

**Guarantees**:
- **NONE**
- Core team may help, but no obligation
- Breaking changes are the author's responsibility
- No CI integration

**Workload Impact**: **ZERO** — Community owns it.

---

### 3. **Experimental Plugins**

**Definition**: Unstable, may be removed, requires opt-in.

**Criteria**:
- 🧪 Unstable API
- 🧪 May be removed without notice
- 🧪 Must explicitly opt-in
- 🧪 Never enabled by default
- 🧪 Not recommended for production

**Examples**:
- `lunx:ai-optimizer` (Experimental)
- `lunx:edge-runtime` (Experimental)
- `lunx:ssr-streaming` (Experimental)

**Guarantees**:
- **NONE**
- Can break at any time
- No migration path promised
- Feedback welcome, but no SLA

**Workload Impact**: **MEDIUM** — Core team experiments, but no promises.

---

## 📋 Plugin Registry (Internal Truth)

| Plugin Name | Category | Owner | Risk Level | Snapshot Tested | Docs |
|-------------|----------|-------|------------|-----------------|------|
| `lunx:js-transform` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:assets` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:postcss` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:federation` | Official | Core Team | Medium | ✅ | ✅ |
| `lunx:react-preset` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:vue-preset` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:svelte-preset` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:solid-preset` | Official | Core Team | Low | ✅ | ✅ |
| `lunx:angular-preset` | Official | Core Team | Medium | ✅ | ✅ |
| `lunx:ai-optimizer` | Experimental | Core Team | High | ❌ | ⚠️ |
| `lunx:edge-runtime` | Experimental | Core Team | High | ❌ | ⚠️ |
| `lunx-plugin-graphql` | Community | @community | Unknown | ❌ | ❌ |
| `lunx-plugin-wasm` | Community | @community | Unknown | ❌ | ❌ |

---

## 🔄 Promotion Process

### Community → Official

**Requirements**:
1. ✅ Proven usage (500+ downloads/month)
2. ✅ Passes all snapshot tests
3. ✅ Deterministic and pure
4. ✅ Documented thoroughly
5. ✅ Core team capacity available
6. ✅ Strategic value to ecosystem

**Process**:
1. Community author proposes promotion
2. Core team reviews code quality
3. Integration tests added
4. Snapshot tests added
5. Documentation written
6. Announcement in changelog

**Timeline**: 2-4 weeks minimum

---

### Experimental → Official

**Requirements**:
1. ✅ API stabilized
2. ✅ No major bugs for 2 releases
3. ✅ Positive user feedback
4. ✅ Performance acceptable
5. ✅ Core team commits to maintenance

**Process**:
1. Remove `@experimental` tag
2. Add to official docs
3. Enable by default (if applicable)
4. Announce in changelog

**Timeline**: 4-8 weeks minimum

---

### Official → Deprecated

**Requirements**:
1. ⚠️ Better alternative exists
2. ⚠️ Maintenance burden too high
3. ⚠️ Security issues unfixable

**Process**:
1. Mark as `@deprecated` in code
2. Log warnings in builds
3. Document migration path
4. Support for 2 minor versions
5. Remove in next major version

**Timeline**: 6+ months minimum

---

## 🚨 Risk Levels

### Low Risk
- Well-tested
- Stable API
- No known issues
- High usage

### Medium Risk
- Some edge cases
- API may evolve
- Moderate usage
- Known limitations

### High Risk
- Experimental
- Unstable API
- Low usage
- May be removed

---

## 🛡️ Maintenance Workload Control

### Goal
**Core team workload must be predictable.**

### Rules

1. **No "Implicit Official" Plugins**
   - If it's in `src/plugins/`, it's official
   - If it's in `examples/`, it's community
   - No gray area

2. **Official Plugins Are Capped**
   - Maximum 15 official plugins
   - Each new plugin requires deprecating one
   - Or, requires hiring more maintainers

3. **Community Plugins Are Unlimited**
   - No approval needed
   - No CI integration
   - No support obligation

4. **Experimental Plugins Are Time-Boxed**
   - Maximum 6 months in experimental
   - Then: promote, demote, or remove

---

## 📊 Workload Metrics

### Current Official Plugins: **9**
### Current Experimental Plugins: **2**
### Current Community Plugins: **~5** (estimated)

### Core Team Capacity: **3 engineers**
### Plugins Per Engineer: **3-4** (sustainable)

**Status**: ✅ Within capacity

---

## 🎯 Exit Condition (H2.3)

> "Core team workload is predictable. No 'implicit official' plugins exist."

**Verification**:
1. Every plugin has a category → ✅
2. Every official plugin is snapshot-tested → ✅
3. Community plugins have no CI → ✅
4. Experimental plugins have sunset dates → ✅

---

## 🧠 Governance Rule

**"If a plugin is in `src/`, it's official. If it's official, it's maintained. If it's maintained, it's tested."**

No exceptions.

---

**Signed**: Lunx Core Team  
**Effective**: Phase H2.3 Complete
