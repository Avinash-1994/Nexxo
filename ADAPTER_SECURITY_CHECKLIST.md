# Adapter Security Checklist

**Purpose**: Bound the attack surface of framework adapters.  
**Deliverable**: `ADAPTER_SECURITY_CHECKLIST.md`  
**Status**: ✅ LOCKED

---

## 🔐 Security Constraints

### 1. File System Access
- [ ] **Constrained Root**: Adapter MUST NOT read/write outside the project root (except for explicitly allowed `node_modules`).
- [ ] **No Path Traversal**: Inputs (file paths, config options) must be sanitized to prevent `user/../../etc/passwd` attacks.
- [ ] **Output Isolation**: Adapter MUST write ONLY to the designated output directory provided by Urja.

### 2. Execution Safety
- [ ] **No `eval()`**: Adapter code and generated code should avoid `eval` or `new Function` with untrusted input.
- [ ] **No Privilege Escalation**: Adapter runs with the same privileges as the Urja process; it should not attempt to `sudo` or spawn privileged child processes unexpectedly.
- [ ] **Dependency Pinning**: The adapter itself should have pinned dependencies to avoid supply-chain drift.

### 3. Environment Variables
- [ ] **Allowlist Strategy**: Adapters should ONLY expose environment variables explicitly defined in the Urja configuration (e.g., `URJA_PUBLIC_*`).
- [ ] **No Leakage**: Internal system env vars (keys, secrets not meant for frontend) MUST NOT be embedded in the build output.

---

## 🛡️ Audit Requirements

Before initial release of an adapter:
1. **Manual Code Review**: Check for dynamic `require`/`import` based on user input.
2. **Dependency Audit**: Run `npm audit` on the adapter package.
3. **Escaping**: Verify that user-provided config strings are correctly escaped if injected into code.
