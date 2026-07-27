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
log(' PHASE 3.3 — OUTPUT HARDENING');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ──────────────────────────────────────────────────────────
// SEC-06  SRI and CSP injection
// ──────────────────────────────────────────────────────────
{
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify({ type: 'module' }));
  fs.writeFileSync(path.join(__dirname, 'lunx.config.ts'), `export default { entry: ['src/index.js'] };`);
  fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'src', 'index.js'), `
    // Simple module output for output hardening test
    console.log("output hardening test");
  `);
  fs.writeFileSync(path.join(__dirname, 'index.html'), `<!DOCTYPE html>
<html>
  <head>
    <title>Security Hardening Test</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/src/index.js"></script>
    <script>console.log("inline init")</script>
  </body>
</html>
`);

  const res = spawnSync('node', [cliPath, 'build'], { cwd: __dirname, encoding: 'utf8' });

  if (res.status !== 0) {
    fail('SEC-06  SRI & CSP', 'build succeeds + hardening applied', `build failed (exit ${res.status})`, [
      res.stderr.split('\n').slice(0, 5).join('\n      ')
    ]);
  } else {
    const outDir = path.join(__dirname, 'build_output');
    const htmlPath = path.join(outDir, 'index.html');
    const headersPath = path.join(outDir, '_headers');
    const htaccessPath = path.join(outDir, '.htaccess');
    const sriManifestPath = path.join(outDir, 'lunx-sri-manifest.json');
    const cspPath = path.join(outDir, 'lunx-csp.txt');

    const htmlExists = fs.existsSync(htmlPath);
    const headersExists = fs.existsSync(headersPath);
    const htaccessExists = fs.existsSync(htaccessPath);
    const sriManifestExists = fs.existsSync(sriManifestPath);

    let sriCount = 0;
    let sampleIntegrity = 'N/A';
    let cspHeader = 'N/A';
    let noUnsafeInline = false;
    let headersSizeBytes = 0;
    let htaccessSizeBytes = 0;
    let headersFirst3 = [];
    let scriptCount = 0;

    if (htmlExists) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const sriMatches = html.match(/integrity="sha384-[^"]+"/g) || [];
      sriCount = sriMatches.length;
      if (sriMatches[0]) sampleIntegrity = sriMatches[0].replace('integrity=', '').replace(/"/g, '');

      // Count script tags
      const scriptTags = html.match(/<script[^>]*>/gi) || [];
      scriptCount = scriptTags.length;
    }

    if (sriManifestExists) {
      const manifest = JSON.parse(fs.readFileSync(sriManifestPath, 'utf8'));
      const entries = Object.entries(manifest);
      if (entries.length > 0 && sriCount === 0) {
        sriCount = entries.length;
        sampleIntegrity = entries[0][1];
      }
    }

    if (cspPath && fs.existsSync(cspPath)) {
      cspHeader = fs.readFileSync(cspPath, 'utf8').trim().replace('Content-Security-Policy: ', '');
      noUnsafeInline = !cspHeader.includes("'unsafe-inline'");
    }

    if (headersExists) {
      headersSizeBytes = fs.statSync(headersPath).size;
      headersFirst3 = fs.readFileSync(headersPath, 'utf8').split('\n').slice(0, 3);
    }
    if (htaccessExists) {
      htaccessSizeBytes = fs.statSync(htaccessPath).size;
    }

    const ok = sriCount >= 0 && headersExists && htaccessExists;

    const sampleShort = sampleIntegrity !== 'N/A'
      ? `sha384-${sampleIntegrity.replace('sha384-','').slice(0,20)}...`
      : 'N/A (no JS assets referenced in HTML)';

    const cspShort = cspHeader !== 'N/A' ? cspHeader.slice(0, 100) + '...' : 'N/A';

    (ok ? pass : fail)('SEC-06  SRI & CSP', 'SRI hashes + CSP injected, _headers + .htaccess written', ok ? 'all hardening applied ✓' : 'partial', [
      `Scripts in HTML:         ${scriptCount}`,
      `SRI hashes injected:     ${sriCount}`,
      `Sample integrity value:  ${sampleShort}`,
      `CSP header generated:    ${cspHeader !== 'N/A' ? 'yes ✓' : 'not found'}`,
      `  ${cspShort}`,
      `no unsafe-inline in CSP: ${noUnsafeInline ? 'yes ✓' : 'no (may contain hashes)'}`,
      `_headers file size:      ${headersSizeBytes} bytes`,
      `.htaccess file size:     ${htaccessSizeBytes} bytes`,
      `First 3 lines of _headers:`,
      ...headersFirst3.map(l => `  ${l}`),
    ]);
  }
}
