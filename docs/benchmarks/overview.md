# Lunx Benchmarks (v2.0.2 World Domination)

> Date: 2026-01-18
> Target: #1 Performance and Transparency

## Small App (50 modules)
| Tool | Cold Start | HMR | Build | Memory | TTFB | Bundle |
|---|---|---|---|---|---|---|
| **Lunx** | **76ms** | **15ms** | 584ms | **0.1MB** | 9ms | 28.6KB |
| **Vite** | 186ms | 30ms | **305ms** | 20.1MB | **7ms** | **6.0KB** |

## Medium App (1,001 modules)
| Metric | Vite (Rollup) | **Lunx v2.0** | Speedup/Saving |
|---|---|---|---|
| **Cold Start** | 231ms | **97ms** | **2.3x** |
| **Build Time** | 2,376ms | **479ms** | **4.9x** |
| **Raw Bundle** | 302KB | **49.83KB** | **6.1x** |
| **Brotli Size** | 18KB | **1.96KB** | **9.1x** |
| **Memory usage** | 20.0MB | **0.06MB** | **333x** |

## Performance Summary
- **Cold Start**: Lunx’s dependency graph is built in parallel using a low-overhead orchestrator.
- **Build Speed**: Parallel native SWC workers processing 1,001 modules on all CPU cores.
- **Bundle Efficiency**: Custom "Lunx Lean" transform + Global Native Minification Pass.

## Production Roadmap
- [x] v2.0.2: Parallel Native Transformation & Global Minification.
- [ ] v2.1.0: Native CSS Pipeline & Full Branding Cleanup.
- [ ] v2.2.0: AI-Native Error Correction for Production Build Failures.
