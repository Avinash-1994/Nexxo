
import { HMREngine } from '../src/dev/hmr-v2.js';
import { performance } from 'perf_hooks';

// Setup HMR Engine
const engine = new HMREngine('/app');

// Build a simulated graph (1000 modules)
// Structure:
// Root -> A, B, C
// A -> A1, A2...
// Leaf nodes are self-accepting components (like React/Vue components)
const DEPTH = 3;
const BREADTH = 10;
let fileCount = 0;

function buildGraph(parentId: string, currentDepth: number) {
    if (currentDepth >= DEPTH) return;

    const children: string[] = [];
    for (let i = 0; i < BREADTH; i++) {
        const id = `/app/module_${currentDepth}_${i}.ts`;
        fileCount++;
        // Leaf nodes are self-accepting (simulating components)
        const isSelfAccepting = currentDepth === DEPTH - 1;
        engine.registerModule(id, [], isSelfAccepting);
        children.push(id);

        buildGraph(id, currentDepth + 1);
    }

    // Register parent
    engine.registerModule(parentId, children, false);
}

// 1. Build Graph Benchmark
const startBuild = performance.now();
buildGraph('/app/main.ts', 0);
const timeBuild = performance.now() - startBuild;
console.log(`🚀 HMR Graph Build: ${fileCount} modules in ${timeBuild.toFixed(2)}ms`);

// 2. Propagate Update Benchmark (Leaf Node)
// Leaf nodes are self-accepting, should be instant
const leafNode = `/app/module_${DEPTH - 1}_0.ts`;
const startLeaf = performance.now();
const resultLeaf = engine.propagateUpdate(leafNode);
const timeLeaf = performance.now() - startLeaf;

console.log(`⚡ Leaf Update (Self-Accepting): ${timeLeaf.toFixed(3)}ms`);
// console.log(resultLeaf);

// 3. Propagate Update Benchmark (Bubble Up)
// Middle node, needs to bubble to parent
const middleNode = `/app/module_1_0.ts`; // Not self accepting
// We need to assume some parent imports it and the parent IS accepting for this test to be cool
// In our generated graph, main -> module_0_0 -> module_1_0
// Let's manually make module_0_0 self-accepting for this test
engine.registerModule('/app/module_0_0.ts', [middleNode], true);

const startBubble = performance.now();
const resultBubble = engine.propagateUpdate(middleNode);
const timeBubble = performance.now() - startBubble;

console.log(`⚡ Bubble Update (Parent Accepting): ${timeBubble.toFixed(3)}ms`);
// console.log(resultBubble);

// 4. Worst Case (Root Update -> Full Reload)
const startRoot = performance.now();
const resultRoot = engine.propagateUpdate('/app/main.ts');
const timeRoot = performance.now() - startRoot;

console.log(`⚡ Root Update (Full Reload): ${timeRoot.toFixed(3)}ms`);

console.log('----------------------------------------');
if (timeLeaf < 1 && timeBubble < 1) {
    console.log('✅ HMR Latency < 1ms (Target: <10ms)');
} else {
    console.log('⚠️ HMR Latency check failed');
}
