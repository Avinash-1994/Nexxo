# Adapter Test Template

**Purpose**: Standardize testing for all framework adapters.  
**Deliverable**: `ADAPTER_TEST_TEMPLATE.md`  
**Status**: ✅ LOCKED

---

## 🧪 Required Test Applications

Every adapter MUST include the following test scenarios in `frameworks/<name>-adapter/tests/`:

### 1. 🟢 Hello World (`tests/app-hello`)
- **Components**: A simple root component rendering text.
- **Purpose**: Verify basic compilation and mounting.
- **Assertion**: Output HTML/JS contains expectations.

### 2. 🎨 CSS + Assets (`tests/app-styles`)
- **Components**: Component importing a CSS file and an image asset.
- **Purpose**: Verify style extraction/injection and asset URL resolution.
- **Assertion**: 
    - CSS file is generated/injected.
    - Styles are applied.
    - Asset URL is valid and file exists in output.

### 3. 🧩 Code Splitting (`tests/app-split`)
- **Components**: Main component dynamically imports (`import()`) a secondary component.
- **Purpose**: Verify chunk generation and async loading.
- **Assertion**:
    - At least 2 JS chunks are generated.
    - Dynamic import resolves correctly at runtime.

### 4. 💥 Broken Config / Error Handling (`tests/app-broken`)
- **Components**: Valid code, but invalid adapter configuration OR syntax error in code.
- **Purpose**: Verify the adapter reports errors cleanly without crashing the Core.
- **Assertion**:
    - Build fails gracefully.
    - Error message is human-readable.
    - Process exit code is non-zero.

---

## 🔍 Required Assertions

For every test run (CI/Local):

### 1. Snapshot Verification
- Output file list (manifest) matches known good snapshot.
- Content of key files matches expectation.

### 2. Determinism Check
- Run `build:prod` twice.
- **Pass Condition**: `hash(run1_output) === hash(run2_output)`.

### 3. Explicit Failure Modes
- If a framework compiler fails, it must bubble up as a structured error, not a hung process or generic crash.
