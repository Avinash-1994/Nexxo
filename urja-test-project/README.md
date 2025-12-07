# Urja Test Project ⚡

A comprehensive test suite for the Urja build tool, testing all modules and facilities.

## 🎯 Purpose

This project tests all Urja functionality:
- ✅ Dev server with HMR
- ✅ React Fast Refresh
- ✅ JSX/TSX transpilation
- ✅ CSS processing
- ✅ Rust native worker
- ✅ Parallel plugin execution
- ✅ Production builds
- ✅ Performance metrics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📋 Test Scenarios

### 1. Feature Tests
- Dev server functionality
- React Fast Refresh
- JSX transpilation
- CSS imports
- HMR WebSocket connection
- Rust native worker

### 2. HMR Tests
- State preservation on hot reload
- CSS hot updates
- Component updates without full reload
- Error recovery

### 3. Performance Tests
- Page load metrics
- Memory usage
- Transform speed
- Build performance

## 🧪 How to Test

1. **Start the dev server**: `npm run dev`
2. **Open** http://localhost:3000
3. **Navigate** through the tabs:
   - Feature Tests
   - HMR Test
   - Performance Test
4. **Follow** the instructions in each tab
5. **Verify** all tests pass

## ✅ Expected Results

All tests should show **SUCCESS** status:
- ✅ Dev server running
- ✅ React Fast Refresh working
- ✅ JSX transpiling correctly
- ✅ CSS loading
- ✅ HMR WebSocket connected
- ✅ Rust native worker active

## 📊 Performance Targets

- Dev Server Start: < 2s
- HMR Update: < 100ms
- Plugin Transform: ~0.24µs (Rust)
- Memory Usage: < 100MB

## 🔧 Configuration

See `urja.config.js` for the Urja configuration used in this test project.

## 📝 Test Results

Document your test results here:

### Test Run 1
- **Date**: 
- **Urja Version**: 0.1.1
- **Status**: 
- **Notes**: 

---

**Powered by Urja ⚡ v0.1.1**
