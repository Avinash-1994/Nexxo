# Module 8.2 — Mithril.js Adapter Test Plan

**Status**: 🔓 **STARTED**  
**Gate**: 3 (Capability Mapping & Test Plan)  
**Parent**: Module 8 (Framework Adapter System)

---

## 🟢 Capability Mapping (Tier-1 Baseline)

| Capability | Mithril Expectation | Verification Method |
| :--- | :--- | :--- |
| **Build** | Dev + Prod builds succeed | Run `build()` in both modes, check exit code & output. |
| **HMR** | JS reload + Honest Full Reload | Update `view()` -> HMR (if safe) or Full Reload. |
| **CSS** | Global CSS imports | `import './style.css'` works and applies styles. |
| **Assets** | Image/font imports | `import img from './logo.png'` resolves to valid URL. |
| **Code Splitting** | `import()` works | `import('./lazy')` creates separate chunk & works with `m.mount` or routing. |

---

## 🧪 Required Test Applications

We will create the following test apps in `frameworks/mithril-adapter/tests/`:

### 1. `app-hello` (Basic Logic)
- **Content**: 
    - `index.ts`: Imports Mithril, mounts a simple component.
    - `index.html`: Contains mount point.
- **Goal**: Verify Mithril bundles correctly (hyperscript `m` usage).
- **Assertion**: Output JS contains bundled Mithril code (`m` calls).

### 2. `app-styles` (CSS & Assets)
- **Content**:
    - `style.css`: Simple global styles.
    - `logo.png`: Mock asset.
    - `index.ts`: Imports both, renders image with style class.
- **Goal**: Verify global CSS extraction and asset URL resolution.
- **Assertion**: CSS file generated (or inlined), Asset file generated, reference in JS is valid.

### 3. `app-split` (Lazy Loading)
- **Content**:
    - `lazy.ts`: Exports a component.
    - `index.ts`: `import('./lazy')` and mounts it asynchronously or calls it.
- **Goal**: Verify `import()` produces a separate chunk.
- **Assertion**: `>= 2` JS files in output.

### 4. `app-broken` (Error Handling)
- **Content**: Syntax error in `index.ts`.
- **Goal**: Verify clean failure.
- **Assertion**: Build fails with non-zero exit code and readable error.

---

## 🛑 Exit Gate (8.2 Test Plan)

- [ ] All mandatory behaviors covered
- [ ] Failure modes explicit
- [ ] No undefined behavior
