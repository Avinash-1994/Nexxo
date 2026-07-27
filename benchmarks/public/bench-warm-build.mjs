#!/usr/bin/env node
/**
 * bench-warm-build.mjs — Warm build timing benchmark
 *
 * Runs lunx build once to populate the cache (warm-up).
 * Then runs 5 more times WITH cache intact.
 * Reports min, max, median of the 5 warm runs.
 *
 * Expected: median ≤ 400ms (react-basic is a small fixture; speedup is most
 * significant on large 5000+ module projects where cache reduces re-parse time)
 */

import { spawnSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, 'fixtures', 'react-basic');
const CACHE_DIR = resolve(FIXTURE, '.lunx');

let LUNX_CLI;
try {
  LUNX_CLI = resolve(__dirname, 'node_modules', '.bin', 'lunx');
  if (!existsSync(LUNX_CLI)) throw new Error();
} catch {
  LUNX_CLI = resolve(__dirname, '..', '..', 'dist', 'cli.js');
}

function runBuild() {
  const t0 = performance.now();
  const result = spawnSync(
    process.execPath,
    [LUNX_CLI, 'build'],
    { cwd: FIXTURE, stdio: 'pipe', timeout: 30_000 }
  );
  return { elapsed: performance.now() - t0, status: result.status, stderr: result.stderr?.toString() };
}

const WARM_RUNS = 5;
const times = [];

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Warm Build Benchmark  (warm-up + n=' + WARM_RUNS + ')');
console.log(`  fixture: fixtures/react-basic`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Clear cache then warm-up
if (existsSync(CACHE_DIR)) rmSync(CACHE_DIR, { recursive: true, force: true });
process.stdout.write('  warm-up run 0: ');
const { elapsed: warmupTime, status: warmupStatus } = runBuild();
if (warmupStatus !== 0) {
  console.error(`❌ warm-up failed`);
  process.exit(1);
}
console.log(`${Math.round(warmupTime)}ms  (cache populated)`);

// Warm runs
for (let i = 0; i < WARM_RUNS; i++) {
  const { elapsed, status, stderr } = runBuild();
  if (status !== 0) {
    console.error(`  ❌ warm run ${i + 1} failed: ${stderr?.slice(0, 200)}`);
  } else {
    console.log(`  warm run ${i + 1}: ${Math.round(elapsed)}ms`);
  }
  times.push(elapsed);
}

times.sort((a, b) => a - b);

function median(arr) {
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

const med = median(times);
const min = times[0];
const max = times[times.length - 1];
const PASS = med <= 400;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  min:    ${Math.round(min)}ms`);
console.log(`  median: ${Math.round(med)}ms   ${PASS ? '✅ ≤400ms' : '❌ >400ms'}`);
console.log(`  max:    ${Math.round(max)}ms`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

export { med as warmMedian, min as warmMin, max as warmMax };
