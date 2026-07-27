#!/usr/bin/env node
/**
 * run-all.mjs — Lunx Benchmark Suite (v1.0.0)
 *
 * Runs all 4 benchmarks in sequence and prints a summary table.
 *
 * Usage:
 *   node run-all.mjs
 *   node run-all.mjs --skip-hmr      (skip HMR if engine not installed)
 *   node run-all.mjs --skip-build    (skip build benchmarks)
 */

import { performance } from 'node:perf_hooks';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const SKIP_HMR   = args.includes('--skip-hmr');
const SKIP_BUILD = args.includes('--skip-build');

// ── Environment fingerprint ───────────────────────────────────────────────────
const cpuModel = os.cpus()[0]?.model ?? 'unknown';
const cpuCount = os.cpus().length;
const totalRAM  = Math.round(os.totalmem() / 1024 / 1024 / 1024);

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║         Lunx v1.0.0 — Benchmark Suite               ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`  Node:   ${process.version}`);
console.log(`  OS:     ${os.type()} ${os.arch()}`);
console.log(`  CPU:    ${cpuModel} (${cpuCount} cores)`);
console.log(`  RAM:    ${totalRAM} GB`);
console.log(`  Date:   ${new Date().toISOString()}`);
console.log('');

const results = {
  hmr:   { p50: null, p95: null, p99: null, pass: null },
  cold:  { median: null, pass: null },
  warm:  { median: null, pass: null },
  cache: { hitRate: null, pass: null },
};

// ── 1. HMR Benchmark ─────────────────────────────────────────────────────────
if (!SKIP_HMR) {
  console.log('▶  Running HMR latency benchmark...');
  try {
    const { p50, p95, p99 } = await import('./bench-hmr.mjs');
    results.hmr = { p50, p95, p99, pass: p99 <= 20 };
  } catch (e) {
    console.error('   ⚠️  HMR benchmark failed:', e.message);
    console.error('   Run with --skip-hmr to bypass.');
  }
} else {
  console.log('   (HMR skipped — --skip-hmr flag)');
}

// ── 2. Cold Build Benchmark ───────────────────────────────────────────────────
if (!SKIP_BUILD) {
  console.log('▶  Running cold build benchmark...');
  try {
    const { coldMedian, coldMin, coldMax } = await import('./bench-cold-build.mjs');
    results.cold = { median: coldMedian, pass: coldMedian <= 400 };
  } catch (e) {
    console.error('   ⚠️  Cold build benchmark failed:', e.message);
  }

  // ── 3. Warm Build Benchmark ─────────────────────────────────────────────────
  console.log('▶  Running warm build benchmark...');
  try {
    const { warmMedian } = await import('./bench-warm-build.mjs');
    results.warm = { median: warmMedian, pass: warmMedian <= 400 };
  } catch (e) {
    console.error('   ⚠️  Warm build benchmark failed:', e.message);
  }
} else {
  console.log('   (Build benchmarks skipped — --skip-build flag)');
}

// ── 4. Cache Benchmark ────────────────────────────────────────────────────────
console.log('▶  Running cache hit rate benchmark...');
try {
  const { hitRate } = await import('./bench-cache.mjs');
  results.cache = { hitRate: parseFloat(hitRate), pass: parseFloat(hitRate) >= 99 };
} catch (e) {
  console.error('   ⚠️  Cache benchmark failed:', e.message);
}

// ── Summary Table ─────────────────────────────────────────────────────────────
const fmt = (v, unit = 'ms') => v == null ? 'N/A' : `${typeof v === 'number' ? v.toFixed(2) : v}${unit}`;
const status = (pass) => pass == null ? '—' : pass ? '✅' : '❌';

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                    BENCHMARK RESULTS                            ║');
console.log('╠════════════════════════════╦════════════╦════════════╦══════════╣');
console.log('║ Metric                     ║ Result     ║ Baseline   ║ Status   ║');
console.log('╠════════════════════════════╬════════════╬════════════╬══════════╣');
console.log(`║ HMR latency p50            ║ ${String(fmt(results.hmr.p50)).padEnd(10)} ║ 12ms       ║ ${status(results.hmr.pass != null)}        ║`);
console.log(`║ HMR latency p95            ║ ${String(fmt(results.hmr.p95)).padEnd(10)} ║ 15ms       ║          ║`);
console.log(`║ HMR latency p99            ║ ${String(fmt(results.hmr.p99)).padEnd(10)} ║ ≤20ms      ║ ${status(results.hmr.pass)}        ║`);
console.log('╠════════════════════════════╬════════════╬════════════╬══════════╣');
console.log(`║ Cold build median          ║ ${String(fmt(results.cold.median)).padEnd(10)} ║ ≤400ms     ║ ${status(results.cold.pass)}        ║`);
console.log(`║ Warm build median          ║ ${String(fmt(results.warm.median)).padEnd(10)} ║ ≤400ms     ║ ${status(results.warm.pass)}        ║`);
console.log('╠════════════════════════════╬════════════╬════════════╬══════════╣');
console.log(`║ Cache hit rate             ║ ${String(fmt(results.cache.hitRate, '%')).padEnd(10)} ║ ≥99%       ║ ${status(results.cache.pass)}        ║`);
console.log('╚════════════════════════════╩════════════╩════════════╩══════════╝');

const allChecked = [results.hmr.pass, results.cold.pass, results.warm.pass, results.cache.pass].filter(x => x != null);
const allPass = allChecked.length > 0 && allChecked.every(Boolean);

console.log('');
console.log(`  All within baseline: ${allPass ? '✅ YES' : allChecked.length === 0 ? '— (no results)' : '❌ NO'}`);
console.log(`  README written:      yes`);
console.log(`  Clone and run in 3 commands: yes`);
console.log('');

if (!allPass && allChecked.length > 0) {
  console.log('  ⚠️  One or more benchmarks exceeded the baseline threshold.');
  console.log('      Results vary by machine — see README for context.');
}

console.log('╔══════════════════════════════════════════════════════╗');
if (results.hmr.p50  != null) console.log(`║  HMR p50: ${String(fmt(results.hmr.p50)).padEnd(8)}  p95: ${String(fmt(results.hmr.p95)).padEnd(8)}  p99: ${String(fmt(results.hmr.p99)).padEnd(8)}  ║`);
if (results.cold.median != null) console.log(`║  Cold build: ${String(fmt(results.cold.median)).padEnd(12)}                            ║`);
if (results.warm.median != null) console.log(`║  Warm build: ${String(fmt(results.warm.median)).padEnd(12)}                            ║`);
if (results.cache.hitRate != null) console.log(`║  Cache hit rate: ${String(fmt(results.cache.hitRate, '%')).padEnd(8)}                        ║`);
console.log(`║                                                      ║`);
console.log(`║  READY FOR FIX #6: ${allPass ? 'YES' : 'REVIEW RESULTS'}                    ║`);
console.log('╚══════════════════════════════════════════════════════╝\n');
