# 🚨 Lunx Real Project Matrix - Issues Log

This file tracks all technical issues, environment mismatches, and build failures encountered during the 8-project verification matrix.

---

## 📅 Jan 21, 2026 - Initial Setup Phase

### 1. Repository URL Inconsistencies
*   **Issue**: Several project URLs provided were either incorrect or have changed ownership.
*   **Impact**: Cloning failed for `svelte-motion` and `vueuse`.
*   **Resolution**: 
    *   Updated `svelte-motion` to `https://github.com/micha-lmxt/svelte-motion`.
    *   Updated `vueuse` to `https://github.com/vueuse/vueuse`.
*   **Status**: ✅ Resolved

### 2. Monorepo Subdirectory Detection
*   **Issue**: High-profile projects like TanStack Table and SvelteKit are monorepos. Standard `lunx build` at the root fails because the `package.json` for the specific package is in a subfolder.
*   **Impact**: Build system cannot find entry points.
*   **Resolution**: Added `targetDir` support to the `Project` interface in `runner.ts` to explicitly point to `packages/*` folders.
*   **Status**: ✅ Resolved

### 3. Package Manager Protocol Mismatch (`catalog:`)
*   **Issue**: `VueUse` uses `pnpm` with the `catalog:` protocol in its `package.json`. Standard `npm install` throws `EUNSUPPORTEDPROTOCOL`.
*   **Impact**: Dependency installation failed for `VueUse`.
*   **Resolution**: Need to detect the lockfile and use the appropriate package manager (pnpm/yarn/npm).
*   **Status**: ⏳ Pending (Implementation of package manager detector)

### 4. Git Clone Depth limits
*   **Issue**: Large repos like `lit/lit` or `vuejs/vueuse` take significant time to clone.
*   **Impact**: Slow setup phase.
*   **Resolution**: Using `--depth 1` to only pull the latest commit.
*   **Status**: ✅ Optimized

---

## 📈 Summary of Success so far
*   **Cloned**: 8/8 Projects
*   **Dependency Success**: 5/8 (Approx)
*   **Config Generation**: 8/8
*   **Tests Run**: 0/80
