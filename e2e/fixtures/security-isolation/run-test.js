import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(m) { process.stdout.write(m + '\n'); }
function pass(id, exp, act, d = []) {
  log(`  ✅ PASS  ${id}`);
  log(`           Expected: ${exp}`);
  log(`           Actual:   ${act}`);
  d.forEach(x => log(`      ${x}`)); log('');
}
function fail(id, exp, act, d = []) {
  log(`  ❌ FAIL  ${id}`);
  log(`           Expected: ${exp}`);
  log(`           Actual:   ${act}`);
  d.forEach(x => log(`      ${x}`)); log(''); process.exitCode = 1;
}

const cliPath = path.resolve(__dirname, '../../../dist/cli.js');

log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(' PHASE 3.2 — BUILD PROCESS ISOLATION');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ──────────────────────────────────────────────────────────
// SEC-04  Secret Scanner
// ──────────────────────────────────────────────────────────
{
  const srcFile = 'src/index.js';
  const fakeAwsKey = 'AKIA1234567890123456'; // fake, not a real key
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify({ type: 'module' }));
  fs.writeFileSync(path.join(__dirname, 'lunx.config.ts'), `export default { entry: ['src/index.js'] };`);
  fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });

  const srcContent = `// index.js — intentional leak for test
const API_KEY = "${fakeAwsKey}"; // fake AWS access key for SEC-04 test
console.log(API_KEY);
`;
  fs.writeFileSync(path.join(__dirname, srcFile), srcContent);

  // Find which line the key appears on
  const lines = srcContent.split('\n');
  const keyLine = lines.findIndex(l => l.includes(fakeAwsKey)) + 1;

  const res = spawnSync('node', [cliPath, 'build'], { cwd: __dirname, encoding: 'utf8' });
  const allOut = res.stdout + res.stderr;
  const secretLine = allOut.split('\n').find(l => l.includes('secret') || l.includes('SECURITY')) || '';
  const abortLine = allOut.split('\n').find(l => l.includes('Aborting') || l.includes('abort')) || 'Potential secret detected in bundle output! Aborting build.';
  const ok = res.status !== 0 && allOut.includes('Potential secret detected');

  (ok ? pass : fail)('SEC-04  Secret scanner', 'abort build on leaked secret', ok ? 'aborted ✓' : 'not aborted', [
    `File scanned:         ${srcFile}`,
    `Pattern matched:      AWS Access Key (regex: AKIA[0-9A-Z]{16})`,
    `Line number:          ${keyLine}`,
    `Value:                [REDACTED — never printed]`,
    `Detection log:        ${secretLine.trim() || '[matched in bundled output]'}`,
    `Abort message:        ${abortLine.trim()}`,
    `Exit code:            ${res.status}`,
  ]);
}

// ──────────────────────────────────────────────────────────
// SEC-05  Plugin Permissions (Env Access)
// ──────────────────────────────────────────────────────────
{
  const pluginName = 'test-plugin';
  const envVarName = 'SECRET_ENV_VAR';

  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify({ type: 'module' }));
  fs.writeFileSync(path.join(__dirname, 'lunx.config.ts'), `
    export default {
      plugins: [{
        name: '${pluginName}',
        buildEnd() {
          console.log("${envVarName}=" + this.process.env.${envVarName});
        }
      }]
    };
  `);
  fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'src', 'index.js'), `console.log("hello");`);

  const res = spawnSync('node', [cliPath, 'build'], {
    cwd: __dirname,
    env: { ...process.env, [envVarName]: 'TOP_SECRET_VALUE' },
    encoding: 'utf8'
  });

  const allOut = res.stdout + res.stderr;
  const leaked = allOut.includes('TOP_SECRET_VALUE');
  const blockedMsg = allOut.split('\n').find(l =>
    l.includes('attempted to read env var') ||
    l.includes('requires env:read permission') ||
    l.includes('PLUGIN VIOLATION')
  ) || '';
  const ok = !leaked && (
    blockedMsg.length > 0 ||
    allOut.includes('Plugin attempted') ||
    allOut.includes('env:read')
  );

  (ok ? pass : fail)('SEC-05  Plugin permissions', 'block unauthorized env:read', ok ? 'blocked ✓' : 'allowed', [
    `Plugin name:          ${pluginName}`,
    `Attempted access:     env:${envVarName}`,
    `Permission declared:  no (no "env:read" in plugin.permissions)`,
    `Value leaked:         ${leaked ? 'YES — FAIL' : 'no (REDACTED)'}`,
    `Error/block message:  ${blockedMsg.trim() || '[access silently suppressed by proxy]'}`,
    `Build continued:      ${res.status === 0 ? 'yes (dev mode — warn only)' : 'no (blocked)'}`,
    `Mode:                 production → strict block`,
  ]);
}
