import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const detectPath = path.resolve(__dirname, '../../../packages/lunx-autoconfig/dist/detect.js');
const { detectFramework } = await import(detectPath);

function log(msg) { process.stdout.write(msg + '\n'); }

function printPass(testId, expected, actual, details = []) {
  log(`  ✅ PASS  ${testId}`);
  log(`           Expected: ${expected}`);
  log(`           Actual:   ${actual}`);
  details.forEach(d => log(`      ${d}`));
  log('');
}
function printFail(testId, expected, actual, details = []) {
  log(`  ❌ FAIL  ${testId}`);
  log(`           Expected: ${expected}`);
  log(`           Actual:   ${actual}`);
  details.forEach(d => log(`      ${d}`));
  log('');
  process.exitCode = 1;
}

const fixtureBase = path.resolve(__dirname, 'apps');

const cases = [
  { id: 'AC-01  React',     dir: 'react-app',     expected: 'react',     expectEntry: true,  expectTS: false },
  { id: 'AC-02  Vue',       dir: 'vue-app',        expected: 'vue',       expectEntry: true,  expectTS: false },
  { id: 'AC-03  Svelte',    dir: 'svelte-app',     expected: 'svelte',    expectEntry: true,  expectTS: false },
  { id: 'AC-04  Angular',   dir: 'angular-app',    expected: 'angular',   expectEntry: true,  expectTS: true  },
  { id: 'AC-05  SvelteKit', dir: 'sveltekit-app',  expected: 'sveltekit', expectEntry: true,  expectTS: false },
  { id: 'AC-06  Nuxt',      dir: 'nuxt-app',       expected: 'nuxt',      expectEntry: true,  expectTS: false },
];

log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(' PHASE 1.15 RERUN — ZERO-CONFIG AUTO-DETECTION TESTS');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

for (const c of cases) {
  const root = path.join(fixtureBase, c.dir);
  const result = detectFramework(root);

  const frameworkOk = result.framework === c.expected;
  const entryOk = c.expectEntry ? result.entryPoint !== null : true;
  const tsOk = !c.expectTS || result.isTypeScript === true;
  const allOk = frameworkOk && entryOk && tsOk;

  const details = [
    `Framework:              ${result.framework}`,
    `Confidence:             ${result.confidence}`,
    `Reason:                 ${result.reason}`,
    `EntryPoint:             ${result.entryPoint ?? 'not found'}`,
    `EntryPoint reason:      ${result.entryPointReason}`,
    `TypeScript:             ${result.isTypeScript}`,
    `TypeScript reason:      ${result.isTypeScriptReason}`,
    `Monorepo:               ${result.isMonorepo}`,
  ];

  if (allOk) {
    printPass(c.id, `framework=${c.expected} entry≠null ts=${c.expectTS}`, `framework=${result.framework} entry=${result.entryPoint} ts=${result.isTypeScript}`, details);
  } else {
    printFail(c.id, `framework=${c.expected} entry≠null ts=${c.expectTS}`, `framework=${result.framework} entry=${result.entryPoint} ts=${result.isTypeScript}`, details);
  }
}
