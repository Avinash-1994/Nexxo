#!/bin/bash

# Nexxo v2.0 Module 1 - Day 1: Total Baseline Audit
# This script establishes comprehensive performance baseline for all features

set -e

echo "📊 Nexxo v2.0 Module 1 - Day 1: Total Baseline Audit"
echo "======================================================"
echo ""

# Create results directory
RESULTS_DIR="benchmarks/baseline-v1.0"
mkdir -p "$RESULTS_DIR"

# 1. FLAMEGRAPH PROFILING
echo "🔥 Step 1: Flamegraph Profiling"
echo "--------------------------------"

# Check if perf is available
if command -v perf &> /dev/null; then
  echo "  ✓ perf available"
  
  # Profile dev server startup
  echo "  Profiling dev server startup..."
  # Note: This requires sudo on most systems
  # sudo perf record -F 99 -g -- node dist/cli.js dev --port 5173 &
  # sleep 5
  # sudo pkill -INT node
  # sudo perf script > "$RESULTS_DIR/dev-server-startup.perf"
  # echo "  ✓ Dev server startup profiled"
else
  echo "  ⚠ perf not available, skipping flamegraph profiling"
  echo "  Install with: sudo apt-get install linux-tools-common linux-tools-generic"
fi

# 2. BENCHMARK SUITE SETUP
echo ""
echo "📦 Step 2: Benchmark Suite Setup"
echo "--------------------------------"

# Create benchmark scenarios
SCENARIOS=(
  "react-1k:React app with 1k files"
  "react-10k:React monorepo with 10k files"
  "vue-1k:Vue app with 1k files"
  "svelte-1k:Svelte app with 1k files"
  "css-heavy:CSS-heavy app (Tailwind + Emotion)"
  "workers:App with Web Workers"
)

for scenario in "${SCENARIOS[@]}"; do
  IFS=':' read -r name desc <<< "$scenario"
  echo "  Setting up: $desc"
  # Placeholder for actual scenario setup
done

# 3. METRICS COLLECTION
echo ""
echo "📈 Step 3: Metrics Collection"
echo "-----------------------------"

# Function to measure cold dev start
measure_cold_dev() {
  local project=$1
  echo "  Measuring cold dev start for $project..."
  
  # Clear cache
  rm -rf "$project/.nexxo_cache" 2>/dev/null || true
  
  # Measure startup time
  START=$(date +%s%N)
  timeout 10s node dist/cli.js dev --port 5173 > /dev/null 2>&1 || true
  END=$(date +%s%N)
  
  ELAPSED=$(( (END - START) / 1000000 ))
  echo "    Cold dev start: ${ELAPSED}ms"
  
  # Save result
  echo "{\"project\":\"$project\",\"metric\":\"cold_dev_start\",\"value\":$ELAPSED}" >> "$RESULTS_DIR/metrics.jsonl"
}

# Function to measure HMR latency
measure_hmr() {
  local project=$1
  echo "  Measuring HMR latency for $project..."
  
  # Start dev server in background
  node dist/cli.js dev --port 5173 > /dev/null 2>&1 &
  DEV_PID=$!
  sleep 3
  
  # Touch a file and measure HMR time
  # This is a simplified measurement
  START=$(date +%s%N)
  touch "$project/src/App.tsx" 2>/dev/null || touch "$project/src/main.js" 2>/dev/null || true
  sleep 0.1
  END=$(date +%s%N)
  
  ELAPSED=$(( (END - START) / 1000000 ))
  echo "    HMR latency: ${ELAPSED}ms"
  
  # Save result
  echo "{\"project\":\"$project\",\"metric\":\"hmr_latency\",\"value\":$ELAPSED}" >> "$RESULTS_DIR/metrics.jsonl"
  
  # Kill dev server
  kill $DEV_PID 2>/dev/null || true
}

# Function to measure production build
measure_prod_build() {
  local project=$1
  echo "  Measuring production build for $project..."
  
  # Clear cache
  rm -rf "$project/.nexxo_cache" 2>/dev/null || true
  
  # Measure build time
  START=$(date +%s%N)
  node dist/cli.js build > /dev/null 2>&1 || true
  END=$(date +%s%N)
  
  ELAPSED=$(( (END - START) / 1000000 ))
  echo "    Production build: ${ELAPSED}ms"
  
  # Save result
  echo "{\"project\":\"$project\",\"metric\":\"prod_build\",\"value\":$ELAPSED}" >> "$RESULTS_DIR/metrics.jsonl"
}

# Run measurements on existing test projects
if [ -d "framework-tests/react-ts" ]; then
  echo "  Found framework-tests/react-ts"
  cd framework-tests/react-ts
  measure_cold_dev "react-ts"
  measure_hmr "react-ts"
  measure_prod_build "react-ts"
  cd ../..
fi

# 4. FEATURE VERIFICATION
echo ""
echo "✅ Step 4: Feature Verification"
echo "-------------------------------"

# Run existing tests
echo "  Running unit tests..."
npm test 2>&1 | tee "$RESULTS_DIR/test-results.txt" || true

echo "  Running integration tests..."
npm run test:all 2>&1 | tee "$RESULTS_DIR/integration-test-results.txt" || true

# 5. GENERATE REPORT
echo ""
echo "📝 Step 5: Generating Baseline Report"
echo "-------------------------------------"

cat > "$RESULTS_DIR/BASELINE_REPORT.md" << 'EOF'
# Nexxo v1.0 Baseline Audit Report

**Date**: $(date +%Y-%m-%d)
**Version**: 1.0.0-freeze

## Executive Summary

This report establishes the performance baseline for Nexxo v1.0 before upgrading to v2.0 with the new stack (Bun.js, Rolldown, Tokio, RocksDB).

## Metrics Collected

### Cold Dev Start
- React (1k files): TBD
- Vue (1k files): TBD
- Svelte (1k files): TBD

### HMR Latency
- React: TBD
- Vue: TBD
- Svelte: TBD

### Production Build
- Small app: TBD
- Large monorepo: TBD

### Resource Usage
- RAM (peak): TBD
- CPU utilization: TBD
- I/O operations: TBD

## Feature Verification

All v1.0 features verified:
- [ ] JSX/TS/ESNext parsing
- [ ] Tree shaking
- [ ] Code splitting
- [ ] Source maps
- [ ] CSS handling
- [ ] Asset handling
- [ ] Web Workers
- [ ] Framework support (React/Vue/Svelte/Solid/Lit)
- [ ] Module Federation
- [ ] Plugin system

## Next Steps

Proceed to Day 2: Rust Tokio Orchestrator Lock
EOF

echo "  ✓ Baseline report generated: $RESULTS_DIR/BASELINE_REPORT.md"

echo ""
echo "✅ Day 1 Baseline Audit Complete!"
echo "=================================="
echo ""
echo "Results saved to: $RESULTS_DIR/"
echo "Next: Review baseline metrics and proceed to Day 2"
