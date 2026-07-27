#!/usr/bin/env node
/**
 * bench-cold-build.mjs — Cold build timing benchmark
 *
 * Wipes .lunx/cache/ before each run so Lunx starts cold.
 * Runs lunx build 5 times on the react-basic fixture.
 * Reports min, max, median.
 *
 * Expected: median ≤ 400ms
 */

import { execSync, spawnSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, 'fixtures', 'react-basic');
const CACHE_DIR = resolve(FIXTURE, '.lunx');

// Resolve lunx CLI
let LUNX_CLI;
try {
  LUNX_CLI = resolve(__dirname, 'node_modules', '.bin', 'lunx');
  if (!existsSync(LUNX_CLI)) throw new Error('not found');
} catch {
  LUNX_CLI = resolve(__dirname, '..', '..', 'dist', 'cli.js');
}

const RUNS = 5;
const times = [];

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Cold Build Benchmark  (n=' + RUNS + ')');
console.log(`  fixture: fixtures/react-basic`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (let i = 0; i < RUNS; i++) {
  // Wipe cache — cold start
  if (existsSync(CACHE_DIR)) {
    rmSync(CACHE_DIR, { recursive: true, force: true });
  }

  const t0 = performance.now();
  const result = spawnSync(
    process.execPath,
    [LUNX_CLI, 'build'],
    { cwd: FIXTURE, stdio: 'pipe', timeout: 30_000 }
  );
  const elapsed = performance.now() - t0;

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || '';
    const stdout = result.stdout?.toString() || '';
    console.error(`  ❌ Run ${i + 1} failed (exit ${result.status})`);
    if (stderr) console.error('  stderr:', stderr.slice(0, 300));
    if (stdout) console.error('  stdout:', stdout.slice(0, 300));
    times.push(elapsed); // still record it
  } else {
    console.log(`  run ${i + 1}: ${Math.round(elapsed)}ms`);
    times.push(elapsed);
  }
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

export { med as coldMedian, min as coldMin, max as coldMax };
