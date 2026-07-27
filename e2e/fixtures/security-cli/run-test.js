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
log(' PHASE 3.4 — SECURITY CLI COMMANDS');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ──────────────────────────────────────────────────────────
// SEC-07  security fix — process.env rewrite
// ──────────────────────────────────────────────────────────
{
  fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'src', 'index.js'), 'const api = process.env.API_KEY;\nconsole.log(process.env.DEBUG);');
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify({ name: 'test' }));

  const res = spawnSync('node', [cliPath, 'security', 'fix'], { cwd: __dirname, encoding: 'utf8' });
  const allOut = res.stdout + res.stderr;
  
  const modifiedContent = fs.readFileSync(path.join(__dirname, 'src', 'index.js'), 'utf8');
  const ok = modifiedContent.includes('import.meta.env.API_KEY') && !modifiedContent.includes('process.env.API_KEY') && allOut.includes('Rewrote process.env');

  (ok ? pass : fail)('SEC-07  security fix (process.env rewrite)', 'process.env rewritten to import.meta.env', ok ? 'rewritten ✓' : 'not rewritten', [
    `File:                 src/index.js`,
    `Content before:       const api = process.env.API_KEY;`,
    `Content after:        ${modifiedContent.split('\\n')[0]}`,
    `CLI output:           ${allOut.split('\\n').find(l => l.includes('Successfully rewrote'))?.trim() || 'missing'}`,
    `Exit code:            ${res.status}`
  ]);
}

// ──────────────────────────────────────────────────────────
// SEC-08  security plugin-audit
// ──────────────────────────────────────────────────────────
{
  fs.mkdirSync(path.join(__dirname, 'node_modules', '@lunx', 'plugin-malicious'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'node_modules', '@lunx', 'plugin-malicious', 'package.json'), JSON.stringify({
    name: '@lunx/plugin-malicious',
    lunx: { permissions: ['exec:spawn', 'fs:write'] }
  }));

  const res = spawnSync('node', [cliPath, 'security', 'plugin-audit'], { cwd: __dirname, encoding: 'utf8' });
  const allOut = res.stdout + res.stderr;
  
  const ok = allOut.includes('DANGEROUS') && allOut.includes('@lunx/plugin-malicious') && allOut.includes('exec:spawn');

  (ok ? pass : fail)('SEC-08  security plugin-audit', 'detects DANGEROUS permissions', ok ? 'detected ✓' : 'not detected', [
    `Plugin scanned:       @lunx/plugin-malicious`,
    `Permissions:          exec:spawn, fs:write`,
    `Audit CLI output:     ${allOut.split('\\n').find(l => l.includes('plugin-malicious'))?.trim() || 'missing'}`,
    `Exit code:            ${res.status}`
  ]);
}
