# Adapter Production Checklist

**Purpose**: Ensure every adapter is production-grade.  
**Deliverable**: `ADAPTER_PRODUCTION_CHECKLIST.md`  
**Status**: ✅ LOCKED

---

## 🚀 Readiness Checklist

### 1. Builds
- [ ] **Cold Start**: Effectively builds from an empty output directory.
- [ ] **Incremental**: Subsequent builds use caching (internal to framework or via Urja) correctly.
- [ ] **Determinism**: 
    - Verified that 5 consecutive builds of the same source produce identical output files (hashes/content).
    - Verified across at least 2 different environments (e.g., Local Dev vs. CI).

### 2. Output
- [ ] **Minification**: JS and CSS are minified in `prod` mode.
- [ ] **Source Maps**:
    - `dev`: Inline or external high-fidelity maps.
    - `prod`: External maps or hidden (configurable), never inline.
- [ ] **Manifest**: Generates a strictly typed asset manifest for Urja to consume.

### 3. CI / Automation
- [ ] **CI Job Provided**: Contains a basic GitHub Actions workflow example or usage instructions.
- [ ] **Error Codes**: Returns correct exit codes (0 for success, 1+ for failure) to fail CI pipelines correctly.

### 4. Developer Experience
- [ ] **Clear Error Messages**: Framework errors are formatted and surfaced clearly (no swallowed stacks).
- [ ] **Progress Reporting**: (Optional) Reports build progress to Urja's logger.

---

## 🛡️ Verification Proof

Before marking an adapter as "Stable":
1. Run `tests/app-hello` in `prod` mode → **Pass**
2. Run `tests/app-styles` in `prod` mode → **Pass**
3. Run `tests/app-split` in `prod` mode → **Pass**
4. Verify bit-for-bit identity on re-runs.
