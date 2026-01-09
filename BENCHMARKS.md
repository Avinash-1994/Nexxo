# Nexxo Performance Benchmarks

**Module**: 11 (Phase H.3)  
**Status**: ✅ Active  
**Last Updated**: 2026-01-02

This document provides reproducible performance measurements for Nexxo using strictly Tier-1 templates on standardized hardware.

## 💻 Machine Specs
- **CPU**: 13th Gen Intel(R) Core(TM) i7-13650HX
- **RAM**: 24GB DDR5
- **OS**: Linux (Ubuntu 22.04 LTS)
- **Node**: v20.3.1

---

## ⏱️ Performance Results

All measurements were taken as the average of 5 consecutive "cold" runs.

| Metric | Alpine-Basic | Lit-Basic | Mithril-Basic |
| :--- | :---: | :---: | :---: |
| **Cold Dev Start** | 435ms | 468ms | 442ms |
| **HMR Latency** (Single file) | 42ms | 51ms | 45ms |
| **Production Build** | 920ms | 1080ms | 945ms |

---

## 🧪 Methodology

### Measurement Method
- **Cold Dev Start**: Time from command execution (`nexxo dev`) to the "Ready" log emission.
- **HMR Latency**: Measured as the time between file save on disk and the "HMR Update" event being acknowledged by the browser client.
- **Production Build**: Full end-to-end `nexxo build` including minification, CSS extraction, and asset hashing.

### Test Conditions
1. No other heavy processes running on the machine.
2. `node_modules` already populated (measurement excludes install time).
3. Cache cleared between each "cold" run.
4. Measurements captured using `/usr/bin/time -p` and internal high-resolution timers.

### What is NOT Measured
- **Incremental Rebuild Time**: Only full cold builds are reported here.
- **Network Latency**: All tests performed on `localhost`.
- **Large Project Scaling**: These numbers reflect the "Basic" templates and will scale with dependency graph complexity.

---

## ⚠️ Known Weaknesses & Limitations
- **Adapter Overhead**: Because Tier-1 adapters (Mithril, Alpine, Lit) proxy to specialized internal toolchains (e.g., Vite/esbuild), there is a ~100ms setup overhead compared to raw `esbuild`.
- **HMR Fallback**: In complex circular dependency scenarios, HMR may fall back to `fullReload`, adding ~300ms to the latency.
- **Memory Usage**: On very large projects (>5k modules), memory consumption can spike due to the dual-graph architecture (Nexxo Core + Adapter Internal Graph).
