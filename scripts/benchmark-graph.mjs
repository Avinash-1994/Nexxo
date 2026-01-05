/**
 * Benchmark: Rust vs JavaScript Graph Analyzer
 * 
 * Compares performance of graph operations
 */

import { JSGraphAnalyzer } from '../dist/core/graph/js-graph-analyzer.js';
import kleur from 'kleur';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Try to import Rust native module
let RustGraphAnalyzer = null;
let nativeModule = null;
let hasRust = false;

try {
    nativeModule = require('../urja_native.node');
    RustGraphAnalyzer = nativeModule.GraphAnalyzer;
    hasRust = true;
    console.log(kleur.green('✅ Rust native module loaded'));
} catch (e) {
    console.log(kleur.yellow('⚠️  Rust native module not available: ' + e.message));
}

function generateTestGraph(nodeCount, edgeDensity) {
    const graph = new Map();
    for (let i = 0; i < nodeCount; i++) {
        const deps = [];
        const depCount = Math.floor(nodeCount * edgeDensity);
        for (let j = 0; j < depCount; j++) {
            const depId = ((i + j + 1) % nodeCount).toString();
            deps.push(depId);
        }
        graph.set(i.toString(), deps);
    }
    return graph;
}

function benchmarkCycleDetection(nodeCount, edgeDensity) {
    const graph = generateTestGraph(nodeCount, edgeDensity);

    // JS Benchmark
    const jsAnalyzer = new JSGraphAnalyzer();
    const jsLoadStart = performance.now();
    for (const [id, deps] of graph.entries()) {
        jsAnalyzer.addNode(id, deps);
    }
    const jsLoadTime = performance.now() - jsLoadStart;

    let jsTime = 0;
    let jsFailed = false;

    try {
        const jsStart = performance.now();
        jsAnalyzer.detectCycles();
        jsTime = performance.now() - jsStart;
    } catch (e) {
        jsFailed = true;
    }

    const result = {
        operation: 'Cycle Detection',
        nodeCount,
        edgeCount: jsAnalyzer.edgeCount(),
        jsTime,
        jsLoadTime,
        jsFailed
    };

    if (hasRust && RustGraphAnalyzer) {
        // Rust Benchmark
        const rustAnalyzer = new RustGraphAnalyzer();
        const ids = [];
        const edges = [];
        for (const [id, deps] of graph.entries()) {
            ids.push(id);
            edges.push(deps);
        }

        const loadStart = performance.now();
        if (rustAnalyzer.addBatch) {
            rustAnalyzer.addBatch(ids, edges);
        } else {
            for (let i = 0; i < ids.length; i++) {
                rustAnalyzer.addNode(ids[i], edges[i]);
            }
        }
        const loadTime = performance.now() - loadStart;

        const rustStart = performance.now();
        rustAnalyzer.detectCycles();
        const rustTime = performance.now() - rustStart;

        result.rustTime = rustTime;
        result.loadTime = loadTime;
        result.speedup = jsFailed ? Infinity : (jsTime / rustTime);

        // Internal Rust Benchmark
        if (nativeModule && nativeModule.benchmarkGraphAnalysis) {
            const internalTime = nativeModule.benchmarkGraphAnalysis(nodeCount, edgeDensity) * 1000;
            result.rustInternalTime = internalTime;
            result.internalSpeedup = jsFailed ? Infinity : (jsTime / internalTime);
        }
    }

    return result;
}

function displayResults(results) {
    console.log('\n' + kleur.bold().cyan('═'.repeat(140)));
    console.log(kleur.bold().cyan('  📊 RUST vs JAVASCRIPT GRAPH ANALYZER BENCHMARK (With Batch Loading)'));
    console.log(kleur.bold().cyan('═'.repeat(140)) + '\n');

    console.log(kleur.bold(
        'Operation'.padEnd(20) +
        'Nodes'.padEnd(10) +
        'Edges'.padEnd(10) +
        'JS(ms)'.padEnd(12) +
        'Rust(ms)'.padEnd(10) +
        'Load(ms)'.padEnd(10) +
        'Int(ms)'.padEnd(10) +
        'Speedup'
    ));
    console.log('─'.repeat(140));

    for (const result of results) {
        const operation = result.operation.padEnd(20);
        const nodes = result.nodeCount.toString().padEnd(10);
        const edges = result.edgeCount.toString().padEnd(10);

        let jsTime = result.jsTime.toFixed(2);
        if (result.jsFailed) jsTime = kleur.red('CRASHED');
        jsTime = jsTime.padEnd(12);

        const rustTime = result.rustTime ? result.rustTime.toFixed(2).padEnd(10) : 'N/A'.padEnd(10);
        const loadTime = result.loadTime ? result.loadTime.toFixed(2).padEnd(10) : 'N/A'.padEnd(10);
        const internalTime = result.rustInternalTime ? result.rustInternalTime.toFixed(2).padEnd(10) : 'N/A'.padEnd(10);

        let speedupText = 'N/A';
        if (result.speedup === Infinity) {
            speedupText = '∞ (Stable)';
        } else if (result.speedup) {
            speedupText = `${result.speedup.toFixed(2)}x`;
        }

        const internalSpeedup = result.internalSpeedup ?
            (result.internalSpeedup === Infinity ? '∞' : `${result.internalSpeedup.toFixed(2)}x`)
            : 'N/A';

        const speedupColor = (result.speedup && result.speedup > 1.0) || result.speedup === Infinity ? kleur.green : kleur.white;

        console.log(
            operation +
            nodes +
            edges +
            jsTime +
            rustTime +
            loadTime +
            internalTime +
            speedupColor(speedupText) +
            (result.internalSpeedup ? kleur.dim(` (Int: ${internalSpeedup})`) : '')
        );
    }

    console.log('─'.repeat(140));
}

async function runBenchmarks() {
    const results = [];
    console.log(kleur.bold('\n🔬 Running benchmarks with REALISTIC density (10 edges/node)...\n'));

    console.log(kleur.dim('Testing 1,000 nodes...'));
    results.push(benchmarkCycleDetection(1000, 0.01));

    console.log(kleur.dim('Testing 10,000 nodes...'));
    results.push(benchmarkCycleDetection(10000, 0.001));

    console.log(kleur.dim('Testing 50,000 nodes...'));
    results.push(benchmarkCycleDetection(50000, 0.0002));

    displayResults(results);
}

runBenchmarks().catch(console.error);
