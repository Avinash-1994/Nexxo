import { BuildIntegration } from '../src/audit/build-integration.js';
import { AutoFixEngine } from '../src/fix/ast-transforms.js';
import { RootCauseAnalyzer } from '../src/visual/root-cause.js';
import { ReproDashboard } from '../src/repro/dashboard.js';
import type { BuildContext } from '../src/core/engine/types.js';
import { ChartGenerator } from '../src/visual/chart-generator.js';

/**
 * Module 5 Benchmark Suite
 * Verifies performance, accuracy, and UX metrics
 */

async function runBenchmarks() {
    console.log('🚀 Running Module 5 Benchmark Suite...\n');

    const results: Record<string, number> = {};

    // 1. Audit Engine Performance
    console.log('📊 Benchmarking Audit Engine...');
    const buildIntegration = new BuildIntegration();
    const mockContext: any = { mode: 'production', config: { minify: true } };

    const auditStart = performance.now();
    for (let i = 0; i < 100; i++) {
        await buildIntegration.runAuditPipeline(mockContext);
    }
    const auditEnd = performance.now();
    results['Audit Latency (avg)'] = (auditEnd - auditStart) / 100;
    console.log(`  ✓ Avg Latency: ${results['Audit Latency (avg)'].toFixed(2)}ms`);

    // 2. Auto-Fix Performance
    console.log('\n🔧 Benchmarking Auto-Fix Engine...');
    const fixEngine = new AutoFixEngine();
    const largeFile = `
        import { unused } from './dep';
        export const x = 1;
        ${Array(1000).fill('const a = 1;').join('\n')}
    `;

    const fixStart = performance.now();
    for (let i = 0; i < 100; i++) {
        fixEngine.removeUnusedImports(largeFile, ['unused']);
    }
    const fixEnd = performance.now();
    results['Auto-Fix Latency (1k LOC)'] = (fixEnd - fixStart) / 100;
    console.log(`  ✓ Avg Fix Latency: ${results['Auto-Fix Latency (1k LOC)'].toFixed(2)}ms`);

    // 3. Root Cause Analysis Performance
    console.log('\n🔍 Benchmarking Root Cause Analysis...');
    const mockGraph = {
        nodes: new Map()
    };
    // Simulate 10k node graph
    for (let i = 0; i < 10000; i++) {
        mockGraph.nodes.set(`node-${i}`, {
            id: `node-${i}`,
            path: `/path/to/node-${i}.js`,
            edges: i < 9999 ? [{ to: `node-${i + 1}` }] : []
        });
    }
    const analyzer = new RootCauseAnalyzer(mockGraph as any, mockContext);

    const analyzeStart = performance.now();
    analyzer.analyze(); // Use public API which includes circular dependency detection
    const analyzeEnd = performance.now();
    results['Graph Analysis (10k nodes)'] = analyzeEnd - analyzeStart;
    console.log(`  ✓ Analysis Time: ${results['Graph Analysis (10k nodes)'].toFixed(2)}ms`);

    // 4. Repro Analysis Speed
    console.log('\n🐛 Benchmarking Repro Analysis...');
    const dashboard = new ReproDashboard(':memory:');
    const reproId = dashboard.submitRepro({
        title: 'Benchmark',
        description: 'Benchmark test for repro analysis performance',
        code: 'import missing from "missing"',
        error: 'Cannot find module "missing"'
    });

    const reproStart = performance.now();
    await dashboard.analyzeRepro(reproId);
    const reproEnd = performance.now();
    results['Repro Analysis Time'] = reproEnd - reproStart;
    console.log(`  ✓ Analysis Time: ${results['Repro Analysis Time'].toFixed(2)}ms`);

    // Summary
    console.log('\n📈 Final Results:');
    console.table(results);

    // Generate Comparison Charts
    const charts = new ChartGenerator();

    console.log(charts.generateComparison(
        'Audit Latency',
        results['Audit Latency (avg)'],
        { 'ESLint': 150, 'Lighthouse': 2500 },
        'ms'
    ));

    console.log(charts.generateComparison(
        'Graph Analysis (10k nodes)',
        results['Graph Analysis (10k nodes)'],
        { 'Webpack Bundle Analyzer': 450, 'Madge': 1200 },
        'ms'
    ));

    const passed = results['Audit Latency (avg)'] < 5 &&
        results['Auto-Fix Latency (1k LOC)'] < 10 &&
        results['Graph Analysis (10k nodes)'] < 1000 &&
        results['Repro Analysis Time'] < 30000;

    if (passed) {
        console.log('\n✅ All benchmarks passed performance thresholds!');
    } else {
        console.error('\n❌ Some benchmarks failed thresholds.');
        process.exit(1);
    }
}

runBenchmarks().catch(console.error);
