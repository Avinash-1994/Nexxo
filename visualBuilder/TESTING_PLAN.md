# Urja Visual Builder - Testing Plan

## 🎯 Objective
Test all Urja modules and facilities within the Visual Builder to ensure everything works correctly.

---

## 📋 Testing Checklist

### Phase 1: Basic Setup ✅
- [x] Urja installed in Visual Builder
- [x] urja.config.js created
- [x] index.html copied to public/
- [ ] Dev server starts successfully
- [ ] Page loads in browser
- [ ] No console errors

### Phase 2: Core Build Features
- [ ] **Dev Server**
  - [ ] Server starts on correct port
  - [ ] Serves index.html
  - [ ] Serves JavaScript files
  - [ ] Serves CSS files
  - [ ] Serves static assets

- [ ] **Hot Module Replacement (HMR)**
  - [ ] Edit a React component
  - [ ] Changes reflect without full reload
  - [ ] HMR WebSocket connects
  - [ ] CSS changes update instantly

- [ ] **React Fast Refresh**
  - [ ] Component state preserved on edit
  - [ ] Fast Refresh works for functional components
  - [ ] Fast Refresh works for class components
  - [ ] Error overlay shows on syntax errors

### Phase 3: Transpilation & Bundling
- [ ] **TypeScript/JSX**
  - [ ] .jsx files transpile correctly
  - [ ] .tsx files transpile correctly
  - [ ] Import statements work
  - [ ] ES6+ syntax works

- [ ] **CSS Processing**
  - [ ] Tailwind CSS compiles
  - [ ] PostCSS processes correctly
  - [ ] CSS imports work
  - [ ] CSS modules work (if used)

- [ ] **Asset Handling**
  - [ ] Images load correctly
  - [ ] Fonts load correctly
  - [ ] SVGs work
  - [ ] Other static files serve

### Phase 4: Advanced Features
- [ ] **Rust Native Worker**
  - [ ] Native worker loads
  - [ ] Fast transformations work
  - [ ] No performance issues
  - [ ] Caching works

- [ ] **Plugin System**
  - [ ] React Refresh plugin works
  - [ ] Tailwind plugin works
  - [ ] Custom plugins can be added

- [ ] **Parallel Execution**
  - [ ] Multiple files process in parallel
  - [ ] No race conditions
  - [ ] Performance improvement visible

### Phase 5: Production Build
- [ ] **Build Command**
  - [ ] `npm run build` succeeds
  - [ ] Output in dist/ directory
  - [ ] Files are minified
  - [ ] Source maps generated (if enabled)
  - [ ] Assets copied correctly

- [ ] **Build Optimization**
  - [ ] Tree shaking works
  - [ ] Code splitting works
  - [ ] Bundle size reasonable
  - [ ] No unused code

### Phase 6: Visual Builder Specific
- [ ] **Monaco Editor**
  - [ ] Loads correctly
  - [ ] Syntax highlighting works
  - [ ] Code editing works
  - [ ] No performance issues

- [ ] **React Flow**
  - [ ] Canvas renders
  - [ ] Nodes draggable
  - [ ] Connections work
  - [ ] No lag

- [ ] **Routing**
  - [ ] React Router works
  - [ ] Navigation works
  - [ ] Routes load correctly
  - [ ] No 404 errors

- [ ] **State Management (Zustand)**
  - [ ] Store works
  - [ ] State updates
  - [ ] Persistence works
  - [ ] No state loss on HMR

### Phase 7: Error Handling
- [ ] **Build Errors**
  - [ ] Syntax errors show in overlay
  - [ ] Stack traces are clear
  - [ ] Error messages helpful
  - [ ] Recovery after fix works

- [ ] **Runtime Errors**
  - [ ] Errors caught and displayed
  - [ ] Error boundary works
  - [ ] Console shows errors
  - [ ] No crashes

### Phase 8: Performance
- [ ] **Dev Server Performance**
  - [ ] Initial load < 3s
  - [ ] HMR update < 100ms
  - [ ] No memory leaks
  - [ ] CPU usage reasonable

- [ ] **Build Performance**
  - [ ] Full build < 10s
  - [ ] Incremental build < 2s
  - [ ] Parallel processing works
  - [ ] Caching effective

---

## 🐛 Known Issues to Fix

### Critical
1. Dev server not serving JSX files correctly
2. Page loads blank in browser
3. No JavaScript execution

### Medium
1. Config file not being loaded (using default port 3000 instead of 5173)
2. Need to verify all plugins work

### Low
1. Remove old vite.config.js
2. Clean up unused dependencies

---

## 🔧 Fixes Needed

### Immediate
1. **Fix JSX serving issue**
   - Check if esbuild is transforming correctly
   - Verify Babel is working for React
   - Check error logs

2. **Fix config loading**
   - Ensure urja.config.js is being read
   - Verify port configuration works

3. **Test basic functionality**
   - Get index.html loading
   - Get main.jsx executing
   - Get React rendering

### Next Steps
1. Test HMR thoroughly
2. Test all Visual Builder features
3. Optimize performance
4. Document any issues

---

## 📊 Test Results

### Test Run 1 (Current)
- **Date**: 2025-12-06
- **Status**: ❌ Failed
- **Issues**:
  - Dev server starts but doesn't serve JSX files
  - Page loads blank
  - No JavaScript execution
  - Possible transpilation issue

### Actions Taken
1. Copied index.html to public/
2. Started dev server
3. Attempted to load page
4. Identified JSX serving issue

### Next Actions
1. Debug why JSX files aren't being served
2. Check dev server logs for errors
3. Test with simple HTML/JS first
4. Gradually add complexity

---

## 🎯 Success Criteria

For Visual Builder to be fully working with Urja:
- ✅ Dev server starts without errors
- ✅ Page loads and renders
- ✅ React components work
- ✅ HMR works for all file types
- ✅ Tailwind CSS compiles
- ✅ Monaco Editor loads
- ✅ React Flow works
- ✅ All routes accessible
- ✅ Production build succeeds
- ✅ No performance degradation vs Vite

---

## 📝 Notes

- Visual Builder is a complex React app with many dependencies
- Uses Monaco Editor (heavy)
- Uses React Flow (canvas-based)
- Uses Tailwind CSS
- Has service worker
- Has IndexedDB
- Performance is critical

---

<div align="center">

**Testing in Progress...**

</div>
