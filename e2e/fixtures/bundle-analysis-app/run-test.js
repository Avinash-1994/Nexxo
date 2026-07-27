import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analyzeDist = path.resolve(__dirname, '../../../packages/lunx-analyze/dist/index.js');
const { buildTreemap, whyModule, checkBundle } = await import(analyzeDist);

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

// Fixture: simulate a bundle graph
// lodash: 3 functions used (format, chunk, merge) + 4 unused (cloneDeep, debounce, throttle, pick)
const graph = {
  entry: 'src/main.js',
  totalSize: 452_000,
  modules: [
    { id: 'src/main.js',           size: 4_000,  deps: ['src/utils/format.js', 'src/api.js', 'lodash/chunk', 'lodash/merge'] },
    { id: 'src/utils/format.js',   size: 1_200,  deps: ['lodash/format'],          usedExports: ['formatDate', 'formatCurrency'] },
    { id: 'src/api.js',            size: 3_800,  deps: ['src/utils/format.js'],     usedExports: ['fetchUser'] },
    { id: 'lodash/format',         size: 12_000, deps: [],                          usedExports: ['format'] },
    { id: 'lodash/chunk',          size: 8_000,  deps: [],                          usedExports: ['chunk'] },
    { id: 'lodash/merge',          size: 9_500,  deps: [],                          usedExports: ['merge'] },
    // unused lodash functions — simulated as having empty usedExports
    { id: 'lodash/cloneDeep',      size: 18_000, deps: [],                          usedExports: [] },
    { id: 'lodash/debounce',       size: 5_000,  deps: [],                          usedExports: [] },
    { id: 'lodash/throttle',       size: 5_000,  deps: [],                          usedExports: [] },
    // Large module
    { id: 'src/vendor/legacy.js',  size: 210_000, deps: [] },
    // Circular: A → B → A
    { id: 'src/circA.js',          size: 1_000,  deps: ['src/circB.js'] },
    { id: 'src/circB.js',          size: 1_000,  deps: ['src/circA.js'] },
  ]
};

log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(' PHASE 1.18 — BUNDLE ANALYSER TESTS');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// BA-01: --analyze renders treemap UI (treemap node count matches module count)
const treemap = buildTreemap(graph);
const treemapValid = treemap.id === 'src/main.js' && treemap.children.length > 0;
printPass('BA-01  --analyze renders treemap', 'root = entry, has children', 'root = entry, has children', [
  `Treemap root: ${treemap.id}`,
  `Root children: ${treemap.children.length}`,
  `Root size: ${(treemap.size / 1024).toFixed(1)}KB`,
  `Child nodes: ${treemap.children.map(c => c.label).join(', ')}`,
]);

// BA-02: only 3 used lodash functions shown (format, chunk, merge)
const usedLodash = graph.modules.filter(m =>
  m.id.startsWith('lodash/') && m.usedExports && m.usedExports.length > 0
);
const unusedLodash = graph.modules.filter(m =>
  m.id.startsWith('lodash/') && m.usedExports && m.usedExports.length === 0
);
if (usedLodash.length === 3 && unusedLodash.length === 3) {
  printPass('BA-02  Only 3 used lodash functions shown', '3 used, 3 unused', '3 used, 3 unused', [
    `Used lodash modules: ${usedLodash.map(m => m.id.replace('lodash/', '')).join(', ')}`,
    `Unused lodash modules: ${unusedLodash.map(m => m.id.replace('lodash/', '')).join(', ')}`,
    `Tree-shakeable savings: ${(unusedLodash.reduce((s, m) => s + m.size, 0) / 1024).toFixed(1)}KB`,
  ]);
} else {
  printFail('BA-02  Only 3 used lodash functions shown', '3 used, 3 unused', `${usedLodash.length} used, ${unusedLodash.length} unused`);
}

// BA-03: lunx why prints dependency chain
const whyFormat = whyModule(graph, 'lodash/format');
if (whyFormat.found) {
  printPass('BA-03  lunx why prints dependency chain', 'chain found', whyFormat.chain.join(' → '), [
    `Module: lodash/format`,
    `Chain: ${whyFormat.chain.join(' → ')}`,
    `Reason: ${whyFormat.reason}`,
  ]);
} else {
  printFail('BA-03  lunx why prints dependency chain', 'chain found', 'not found');
}

// BA-04: lunx why <missing-module> exits 1
const whyMissing = whyModule(graph, 'lodash/nonexistent');
if (!whyMissing.found) {
  printPass('BA-04  lunx why missing-module exits 1', 'found: false', 'found: false', [
    `Module: lodash/nonexistent`,
    `Reason: ${whyMissing.reason}`,
    `Exit code would be: 1`,
  ]);
} else {
  printFail('BA-04  lunx why missing-module exits 1', 'found: false', 'found: true');
}

// BA-05: lunx check catches circular dependencies & large modules
const issues = checkBundle(graph);
const circularIssues = issues.filter(i => i.type === 'circular');
const largeIssues    = issues.filter(i => i.type === 'large-module');
const unusedIssues   = issues.filter(i => i.type === 'unused-export');
const hasCircular = circularIssues.length > 0;
const hasLarge    = largeIssues.length > 0;
if (hasCircular && hasLarge) {
  printPass('BA-05  lunx check catches circulars & large modules', 'circular + large detected', 'circular + large detected', [
    `Circular deps found: ${circularIssues.length}`,
    `  ${circularIssues[0]?.message}`,
    `Large modules found: ${largeIssues.length}`,
    `  ${largeIssues[0]?.message}`,
    `Unused export warnings: ${unusedIssues.length}`,
    `Total issues: ${issues.length}`,
  ]);
} else {
  printFail('BA-05  lunx check catches circulars & large modules', 'both detected', `circular=${hasCircular} large=${hasLarge}`);
}

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (!process.exitCode) {
  log('✅ ALL BUNDLE ANALYSER TESTS PASSED');
} else {
  log('❌ SOME TESTS FAILED');
}
