# URJA — MASTER PROMPT (FINAL, LOCKED)

## Context
Urja processes large dependency graphs (modules, CSS, micro-frontends).
Empirical benchmarks show that recursive JavaScript graph traversal fails at ~10k nodes due to call-stack limits. Iterative Rust traversal completes deterministically at much larger scales.

## 🔒 Locked Decisions
1.  **Rust is the default engine** for all graph operations.
2.  All graph algorithms must be **iterative**.
3.  **Recursive graph traversal in JS is forbidden**.
4.  Rust scope is strictly limited to **graph execution**.
5.  Performance optimizations must **never** compromise correctness.

## ⚠️ Known Trade-offs (Accepted)
-   Native module distribution complexity
-   Higher core maintenance cost
-   Slower iteration for graph logic
-   Reduced contributor pool for core changes

*These are intentional and documented.*

## 🔧 Mitigations (Mandatory)
-   Prebuilt native binaries for supported platforms
-   Explicit JS fallback with warnings and limits
-   Batch-only Rust APIs (`add_batch`)
-   Frozen Rust API surface
-   CI benchmarks preventing regression
-   Clear contribution boundaries

## 🚫 Forbidden Actions
-   Reintroducing recursive traversal
-   Silent fallback to unsafe JS
-   Expanding Rust into framework or business logic
-   Removing stability benchmarks
-   Marketing claims of “infinite scalability”

## 📐 Correct Wording
Urja does not claim infinite scalability.

**Correct phrasing**:
> “Urja removes stack-based failure modes and scales until system memory limits.”

## 🧾 Benchmark Policy
Benchmarks demonstrating JS failure vs Rust stability:
-   Must be preserved
-   Are architectural validation, not marketing

## 🧠 Guiding Principle
**Stability and correctness are mandatory; performance is secondary.**

## Status
-   **Phase 1**: CLOSED
-   **Graph architecture**: LOCKED

*Future work must respect this prompt.*
