# Performance Optimization Guide

## Bundle Size Optimization

### Current Configuration
- **Target Bundle Size:** <500KB (initial load)
- **Code Splitting:** Vendor + Feature chunks
- **Minification:** Terser with console removal
- **Tree Shaking:** Automatic via Vite

### Manual Chunks Strategy
```javascript
vendor-react: React core libraries
vendor-ui: UI components (Lucide icons)
vendor-utils: Utilities (Zustand, Markdown)
feature-pipeline: Pipeline Builder module
feature-docs: Documentation module
```

## Performance Monitoring

### Development Mode
Performance metrics are automatically logged:
- Web Vitals (LCP, FID, CLS, FCP, TTFB)
- Bundle sizes (JS, CSS)
- Load time metrics

### Production Mode
- Console logs removed automatically
- Source maps disabled
- Minified and optimized

## Lazy Loading

### Routes
All major routes are lazy-loaded:
- `/builder` - Pipeline Builder
- `/docs/*` - Documentation pages

### Components
Heavy components use React.lazy():
- PipelineBuilder
- DocsLayout
- DocsPage

## Best Practices

### 1. Component Optimization
- Use React.memo for expensive renders
- Implement useMemo/useCallback for complex computations
- Avoid inline functions in JSX

### 2. Image Optimization
- Use WebP format when possible
- Implement lazy loading for images
- Provide appropriate sizes/srcset

### 3. Code Splitting
- Dynamic imports for large dependencies
- Route-based code splitting
- Component-level code splitting for modals

### 4. Caching Strategy
- Service worker caching for static assets
- IndexedDB for offline data
- Browser caching via proper headers

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Bundle | <500KB | TBD |
| Time to Interactive | <3s | TBD |
| First Contentful Paint | <1.5s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |

## Monitoring Commands

```bash
# Build and analyze bundle
npm run build
npm run preview

# Check bundle size
npm run build -- --mode=analyze
```

## Future Optimizations

- [ ] Implement virtual scrolling for long lists
- [ ] Add request deduplication
- [ ] Optimize re-renders with React DevTools
- [ ] Consider Preact in production
- [ ] Implement progressive hydration
