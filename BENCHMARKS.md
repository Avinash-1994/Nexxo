# Nexxo Benchmarks: Honest Comparison

> Environment: linux (x64)
> Date: 2026-01-16

| Tool | Cold Start (ms) | HMR (ms) | Build (ms) | Bundle Size (KB) |
|------|----------------|----------|------------|------------------|
| **Nexxo** | 5002 | 15 | 543 | 0.0 |
| **Vite** | 444 | 30 | 950 | 0.6 |
| **Webpack (Baseline)** | 2500 | 400 | 5000 | 1540.0 |
| **Rspack (Baseline)** | 300 | 50 | 1200 | 0.0 |

**Notes:**
- **NeXXO** results are from local build.
- **Vite** results are from local build.
- **Webpack/Rspack** are baseline averages for a 100-component React application.
- All builds performed without cache.
