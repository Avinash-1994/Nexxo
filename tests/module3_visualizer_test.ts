
/**
 * Module 3: Elite DX - Visualizer Engine Test
 * Validates Day 16 Graph Analysis Logic (Performance check)
 */

import { VisualizerEngine, HelperNode } from '../src/visual/graph-engine.js';
import { performance } from 'perf_hooks';

function generateMockGraph(count: number): HelperNode[] {
    const nodes: HelperNode[] = [];
    for (let i = 0; i < count; i++) {
        nodes.push({
            id: `module_${i}`,
            size: Math.random() * 100000, // 0-100KB
            importers: [], // Filled later
            imported: []   // Filled later
        });
    }

    // Create random edges (Sparse graph)
    // Avg degree ~5
    for (let i = 0; i < count; i++) {
        const numImports = Math.floor(Math.random() * 5);
        for (let j = 0; j < numImports; j++) {
            const targetId = Math.floor(Math.random() * count);
            if (targetId !== i) {
                nodes[i].imported.push(`module_${targetId}`);
                nodes[targetId].importers.push(`module_${i}`);
            }
        }
    }

    // Create a "Hub" manually
    const hubId = 0;
    nodes[hubId].size = 60000;
    for (let i = 1; i < 60; i++) {
        nodes[hubId].importers.push(`module_${i}`);
        nodes[i].imported.push(`module_${hubId}`);
    }

    return nodes;
}

async function runVisualizerTest() {
    console.log('🧪 Testing Visualizer Engine Performance...');

    const NODE_COUNT = 10000;
    console.log(`  Generating ${NODE_COUNT} nodes...`);
    const nodes = generateMockGraph(NODE_COUNT);

    const engine = new VisualizerEngine(nodes);

    // 1. Analysis Performance (Optimization Hints)
    const startAnalyze = performance.now();
    const hints = engine.analyze();
    const endAnalyze = performance.now();
    const analyzeTime = endAnalyze - startAnalyze;

    console.log(`  Analysis Time: ${analyzeTime.toFixed(2)}ms`);
    console.log(`  Hints Found: ${hints.length}`);

    // Check if Hub was detected
    const hubHint = hints.find(h => h.nodeId === 'module_0' && h.type === 'split');
    if (!hubHint) throw new Error('Failed to detect Hub module_0');
    console.log('  ✅ Hub Detection Verified');

    if (analyzeTime > 1000) {
        throw new Error(`Analysis too slow (>1s): ${analyzeTime}ms`);
    }

    // 2. Layout Data Generation
    const startLayout = performance.now();
    const layout = engine.generateLayoutData();
    const endLayout = performance.now();
    console.log(`  Layout Prep Time: ${(endLayout - startLayout).toFixed(2)}ms`);
    console.log(`  Nodes Prepared: ${layout.nodeCount}`);

    if (layout.nodeCount !== NODE_COUNT) throw new Error('Node count mismatch');

    console.log('---------------------------');
    console.log('🎉 Day 16 Visualizer Engine Verified!');
}

runVisualizerTest();
