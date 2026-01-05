# URJA — MASTER FIX PROMPT (LOCKED)

## Objective
Fix all known weaknesses of the Rust-first graph architecture without reversing the decision, ensuring stability, portability, debuggability, and long-term scalability.

*This plan defines what must be implemented, not discussed.*

## 1️⃣ Execution Engine Fix (Native → WASM → JS)
**Mandatory Execution Order**:
1.  **Native Rust** (default, fastest)
2.  **Rust WASM** (portable fallback)
3.  **JavaScript Iterative** (emergency fallback only)

**Rules**:
-   JS recursive traversal is **forbidden**.
-   JS fallback must be **iterative**.
-   All three engines must produce **identical results**.

## 2️⃣ JS Fallback FIX (No Crashes Allowed)
**Requirements**:
-   Rewrite JS graph traversal to use **explicit stack (Array)**.
-   **No recursion**.
-   **No call-stack dependency**.
-   JS fallback may be slower, but must **never crash**.

**Acceptance Criteria**:
-   50k-node graph must complete without stack overflow.

## 3️⃣ Native Module Distribution FIX
**Requirements**:
-   Ship prebuilt native binaries for Linux, macOS, Windows.
-   Ship Rust WASM build in the same package.
-   No user-side Rust compilation allowed.

**Runtime Behavior**:
> Try native → if fails → load WASM → if fails → load JS (warn) -> No silent fallback.

## 4️⃣ NAPI / Boundary FIX (Regression Prevention)
**Hard Rules**:
-   Rust must expose **batch-only APIs** (`add_batch`, `analyze`).
-   No per-node calls.
-   No chatty APIs.
-   No dynamic API expansion.

## 5️⃣ Debugging FIX
**Mandatory Feature**:
-   JS must be able to serialize inputs/ops to `snapshot.json`.
-   Rust must support `urja-native replay snapshot.json`.

**Rules**:
-   Rust code must be pure (no logging).
-   All debugging via input/output replay.

## 6️⃣ Contributor Experience FIX
**Rules**:
-   Rust core is **feature-frozen**.
-   Only bug fixes and performance fixes allowed.
-   JS is the primary contribution surface.

## 7️⃣ Wording & Credibility FIX
**Forbidden Language**: "Infinite scalability"
**Required Language**: "Scales until system memory limits, without stack-based failure modes."

## 8️⃣ CI & Safety FIX
**Mandatory CI Gates**:
-   10k-node graph must not crash (any engine).
-   Native engine must outperform JS fallback.
-   No recursive traversal allowed.

## 9️⃣ Future Scalability FIX
**Planned**:
-   Parallel graph traversal in Rust (Rayon).
-   JS/WASM remain single-threaded.

## 🚫 Forbidden Actions
-   Reintroducing recursion.
-   Silent fallback to JS.
-   Expanding Rust into framework logic.
-   Downgrading safety for DX.

## 🔒 Final Rule
**Any graph operation that can crash the process is invalid, regardless of speed.**
