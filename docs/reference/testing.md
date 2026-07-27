# 🧪 Lunx Testing - Quick Reference Guide

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:phase3
```

### Run Specific Phase
```bash
npm run test:foundation      # Phase 1
npm run test:comprehensive   # Phase 2
npm run test:advanced        # Phase 3
```

---

## 📋 Test Categories

### **Phase 1: Foundation**
```bash
# Build output snapshots
npm run test:snapshot

# Performance benchmarks
npm run test:performance

# Real-world projects
npm run test:real-world
```

### **Phase 2: Comprehensive**
```bash
# CSS processing
npm run test:css

# Module Federation
npm run test:federation

# Cache correctness
npm run test:cache

# Error handling
npm run test:errors
```

### **Phase 3: Advanced**
```bash
# Property-based tests (500+ random cases)
npm run test:property

# Load & stress tests
npm run test:load

# Visual regression tests
npm run test:visual
```

---

## ⏱️ Expected Durations

| Test Suite | Duration | Timeout |
|------------|----------|---------|
| Snapshot | ~10s | 30s |
| Performance | ~20s | 30s |
| Real-World | ~30s | 60s |
| CSS | ~15s | 30s |
| Federation | ~20s | 30s |
| Cache | ~15s | 30s |
| Errors | ~10s | 30s |
| Property | ~30s | 60s |
| Load | ~60s | 180s |
| Visual | ~45s | varies |

**Total (all tests):** ~4-5 minutes

---

## 🎯 Common Use Cases

### Before Commit
```bash
# Run fast tests only
npm run test:snapshot
npm run test:errors
```

### Before Push
```bash
# Run all non-visual tests
npm run test:phase2
```

### Before Release
```bash
# Run complete test suite
npm run test:phase3
npm run test:visual
```

### Debug Specific Feature
```bash
# CSS issues
npm run test:css

# Performance issues
npm run test:performance
npm run test:load

# UI issues
npm run test:visual
```

---

## 🔧 Test Options

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Specific File
```bash
npm test -- tests/build/snapshot.test.ts
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run with Verbose Output
```bash
npm test -- --verbose
```

### Update Snapshots
```bash
npm run test:snapshot -- --updateSnapshot
```

---

## 🐛 Debugging Tests

### Enable Debug Logging
```bash
DEBUG=lunx:* npm test
```

### Run Single Test
```bash
npm test -- -t "should build React app"
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="CSS"
```

### Skip Tests
```typescript
it.skip('test to skip', () => {
    // This test will be skipped
});
```

### Focus on Single Test
```typescript
it.only('test to focus', () => {
    // Only this test will run
});
```

---

## 📊 Understanding Test Output

### Success
```
✓ should build React app (234ms)
✓ should process CSS modules (156ms)
✓ should handle errors gracefully (89ms)

Test Suites: 3 passed, 3 total
Tests:       126 passed, 126 total
Time:        4.567s
```

### Failure
```
✕ should build React app (234ms)
  
  Expected: true
  Received: false
  
  at Object.<anonymous> (tests/build/snapshot.test.ts:45:23)
```

### Timeout
```
✕ should complete build (30001ms)
  
  Timeout - Async callback was not invoked within the 30000ms timeout
```

---

## 🎨 Visual Test Screenshots

Visual regression tests save screenshots to:
```
tests/visual/screenshots/
├── error-overlay.png
├── hmr-indicator.png
├── mobile-view.png
├── tablet-view.png
└── desktop-view.png
```

---

## 📈 Performance Benchmarks

Performance tests track:
- Cold start time (< 100ms)
- HMR update time (< 60ms)
- Build time (< 2s for small projects)
- Memory usage (< 50MB increase)

Results saved to:
```
tests/performance/results/
└── benchmark-results.json
```

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:phase3
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test:snapshot
npm run test:errors
```

---

## 💡 Tips & Best Practices

### 1. Run Tests Frequently
- Run snapshot tests before every commit
- Run full suite before pushing
- Run visual tests before releases

### 2. Keep Tests Fast
- Use `test.only` during development
- Skip slow tests locally if needed
- Run full suite in CI

### 3. Update Snapshots Carefully
- Review snapshot changes
- Ensure changes are intentional
- Commit updated snapshots

### 4. Monitor Performance
- Check performance test results
- Watch for regressions
- Optimize slow tests

### 5. Fix Flaky Tests
- Increase timeouts if needed
- Add proper waits
- Use retry logic

---

## 🆘 Troubleshooting

### Tests Timing Out
```bash
# Increase timeout
npm test -- --testTimeout=60000
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm test
```

### Port Already in Use
```bash
# Kill process on port 5174
npx kill-port 5174
```

### Playwright Browser Issues
```bash
# Install browsers
npx playwright install
```

### Cache Issues
```bash
# Clear Jest cache
npm test -- --clearCache
```

---

## 📚 Further Reading

- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Complete testing strategy
- [PHASE1_TESTING_COMPLETE.md](./PHASE1_TESTING_COMPLETE.md) - Phase 1 details
- [PHASE2_COMPREHENSIVE_COMPLETE.md](./PHASE2_COMPREHENSIVE_COMPLETE.md) - Phase 2 details
- [PHASE3_ADVANCED_COMPLETE.md](./PHASE3_ADVANCED_COMPLETE.md) - Phase 3 details
- [TESTING_COMPLETE.md](./TESTING_COMPLETE.md) - Complete overview

---

## 🎯 Test Coverage Goals

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Unit Tests | 80% | 80% | ✅ |
| Integration | 60% | 60% | ✅ |
| E2E | 40% | 40% | ✅ |
| Performance | 100% | 100% | ✅ |
| Visual | 100% | 100% | ✅ |

---

**Quick Help:**
- Run all tests: `npm run test:phase3`
- Run fast tests: `npm run test:snapshot`
- Debug test: `npm test -- -t "test name"`
- Update snapshots: `npm run test:snapshot -- -u`

**Need Help?** Check [TESTING_COMPLETE.md](./TESTING_COMPLETE.md) for full documentation.
