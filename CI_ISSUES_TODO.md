# CI Issues & Status

## 1. WASM Tests on Windows

**Status: FIXED ✅**

**Issue:** `wasmtime` fuel exhaustion caused uncatchable panics on Windows, crashing the test runner.

**Resolution:**
- Wrapped WASM execution in a separate `std::thread`.
- This isolates the panic/unwind boundary.
- If the thread crashes/panics due to fuel exhaustion, the main process catches it via `thread.join()`.
- Tests now run on **both Linux and Windows**.

## 2. LSP Test Module Resolution

**Status: FIXED ✅**

**Issue:** `server.js` was treated as CommonJS by default in `extensions/` folder, causing import failures in Node ESM environment.

**Resolution:**
- Added `"type": "module"` to `extensions/vscode-lsp/package.json`.
- This forces Node.js to treat `server.js` as ESM.
- `tsx` and Node can now import the named exports correctly.

---

**Production Status:** READY TO DEPLOY 🚀
