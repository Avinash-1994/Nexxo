# Nexxo v2.0 Module 1 - Docker Benchmark Suite

This directory contains automated benchmarks comparing Nexxo v2.0 against 5 major rivals:
- Vite 8 (with Rolldown/Oxc)
- Turbopack
- Rspack/Rsbuild
- esbuild
- Angular CLI

## Structure

```
docker-suite/
├── Dockerfile.nexxo       # Nexxo v2.0 environment
├── Dockerfile.vite8       # Vite 8 environment
├── Dockerfile.turbopack   # Turbopack environment
├── Dockerfile.rspack      # Rspack environment
├── Dockerfile.esbuild     # esbuild environment
├── Dockerfile.angular     # Angular CLI environment
├── scenarios/             # Test scenarios
│   ├── small-app/        # 1k files
│   ├── large-monorepo/   # 10k files
│   ├── css-heavy/        # Tailwind + CSS-in-JS
│   ├── workers/          # Web Workers
│   └── ssr-stubs/        # SSR frameworks
├── run-benchmarks.sh      # Main benchmark runner
└── results/              # Benchmark results
```

## Running Benchmarks

```bash
# Run all benchmarks
./run-benchmarks.sh

# Run specific tool
./run-benchmarks.sh --tool nexxo

# Run specific scenario
./run-benchmarks.sh --scenario small-app

# Run with specific framework
./run-benchmarks.sh --framework react
```

## Metrics Collected

- **Cold Start Time**: Time from command execution to "Ready" log
- **HMR Latency**: Time from file save to browser update
- **Production Build**: Full build time including optimizations
- **RAM Usage**: Peak memory consumption
- **CPU Utilization**: Core usage during build
- **I/O Operations**: Disk read/write operations

## Results Format

Results are saved in JSON format:

```json
{
  "tool": "nexxo",
  "version": "2.0.0",
  "scenario": "small-app",
  "framework": "react",
  "metrics": {
    "cold_start_ms": 250,
    "hmr_latency_ms": 8,
    "prod_build_ms": 180,
    "ram_peak_mb": 85,
    "cpu_cores_used": 16,
    "io_operations": 1250
  },
  "timestamp": "2026-01-09T12:00:00Z"
}
```

## Comparison Tables

After running benchmarks, use `generate-tables.sh` to create comparison tables:

```bash
./generate-tables.sh
```

This will generate `BENCHMARK_RESULTS_V2.md` with tables and graphs.
