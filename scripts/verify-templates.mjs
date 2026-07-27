#!/usr/bin/env node
import { execFileSync, spawnSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLI = path.resolve(ROOT, 'dist/cli.js');  // absolute — works regardless of cwd
const TMPL_DIR = `${ROOT}/templates`;
const env = { ...process.env, LUNX_SKIP_SECURITY: '1' };

function pad(s, n) { return String(s).padEnd(n); }
function getDistStats(dir) {
  const d = `${dir}/dist`;
  if (!existsSync(d)) return { files: '-', kb: '-' };
  const all = [];
  function walk(p) { for (const f of readdirSync(p)) { const fp=`${p}/${f}`; if (statSync(fp).isDirectory()) walk(fp); else all.push(fp); } }
  walk(d);
  const size = all.reduce((s,f) => { try { return s+statSync(f).size; } catch { return s; } }, 0);
  return { files: `${all.length} files`, kb: `${(size/1024).toFixed(0)}KB` };
}

const nuclieGrep = spawnSync('grep', ['-rl', 'nuclie', TMPL_DIR], { encoding: 'utf-8' });
const nuclieFiles = (nuclieGrep.stdout || '').trim().split('\n').filter(Boolean);

const templates = readdirSync(TMPL_DIR).filter(d => statSync(`${TMPL_DIR}/${d}`).isDirectory()).sort();

console.log('┌─────────────────────────────────────────────────────────────────────────┐');
console.log('│ LUNX — REAL-WORLD TEMPLATES VERIFICATION                              │');
console.log('├──────────────────┬──────────────┬──────────────────┬───────────────────┤');
console.log('│ Framework        │ Build        │ Dist             │ nuclie            │');
console.log('├──────────────────┼──────────────┼──────────────────┼───────────────────┤');

let pass = 0, fail = 0;
for (const tmpl of templates) {
  const dir = `${TMPL_DIR}/${tmpl}`;
  const t0 = Date.now();
  let buildStatus, files, kb;
  try {
    execFileSync('node', [CLI, 'build'], { cwd: dir, timeout: 30000, stdio: 'pipe', env });
    const ms = Date.now() - t0;
    const stats = getDistStats(dir);
    files = stats.files; kb = stats.kb;
    buildStatus = `${ms}ms ✓`;
    pass++;
  } catch {
    buildStatus = 'FAIL';
    files = '-'; kb = '-';
    fail++;
  }
  const nuclie = nuclieFiles.some(f => f.includes(`/${tmpl}/`)) ? '⚠ FOUND' : 'clean ✓';
  console.log(`│ ${pad(tmpl,16)} │ ${pad(buildStatus,12)} │ ${pad(files+' '+kb,16)} │ ${pad(nuclie,17)} │`);
}
console.log('└──────────────────┴──────────────┴──────────────────┴───────────────────┘');
console.log(`\nTotal: ${templates.length} | Build pass: ${pass} | Fail: ${fail}`);
console.log(`nuclie: ${nuclieFiles.length === 0 ? '0 matches — ALL CLEAN ✓' : 'FOUND in: ' + nuclieFiles.join(', ')}`);
console.log(`\nREADY TO SHIP TEMPLATES: ${fail === 0 && nuclieFiles.length === 0 ? 'YES ✅' : 'NO — fix failures above'}`);
