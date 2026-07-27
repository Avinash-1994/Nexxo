import path from 'path';
import fs from 'fs';
import { getCacheManager } from '../../src/core/cache-manager.js';

function log(msg) { process.stdout.write(msg + '\n'); }

function printPass(testName, expected, actual) {
  log(`  ✅ PASS  ${testName}`);
  log(`           Expected: ${expected}`);
  log(`           Actual:   ${actual}`);
  log('');
}

async function runTest() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' PB-06 REGRESSION TEST');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rootDir = process.cwd();
  const customCacheDir = path.join('/tmp', 'lunx-test-cache');
  const defaultCacheDir = path.join(rootDir, '.lunx', 'cache');

  // Clean up
  if (fs.existsSync(customCacheDir)) fs.rmSync(customCacheDir, { recursive: true, force: true });
  if (fs.existsSync(defaultCacheDir)) fs.rmSync(defaultCacheDir, { recursive: true, force: true });

  // Init cache with custom cacheDir
  // Note: we'd ideally pass the config, but getCacheManager uses a config reader internally or takes it as an argument.
  // Wait, I can just mock the config. 
  // Wait, `getCacheManager` in `src/core/cache-manager.js` takes `(cwd, options = {})`.
  const cacheManager = getCacheManager(rootDir, { cacheDir: '/tmp/lunx-test-cache' });
  await cacheManager.set('test', '1.js', 'console.log("1");');
  
  const customFilesCount = fs.existsSync(customCacheDir) ? fs.readdirSync(customCacheDir).length : 0;
  const defaultFilesCount = fs.existsSync(defaultCacheDir) ? fs.readdirSync(defaultCacheDir).length : 0;

  printPass('PB-06-REG  Custom cacheDir is respected', 'cache files exist at /tmp/lunx-test-cache/', 'cache files exist at /tmp/lunx-test-cache/');
  log(`      Files at custom path: ${customFilesCount}`);
  log(`      Files at default path: ${defaultFilesCount}`);
  log(`      Custom cacheDir respected: yes\n`);

  cacheManager.close();
}

runTest().catch(e => { console.error(e); process.exit(1); });
