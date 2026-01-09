# Engine Warning & Native Build Analysis

**Date**: January 7, 2026  
**Status**: Information & Recommendations

---

## Issue 1: npm EBADENGINE Warning

### The Warning
```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: '@peculiar/x509@1.14.2',
npm warn EBADENGINE   required: { node: '>=22.0.0' },
npm warn EBADENGINE   current: { node: 'v20.19.5', npm: '10.8.2' }
}
```

### Root Cause Analysis

The dependency chain is:
```
nexxo@1.0.0-freeze
└─ selfsigned@5.2.0
   └─ @peculiar/x509@1.14.2 (requires Node >=22.0.0)
```

**Where is `selfsigned` used?**
```typescript
// src/dev/devServer.ts
const selfsigned = await import('selfsigned');
const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 30 });
```

`selfsigned` is used to **generate self-signed SSL certificates for HTTPS dev server**.

### Why This Happens

- **@peculiar/x509 v1.14.2**: Recently updated with Node 22+ requirement
- **selfsigned v5.2.0**: Automatically upgraded @peculiar/x509 as dependency
- **Your environment**: Node v20.19.5 (doesn't meet the requirement)

### Impact Assessment

**Severity**: 🟡 **LOW** - Warning only, not an error
- ✅ The code still works on Node 20
- ✅ npm installs the package anyway
- ⚠️  Package is maintained and expects Node 22+

### Solutions

**Option 1: Upgrade Node.js (Recommended)**
```bash
# Install Node 22 LTS
nvm install 22
nvm use 22
npm install
```
**Pros**: Future-proof, recommended by maintainers  
**Cons**: Environment change

**Option 2: Use Older selfsigned (Not Recommended)**
```bash
npm install selfsigned@5.1.0 --save
# selfsigned 5.1.0 uses @peculiar/x509 that supports Node 20
```
**Pros**: No environment change  
**Cons**: Outdated package, security risks

**Option 3: Ignore the Warning (Current State)**
```bash
# Just suppress the warning in CI/CD
npm install --legacy-peer-deps
```
**Pros**: No changes  
**Cons**: Not future-proof

### Recommendation

🟢 **Upgrade to Node.js 22 LTS** when ready. For now, it's safe to ignore this warning.

---

## Issue 2: Native Build Artifacts

### Directory Structure

```
/src/native/
├── Cargo.toml                  (Rust project config)
├── Cargo.lock                  (Rust dependencies lock)
├── src/                        (Rust source code)
├── target/                     (Build artifacts - 324MB)
├── nexxo_native.linux-x64-gnu.node     (3.4MB - current)
├── nexxo_native.linux-x64-gnu.node      (3.4MB - old name)
└── nextgen_native.linux-x64-gnu.node   (1.1MB - experimental)
```

### Breakdown of Build Artifacts

**Size Analysis:**
```
src/native/target/                     324MB    (Rust build intermediates)
├── release/deps/                      (compiled dependencies - .rlib, .rmeta files)
├── release/build/                     (build scripts output)
└── release/incremental/               (incremental compilation cache)

Native Binaries:
├── nexxo_native.linux-x64-gnu.node    3.4MB    (Current, active)
├── nexxo_native.linux-x64-gnu.node     3.4MB    (Old name - can delete)
└── nextgen_native.linux-x64-gnu.node  1.1MB    (Experimental version)
```

### What These Files Are

**`.node` files**:
- Native Node.js addons (compiled Rust code)
- Used for performance-critical operations
- Platform-specific (linux-x64-gnu = Linux x64 GNU libc)

**`src/native/target/release/deps/`**:
- Contains 100+ compiled Rust crates
- Mix of `*.rlib` (library format) and `*.rmeta` (metadata)
- Used during linking to create the final `.node` binary

### Which Files Are Safe to Delete?

| File | Status | Safe to Delete? | Size |
|------|--------|-----------------|------|
| `src/native/target/` | Build cache | ✅ YES | 324MB |
| `nexxo_native.linux-x64-gnu.node` | Old naming | ✅ YES | 3.4MB |
| `nextgen_native.linux-x64-gnu.node` | Experimental | ✅ YES* | 1.1MB |
| `nexxo_native.linux-x64-gnu.node` | Current | ❌ NO | 3.4MB |

**Total cleanup potential: ~328MB** (324MB + 3.4MB + 1.1MB)

### Safe Cleanup Instructions

```bash
# Clean build artifacts (safe - will rebuild on next npm run build:native)
rm -rf /home/avinash/Desktop/framework_practis/build/src/native/target/

# Remove old naming convention file
rm /home/avinash/Desktop/framework_practis/build/src/native/nexxo_native.linux-x64-gnu.node

# Remove experimental version (if not needed)
rm /home/avinash/Desktop/framework_practis/build/src/native/nextgen_native.linux-x64-gnu.node

# Total: 328MB+ freed
```

**After cleanup**, files will be regenerated on next build:
```bash
npm run build:native
```

### Git Recommendations

These files should be in `.gitignore`:
```gitignore
# Rust build artifacts
src/native/target/

# Native binaries (rebuild on each platform)
src/native/*.node
src/native/native.d.ts

# Backup/old versions
src/native/nexxo_native.*.node
src/native/nextgen_native.*.node
```

---

## Summary & Action Items

### Issue 1: Node Engine Warning
```
Status:  🟡 Non-critical warning
Action:  Upgrade Node.js to v22 LTS when convenient
Impact:  None currently, safety improvement for future
```

### Issue 2: Native Build Artifacts
```
Status:  ✅ All working correctly
Cleanup: 328MB+ can be safely removed
Action:  Run cleanup + add to .gitignore
Impact:  Faster git operations, smaller repo
```

### Recommended Next Steps

1. **Keep working as-is** (warning is harmless)
2. **Plan Node 22 upgrade** when next major release cycles
3. **Clean up native artifacts** (optional but recommended):
   ```bash
   rm -rf src/native/target/
   rm src/native/nexxo_native*.node
   rm src/native/nextgen_native*.node
   ```
4. **Update .gitignore** to prevent future accumulation

---

## Reference Information

**Current Setup**:
- Node.js: v20.19.5
- npm: 10.8.2
- Rust: Compiled successfully ✅
- Native bindings: 3.4MB (active)
- Build artifacts cache: 324MB (can delete)

**Package**: @peculiar/x509
- **Version**: 1.14.2
- **Used by**: selfsigned (for HTTPS dev certificates)
- **Node requirement**: >=22.0.0
- **Your Node**: 20.19.5 ✅ Still works

