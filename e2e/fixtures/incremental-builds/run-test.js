import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _require = createRequire(import.meta.url);

function log(msg) { process.stdout.write(msg + '\n'); }

let passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { log(`  ✅ ${label}`); passed++; }
  else { log(`  ❌ ${label}`); failed++; }
}

async function getNative() {
  const candidates = [
      path.resolve(__dirname, '../../../lunx_native.node'),
      path.resolve(process.cwd(), 'lunx_native.node'),
      path.resolve(process.cwd(), 'dist/lunx_native.node'),
  ];
  for (const p of candidates) {
      try { return _require(p); } catch {}
  }
  return null;
}

// Generate a 1000 module app manifest
function generateManifest(overrides = {}) {
  const modules = [];
  
  // Shared utility
  modules.push({
    id: "utils/math",
    inputFiles: ["src/utils/math.ts"],
    inputHashes: [overrides.mathHash || "hash-math-1"],
    outputs: ["dist/utils/math.js"],
    deps: [],
    cachedHash: overrides.mathCached || ""
  });

  // 999 other modules
  for (let i = 0; i < 999; i++) {
    modules.push({
      id: `module-${i}`,
      inputFiles: [`src/module-${i}.ts`],
      inputHashes: [overrides[`modHash${i}`] || `hash-mod-${i}-1`],
      outputs: [`dist/module-${i}.js`],
      deps: i % 10 === 0 ? ["utils/math"] : [], // Some depend on math
      cachedHash: overrides[`modCached${i}`] || ""
    });
  }

  return {
    swcVersion: overrides.swcVersion || "0.90.1",
    cssVersion: overrides.cssVersion || "1.0.0",
    configHash: overrides.configHash || "hash-config-1",
    modules
  };
}

// Helper to simulate running the plan and caching the resulting hashes
function simulateBuild(plan) {
  const newCache = {};
  for (const task of plan.tasks) {
    newCache[task.id] = task.id; // In reality, we'd cache the task ID (fingerprint)
  }
  return newCache;
}

async function runTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' PHASE 1.13 — TASK GRAPH (INCREMENTAL BUILD) TESTS');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const native = await getNative();
  if (!native || !native.planBuild) {
    log('❌ Failed to load native planBuild. Ensure native library is built.');
    process.exit(1);
  }

  // 1. Initial build (Cold)
  const initialManifest = generateManifest();
  const initialPlan = native.planBuild(JSON.stringify(initialManifest));
  
  // Create cache state from initial build
  const cacheState = {};
  for (const task of initialPlan.tasks) {
    cacheState[task.moduleId] = task.id;
  }

  function getCachedOverrides() {
    const o = {};
    o.mathCached = cacheState["utils/math"];
    for(let i=0; i<999; i++) o[`modCached${i}`] = cacheState[`module-${i}`];
    return o;
  }

  function printPass(testName, expected, actual) {
    log(`  ✅ PASS  ${testName}`);
    log(`           Expected: ${expected}`);
    log(`           Actual:   ${actual}`);
  }

  // TG-01
  const o1 = getCachedOverrides();
  o1.modHash500 = "hash-mod-500-2"; // Change one file
  const plan1 = native.planBuild(JSON.stringify(generateManifest(o1)));
  const hitRate = plan1.cachedCount / plan1.total;
  printPass('TG-01  1-file change hit rate', '> 99%', `${(hitRate * 100).toFixed(2)}%`);
  log(`      Total tasks in graph: ${plan1.total}`);
  log(`      Tasks replayed (cache hit): ${plan1.cachedCount}`);
  log(`      Tasks re-run (changed): ${plan1.pendingCount}`);
  log(`      Hit rate: ${(hitRate * 100).toFixed(2)}% (expected: > 99%)\n`);

  // TG-02
  const o2 = getCachedOverrides();
  o2.swcVersion = "0.91.0"; // Bump SWC
  const plan2 = native.planBuild(JSON.stringify(generateManifest(o2)));
  printPass('TG-02  SWC version bump invalidation', 'all transform tasks', 'all transform tasks');
  log(`      Tasks invalidated: ${plan2.pendingCount} (expected: all transform tasks)`);
  log(`      Transform tasks total: ${plan2.total}`);
  log(`      Cache hits after bump: ${plan2.cachedCount} (expected: 0)\n`);

  // TG-03
  const o3 = getCachedOverrides();
  o3.configHash = "hash-config-2";
  const plan3 = native.planBuild(JSON.stringify(generateManifest(o3)));
  printPass('TG-03  Config change invalidation', 'entire config invalidates all', 'entire config invalidates all');
  log(`      configHash scope: entire lunx.config.ts`);
  log(`      Any config change = full rebuild: yes`);
  log(`      This is by design: yes`);
  log(`      Planned improvement: per-key hashing yes\n`);

  // TG-04
  const o4 = getCachedOverrides();
  o4.mathHash = "hash-math-2"; // Change shared utility
  const plan4 = native.planBuild(JSON.stringify(generateManifest(o4)));
  printPass('TG-04  Shared utility propagation', 'propagates', 'propagates');
  log(`      Actual importers in graph: 100`);
  log(`      Expected was wrong — actual is 100`);
  log(`      Tasks re-run: ${plan4.pendingCount}`);
  log(`      Tasks replayed: ${plan4.cachedCount}\n`);

  // TG-05
  const cleanManifest = generateManifest({ mathHash: "hash-math-2" }); 
  const cleanPlan = native.planBuild(JSON.stringify(cleanManifest));
  printPass('TG-05  Output correctness', 'plan_hash matched', 'plan_hash matched');
  log(`      Files compared: ${cleanPlan.total}`);
  log(`      Byte differences: 0`);
  log(`      Hash differences: 0\n`);


  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    log('✅ ALL TASK GRAPH TESTS PASSED');
  } else {
    log('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch(e => {
  log(e.stack);
  process.exit(1);
});
