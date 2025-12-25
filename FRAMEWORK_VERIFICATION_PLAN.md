# 🧪 FRAMEWORK VERIFICATION PLAN

## Frameworks to Test

### 1. React ✅ (VERIFIED)
- [x] Dev Server
- [x] Production Build
- [x] SSR (Next.js)

### 2. Vue
- [ ] Dev Server
- [ ] Production Build
- [ ] SSR (Nuxt)

### 3. Svelte
- [ ] Dev Server
- [ ] Production Build

### 4. Angular
- [ ] Dev Server
- [ ] Production Build

### 5. Solid
- [ ] Dev Server
- [ ] Production Build

### 6. Preact
- [ ] Dev Server
- [ ] Production Build

### 7. Qwik
- [ ] Dev Server
- [ ] Production Build

### 8. Lit
- [ ] Dev Server
- [ ] Production Build

### 9. Astro
- [ ] Dev Server
- [ ] Production Build

## Test Commands
```bash
# For each framework in examples/:
cd examples/{framework}-test
npx tsx ../../src/cli.ts dev --port {PORT}
npx tsx ../../src/cli.ts build
```
