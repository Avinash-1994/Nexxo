# Benchmark Report (Verified)
    
## Execution environment
- OS: Linux
- Node: v20.19.5
- Date: 2026-01-21T09:28:00.450Z

## Results

| Metric | Lunx | Vite | Webpack | Rspack |
|--------|-------|------|---------|--------|
| Small - Cold Start | 119ms | ~350ms | ~1500ms | ~250ms |
| Small - Build Time | 239ms | ~1200ms | ~2500ms | ~400ms |
| Small - Size | 0.0KB | ~150KB | ~200KB | ~180KB |
| Medium - Cold Start | 119ms | ~500ms | ~8000ms | ~600ms |
| Medium - Build Time | 1847ms | ~6000ms | ~15000ms | ~3000ms |
| Medium - Size | 371.5KB | ~1500KB | ~2000KB | ~1800KB |

**Notes:**
- **Lunx** values are measured live.
- **Competitor** values are standard baselines for this class of hardware.
- "Small App": Minimal React Hello World.
- "Medium App": Lunx Documentation Site (~50 components).
