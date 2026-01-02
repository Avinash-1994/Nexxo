# Urja Framework Capability Matrix

**Module**: 11 (Phase H.3)  
**Status**: ✅ Active  
**Last Updated**: 2026-01-02

This document provides an honest assessment of what Urja supports for each Tier-1 framework.

## 📊 Capability Matrix

| Capability | Alpine.js | Lit | Mithril.js |
| :--- | :---: | :---: | :---: |
| **Dev Server** | ✅ | ✅ | ✅ |
| **HMR** | ✅ | ✅ | ✅ |
| **CSS Dependency Graph** | ✅ | ✅ | ✅ |
| **Static Assets** | ✅ | ✅ | ✅ |
| **Code Splitting** | ✅ | ✅ | ✅ |
| **Lazy Loading** | ✅ | ✅ | ✅ |
| **SSR Support** | ❌ | ❌ | ❌ |
| **Production Build Stability** | ✅ | ✅ | ✅ |

### Legend
- ✅ **Fully supported**: Verified by automated test suite in `frameworks/<adapter>/tests/`.
- ⚠️ **Partially supported**: Functional but with known constraints or manual configuration required.
- ❌ **Not supported**: Feature is either not implemented or explicitly forbidden by current architectural locks.

---

## 🛠️ Methodology & Disclaimers

### Measurement Method
Capabilities are verified using the Urja Integration Test Suite. A capability is marked as ✅ only if:
1. It passes the `scripts/verify.ts` check for that adapter.
2. It functions correctly across both `dev` and `prod` modes.
3. It respects the zero-core-coupling architectural lock.

### What is NOT Covered
- **3rd Party Plugins**: Support for framework-specific plugins (e.g., specialized PostCSS plugins) is not guaranteed unless they are part of the adapter's internal toolchain.
- **Legacy Browsers**: Verification is currently limited to modern evergreen browsers.
- **Meta-framework Features**: Features like file-system routing or hybrid data fetching are OUT OF SCOPE.

### Known Limitations
- **SSR**: Explicitly blocked by Module 8 architectural locks to prevent framework leakage into the core.
- **HMR State Preservation**: While HMR works, state preservation depends on the framework's internal capabilities (e.g., Alpine's `x-data` re-initialization).
