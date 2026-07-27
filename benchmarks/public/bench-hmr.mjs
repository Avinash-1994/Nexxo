#!/usr/bin/env node
/**
 * bench-hmr.mjs — HMR latency benchmark
 *
 * Uses the Lunx HMR engine directly (no dev server needed).
 * Simulates 100 file-change events on a real module graph
 * and measures propagation latency per update.
 *
 * Outputs: p50, p95, p99 in ms
 * Expected: p99 ≤ 20ms
 */

import { performance } from 'node:perf_hooks';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load HMR engine from installed lunx ──────────────────────────────────────
let HMREngine;
try {
  const mod = await import('lunx/hmr');
  HMREngine = mod.HMREngine;
} catch {
  // Fallback: direct path for local development
  try {
    const mod = await import(resolve(ROOT, '..', 'dist/dev/hmr-v2.js'));
    HMREngine = mod.HMREngine;
  } catch (e) {
    console.error('❌ Cannot load HMR engine. Run: npm install first.');
    console.error('   Or set LUNX_DIST=/path/to/lunx/dist');
    process.exit(1);
  }
}

const SAMPLES = 100;
const GRAPH_DEPTH = 3;
const GRAPH_BREADTH = 10;

// ── Build module graph ────────────────────────────────────────────────────────
function buildGraph(engine, parentId, depth) {
  if (depth >= GRAPH_DEPTH) return;
  const children = [];
  for (let i = 0; i < GRAPH_BREADTH; i++) {
    const id = `/app/mod_${depth}_${i}.tsx`;
    const isLeaf = depth === GRAPH_DEPTH - 1;
    engine.registerModule(id, [], isLeaf);
    children.push(id);
    buildGraph(engine, id, depth + 1);
  }
  engine.registerModule(parentId, children, false);
}

// ── Run benchmark ─────────────────────────────────────────────────────────────
const engine = new HMREngine('/app');
buildGraph(engine, '/app/main.tsx', 0);

const leafNodes = [];
for (let i = 0; i < GRAPH_BREADTH; i++) {
  leafNodes.push(`/app/mod_${GRAPH_DEPTH - 1}_${i}.tsx`);
}

// Warm-up: 10 runs not counted
for (let i = 0; i < 10; i++) {
  const node = leafNodes[i % leafNodes.length];
  engine.propagateUpdate(node);
}

// Measured: SAMPLES runs
const latencies = [];
for (let i = 0; i < SAMPLES; i++) {
  const node = leafNodes[i % leafNodes.length];
  const t0 = performance.now();
  engine.propagateUpdate(node);
  latencies.push(performance.now() - t0);
}

latencies.sort((a, b) => a - b);

function percentile(arr, p) {
  const idx = Math.max(0, Math.ceil((p / 100) * arr.length) - 1);
  return arr[idx];
}

const p50 = percentile(latencies, 50);
const p95 = percentile(latencies, 95);
const p99 = percentile(latencies, 99);
const min = latencies[0];
const max = latencies[latencies.length - 1];

const PASS = p99 <= 20;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  HMR Latency Benchmark  (n=' + SAMPLES + ')');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  min:  ${min.toFixed(3)}ms`);
console.log(`  p50:  ${p50.toFixed(3)}ms`);
console.log(`  p95:  ${p95.toFixed(3)}ms`);
console.log(`  p99:  ${p99.toFixed(3)}ms   ${PASS ? '✅ ≤20ms' : '❌ >20ms'}`);
console.log(`  max:  ${max.toFixed(3)}ms`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

export { p50, p95, p99 };
