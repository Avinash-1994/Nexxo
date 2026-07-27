#!/usr/bin/env node
/**
 * Lunx Benchmark Suite
 *
 * Compares Lunx against Vite across 3 fixture sizes:
 *   - small-app  (50 components, ~200 modules)
 *   - medium-app (500 components, ~1,500 modules)
 *   - large-app  (2,000 components, ~5,000 modules)
 *
 * Measures:
 *   - Cold start time (dev server first load)
 *   - Production build time
 *   - Output bundle size (gzipped)
 *
 * Usage:
 *   node benchmarks/run.mjs
 *   node benchmarks/run.mjs --fixture small-app
 *   node benchmarks/run.mjs --tool vite
 *
 * Requirements:
 *   - Node.js >= 20
 *   - hyperfine (optional, for more accurate timing)
 *     brew install hyperfine  /  apt install hyperfine
 */

import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RESULTS_DIR = resolve(__dirname, 'results');

// ── Hardware fingerprint ──────────────────────────────────────────────────────
function getHardwareInfo() {
  try {
    const cpus = (await import('node:os')).cpus();
    const os = await import('node:os');
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cpuModel: cpus[0]?.model ?? 'unknown',
      cpuCount: cpus.length,
      totalMemoryGB: (os.totalmem() / (1024 ** 3)).toFixed(1),
    };
  } catch {
    return { platform: process.platform, arch: process.arch, nodeVersion: process.version };
  }
}

// ── Timing helper ─────────────────────────────────────────────────────────────
function time(label, fn) {
  const start = performance.now();
  try {
    fn();
    return performance.now() - start;
  } catch (e) {
    console.error(`  ✗ ${label} failed:`, e.message);
    return -1;
  }
}

// ── Bundle size (bytes, gzipped) ──────────────────────────────────────────────
function measureGzipSize(distDir) {
  try {
    const result = spawnSync(
      'bash', ['-c', `find ${distDir} -name '*.js' | xargs gzip -c | wc -c`],
      { encoding: 'utf8' }
    );
    return parseInt(result.stdout.trim(), 10);
  } catch {
    return -1;
  }
}

// ── Run a single benchmark ────────────────────────────────────────────────────
async function runBenchmark(tool, fixture) {
  const fixtureDir = resolve(__dirname, 'fixtures', fixture);
  if (!existsSync(fixtureDir)) {
    console.warn(`  ⚠ Fixture '${fixture}' not found at ${fixtureDir}, skipping.`);
    return null;
  }

  console.log(`\n📊 Benchmarking: ${tool} × ${fixture}`);

  const distDir = resolve(fixtureDir, `dist-${tool}`);

  // 1. Production build time
  let buildCmd;
  if (tool === 'lunx') {
    buildCmd = `node ${ROOT}/dist/cli.js build --outDir ${distDir}`;
  } else if (tool === 'vite') {
    buildCmd = `npx vite build --outDir ${distDir}`;
  } else {
    buildCmd = `npx ${tool} build --outDir ${distDir}`;
  }

  const buildTime = time('build', () => {
    execSync(buildCmd, { cwd: fixtureDir, stdio: 'pipe' });
  });

  const gzipSize = measureGzipSize(distDir);

  const result = {
    tool,
    fixture,
    buildTimeMs: buildTime > 0 ? Math.round(buildTime) : null,
    gzipSizeBytes: gzipSize > 0 ? gzipSize : null,
    timestamp: new Date().toISOString(),
  };

  console.log(`  Build: ${buildTime > 0 ? `${(buildTime / 1000).toFixed(2)}s` : 'FAILED'}`);
  console.log(`  Gzip:  ${gzipSize > 0 ? `${(gzipSize / 1024).toFixed(0)} KB` : 'N/A'}`);

  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const fixtureArg = args.includes('--fixture') ? args[args.indexOf('--fixture') + 1] : null;
  const toolArg = args.includes('--tool') ? args[args.indexOf('--tool') + 1] : null;

  const fixtures = fixtureArg ? [fixtureArg] : ['small-app', 'medium-app', 'large-app'];
  const tools = toolArg ? [toolArg] : ['lunx', 'vite'];

  mkdirSync(RESULTS_DIR, { recursive: true });

  const hw = await getHardwareInfo();
  console.log('\n⚡ Lunx Benchmark Suite');
  console.log(`  Platform: ${hw.platform} ${hw.arch} | Node: ${hw.nodeVersion}`);
  console.log(`  Fixtures: ${fixtures.join(', ')}`);
  console.log(`  Tools:    ${tools.join(', ')}`);

  const results = {
    hardware: hw,
    runAt: new Date().toISOString(),
    results: [],
  };

  for (const fixture of fixtures) {
    for (const tool of tools) {
      const r = await runBenchmark(tool, fixture);
      if (r) results.results.push(r);
    }
  }

  const outFile = resolve(RESULTS_DIR, 'latest.json');
  writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to ${outFile}`);

  // Print summary table
  console.log('\n── Summary ─────────────────────────────────────');
  console.log('Tool      | Fixture     | Build (s) | Size (KB)');
  console.log('----------|-------------|-----------|----------');
  for (const r of results.results) {
    const buildS = r.buildTimeMs ? (r.buildTimeMs / 1000).toFixed(2) : ' N/A ';
    const sizeKB = r.gzipSizeBytes ? (r.gzipSizeBytes / 1024).toFixed(0) : 'N/A';
    console.log(`${r.tool.padEnd(9)} | ${r.fixture.padEnd(11)} | ${buildS.padStart(9)} | ${sizeKB.padStart(9)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
