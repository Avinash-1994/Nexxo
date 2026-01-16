# Testing Nexxo

Nexxo employs a comprehensive testing strategy to ensure reliability, security, and determinism.

## Test Suites

### 1. Unit Tests
Located in `src/**/*.test.ts` and `tests/unit/`.
Run with:
```bash
npx tsx src/test/runner.ts
```

### 2. End-to-End (E2E) Tests
Located in `tests/e2e/`. These tests launch the Dev Server and control a headless browser (Puppeteer).
Run with:
```bash
npx tsx src/test/runner.ts tests/e2e/smoke.test.ts
npx tsx src/test/runner.ts tests/e2e/security.test.ts
```

### 3. Determinism Suite (Day 40)
Located in `src/test/determinism.ts`.
Verifies that the build process produces bit-for-bit identical output for identical inputs given a specific configuration using the internal fingerprinting engine.
Run with:
```bash
npx tsx src/test/determinism.ts
```

### 4. Security & Anomaly Detection (Day 41)
Verifies the `AnomalyDetector` and Dev Server security shield (XSS protection, Dashboard).
Run with:
```bash
npx tsx src/test/runner.ts tests/e2e/security.test.ts
```

## Regression Gate
To run the full regression suite used in CI:
```bash
npm run test:regression
```
(See `package.json` for details)
