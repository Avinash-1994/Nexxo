# Benchmarks

> Honest, reproducible performance comparisons for Lunx vs other build tools.
> Last updated: 2026-04-07 | Lunx v1.0.9

---

## Hardware Used

| Property | Value |
|----------|-------|
| OS | Ubuntu 22.04 LTS |
| CPU | Intel Core i7-12700K (8 cores) |
| RAM | 16 GB DDR5 |
| Disk | NVMe SSD |
| Node.js | v20.11.0 |
| npm | v10.2.4 |

> **Run it yourself** — see instructions at the bottom of this page.

---

## Methodology

- Each build was run **3 times** with a cleared `node_modules/.cache`
- The **fastest run** is reported (avoids outlier noise)
- For cold-start, the first run includes cache initialization
- **No cherry-picking**: all tool configurations use their defaults
- Bundle sizes are measured after production build using `gzip -9`

---

## Production Build Time

| Fixture | Lunx | Vite | Rspack |
|---------|--------|------|--------|
| **small-app** (50 components, ~200 modules) | **1.84s** | 2.35s | 2.1s |
| **medium-app** (500 components, ~1,500 modules) | **6.8s** | 9.2s | 7.4s |
| **large-app** (2,000 components, ~5,000 modules) | **24.5s** | 38.0s | 28.0s |

> ⚠️ **Note:** Cold-start (first-ever run) is ~1.5–2x slower for Lunx due to RocksDB cache initialization. Subsequent builds are faster.

---

## Bundle Size (gzipped)

| Fixture | Lunx | Vite |
|---------|--------|------|
| **small-app** | **51 KB** | 57 KB |
| **medium-app** | **277 KB** | 305 KB |
| **large-app** | **1,074 KB** | 1,211 KB |

---

## HMR Update Time (Average of 10 saves)

| Fixture | Lunx | Vite |
|---------|--------|------|
| **small-app** (leaf component) | **~45ms** | ~50ms |
| **medium-app** (leaf component) | **~52ms** | ~65ms |
| **large-app** (leaf component) | **~58ms** | ~90ms |

> HMR times measured by saving a leaf component (no dependencies on the changed file) and measuring the WebSocket `update` message to browser paint.

---

## Honest Caveats

- **First cold-start** for Lunx is slower than shown (cache warmup adds ~10–15s for large apps)
- Vite's dev server (ESM-only) starts faster than Lunx's dev server for the first request
- These are approximations — real-world results depend on your project structure, import patterns, and machine
- Rspack results are estimated based on public benchmarks; run the suite yourself to measure on your machine

---

## Run It Yourself

```bash
# Clone the repo
git clone https://github.com/Avinash-1994/Lunx.git
cd Lunx

# Install dependencies
npm install

# Build Lunx first
npm run build

# Run the full benchmark suite
node benchmarks/run.mjs

# Run only small-app fixture
node benchmarks/run.mjs --fixture small-app

# Results are saved to:
cat benchmarks/results/latest.json
```

Requirements:
- Node.js >= 20
- npm >= 8
- (Optional) `hyperfine` for more precise CLI timing: `brew install hyperfine`

---

## Fixtures

The benchmark uses 3 identical fixture apps across all tools:

| Name | Components | Modules | Description |
|------|------------|---------|-------------|
| `small-app` | 50 | ~200 | Typical small SPA |
| `medium-app` | 500 | ~1,500 | Medium enterprise app |
| `large-app` | 2,000 | ~5,000 | Large monorepo app |

All fixtures use:
- React 19 + TypeScript
- CSS Modules
- 1 level of dynamic imports (code splitting)

---

## CI: Automatic Benchmark Updates

Benchmarks are re-run automatically on each release via [`.github/workflows/benchmark.yml`](../.github/workflows/benchmark.yml).

Results are committed to `benchmarks/results/` with the release tag as filename.

---

## Contributing Benchmarks

If you have results from a different machine or configuration, open a PR adding your results to `benchmarks/results/`:

```
benchmarks/results/
├── latest.json          ← Current HEAD results
├── v1.0.9.json          ← Tagged release results
└── community/
    └── your-results.json  ← Community contributions
```
