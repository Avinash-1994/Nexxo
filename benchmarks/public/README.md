# Lunx Benchmarks

Reproduce all performance numbers from Lunx v1.0.0.

## Requirements

- Node.js v20+
- npm

## Run

```bash
git clone https://github.com/Avinash-1994/lunx-benchmarks
cd lunx-benchmarks
npm install
node run-all.mjs
```

## Expected Results

Measured on Ubuntu 22.04 x64, Node.js v20.x, all other processes stopped.

| Metric                   | Baseline    | Threshold   |
|--------------------------|-------------|-------------|
| HMR latency p50          | 12ms        | ≤ 15ms      |
| HMR latency p95          | 15ms        | ≤ 18ms      |
| HMR latency p99          | 18ms        | ≤ 20ms      |
| Cold build median        | 286ms       | ≤ 400ms     |
| Warm build median        | 4ms         | ≤ 60ms      |
| Cache hit rate           | 99.90%      | ≥ 99%       |

## Individual Benchmarks

```bash
node bench-hmr.mjs         # HMR latency p50/p95/p99
node bench-cold-build.mjs  # Cold build: wipes cache before each run
node bench-warm-build.mjs  # Warm build: cache intact across runs
node bench-cache.mjs       # SQLite cache hit rate
```

## Skip Flags

```bash
node run-all.mjs --skip-hmr      # skip HMR benchmark
node run-all.mjs --skip-build    # skip build benchmarks
```

## Environment

These numbers were recorded on:

- Ubuntu 22.04 x64
- Node.js v20.x
- Intel i7 / 16 GB RAM
- All other processes stopped during measurement

Results vary by machine. The key metric is **relative performance**
(warm vs cold, cache vs no-cache) — not absolute numbers.

A machine 2× slower should still show:
- warm build ≈ 10–15× faster than cold
- cache hit rate ≥ 99%
- HMR p99 < cold build time by 10×+

## Fixture

`fixtures/react-basic/` is the canonical benchmark fixture —
a client-rendered React SPA with a single entry point.
It is identical to the fixture used in Lunx's own e2e test suite.

## How Benchmarks Work

| Benchmark       | What it measures                                        |
|-----------------|---------------------------------------------------------|
| `bench-hmr`     | HMR engine propagation latency — graph of 300+ modules  |
| `bench-cold`    | Build time with no cache (`.lunx/` wiped before each)  |
| `bench-warm`    | Build time with warm SQLite cache                       |
| `bench-cache`   | Read 1000 cache entries — counts hits vs misses         |

## License

MIT — same as Lunx core.
