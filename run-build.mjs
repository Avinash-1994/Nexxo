import { loadConfig } from './dist/config/index.js';
import { build } from './dist/build/bundler.js';

async function run(root) {
  try {
    const config = await loadConfig(root);
    const result = await build(config);
    console.log(`[PASS] Build finished in ${result.metrics?.totalTimeMs || result.time || result.duration}ms`);
  } catch (e) {
    console.error(`[FAIL] ${e.message}`);
  }
}

const dir = process.argv[2];
if (dir) run(dir);
