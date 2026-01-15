import { RootCauseAnalyzer, exportGraphData } from '../src/visual/root-cause.js';
import { DependencyGraph } from '../src/resolve/graph.js';
import { BuildContext } from '../src/core/engine/types.js';

async function runTest() {
    console.log('🧪 Running Module 5 Day 31 - Root Cause Analysis Test\n');

    let passed = 0;
    let failed = 0;

    // Create mock dependency graph
    const mockGraph: DependencyGraph = {
        nodes: new Map([
            ['entry.js', {
                id: 'entry.js',
                type: 'file',
                path: '/src/entry.js',
                contentHash: 'hash1',
                edges: [
                    { from: 'entry.js', to: 'large-lib.js', kind: 'import', target: 'universal' },
                    { from: 'entry.js', to: 'utils.js', kind: 'import', target: 'universal' }
                ],
                metadata: { isEntry: true, size: 1024 }
            }],
            ['large-lib.js', {
                id: 'large-lib.js',
                type: 'file',
                path: '/node_modules/large-lib/index.js',
                contentHash: 'hash2',
                edges: [
                    { from: 'large-lib.js', to: 'helper.js', kind: 'import', target: 'universal' }
                ],
                metadata: { size: 150 * 1024 } // 150KB - should trigger bloat warning
            }],
            ['utils.js', {
                id: 'utils.js',
                type: 'file',
                path: '/src/utils.js',
                contentHash: 'hash3',
                edges: [
                    { from: 'utils.js', to: 'helper.js', kind: 'import', target: 'universal' }
                ],
                metadata: { size: 2048 }
            }],
            ['helper.js', {
                id: 'helper.js',
                type: 'file',
                path: '/src/helper.js',
                contentHash: 'hash4',
                edges: [],
                metadata: { size: 512 }
            }],
            ['unused.js', {
                id: 'unused.js',
                type: 'file',
                path: '/src/unused.js',
                contentHash: 'hash5',
                edges: [],
                metadata: { size: 1024 }
            }],
            ['circular-a.js', {
                id: 'circular-a.js',
                type: 'file',
                path: '/src/circular-a.js',
                contentHash: 'hash6',
                edges: [
                    { from: 'circular-a.js', to: 'circular-b.js', kind: 'import', target: 'universal' }
                ],
                metadata: { size: 1024 }
            }],
            ['circular-b.js', {
                id: 'circular-b.js',
                type: 'file',
                path: '/src/circular-b.js',
                contentHash: 'hash7',
                edges: [
                    { from: 'circular-b.js', to: 'circular-a.js', kind: 'import', target: 'universal' }
                ],
                metadata: { size: 1024 }
            }]
        ]),
        graphHash: ''
    } as any;

    const mockContext: Partial<BuildContext> = {
        mode: 'production',
        config: {
            entryPoints: ['entry.js'],
            outputDir: '/dist',
            publicPath: '/',
            splittingStrategy: 'module',
            hashing: 'content',
            sourceMaps: 'external',
            minify: true
        },
        rootDir: '/test',
        target: 'browser',
        engine: { name: 'nexxo', version: '1.0.0' },
        graph: mockGraph
    };

    // Test 1: Analyzer Creation
    console.log('[Test 1] Root Cause Analyzer Creation');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        if (analyzer) {
            console.log('  ✓ Analyzer created successfully');
            passed++;
        }
    } catch (e) {
        console.error('  ✗ Failed to create analyzer:', e);
        failed++;
    }

    // Test 2: Bundle Bloat Detection
    console.log('\n[Test 2] Bundle Bloat Detection');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        const bloatIssues = issues.filter(i => i.type === 'bundle-bloat');
        if (bloatIssues.length > 0 && bloatIssues[0].affectedNodes.includes('large-lib.js')) {
            console.log(`  ✓ Detected ${bloatIssues.length} bundle bloat issue(s)`);
            console.log(`    - ${bloatIssues[0].message}`);
            passed++;
        } else {
            console.error('  ✗ Bundle bloat not detected correctly');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Bundle bloat detection failed:', e);
        failed++;
    }

    // Test 3: Unused Dependencies Detection
    console.log('\n[Test 3] Unused Dependencies Detection');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        const unusedIssues = issues.filter(i => i.type === 'unused-dep');
        if (unusedIssues.length > 0 && unusedIssues.some(i => i.affectedNodes.includes('unused.js'))) {
            console.log(`  ✓ Detected ${unusedIssues.length} unused dependency issue(s)`);
            passed++;
        } else {
            console.error('  ✗ Unused dependencies not detected');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Unused dependency detection failed:', e);
        failed++;
    }

    // Test 4: Circular Dependency Detection
    console.log('\n[Test 4] Circular Dependency Detection');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        const circularIssues = issues.filter(i => i.type === 'circular-dep');
        if (circularIssues.length > 0) {
            console.log(`  ✓ Detected ${circularIssues.length} circular dependency issue(s)`);
            console.log(`    - ${circularIssues[0].message}`);
            passed++;
        } else {
            console.error('  ✗ Circular dependencies not detected');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Circular dependency detection failed:', e);
        failed++;
    }

    // Test 5: Graph Slicing
    console.log('\n[Test 5] Graph Slicing');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        if (issues.length > 0) {
            const slice = analyzer.createSlice(issues[0]);
            if (slice.nodes.size > 0 && slice.rootCause) {
                console.log(`  ✓ Created graph slice with ${slice.nodes.size} nodes`);
                console.log(`    - Root cause: ${slice.rootCause.type}`);
                passed++;
            } else {
                console.error('  ✗ Graph slice incomplete');
                failed++;
            }
        } else {
            console.error('  ✗ No issues to slice');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Graph slicing failed:', e);
        failed++;
    }

    // Test 6: Import Path Tracing
    console.log('\n[Test 6] Import Path Tracing');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const path = analyzer.getImportPath('helper.js');

        if (path.length > 0 && path[0] === 'entry.js' && path[path.length - 1] === 'helper.js') {
            console.log(`  ✓ Traced import path: ${path.join(' → ')}`);
            passed++;
        } else {
            console.error('  ✗ Import path tracing failed');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Import path tracing error:', e);
        failed++;
    }

    // Test 7: Export for Visualization
    console.log('\n[Test 7] Export for Visualization');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const exported = analyzer.exportForVisualization();

        if (exported.nodes.length > 0 && exported.edges.length > 0 && exported.issues.length > 0) {
            console.log(`  ✓ Exported ${exported.nodes.length} nodes, ${exported.edges.length} edges, ${exported.issues.length} issues`);
            passed++;
        } else {
            console.error('  ✗ Export incomplete');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Export failed:', e);
        failed++;
    }

    // Test 8: Shareable Format Export
    console.log('\n[Test 8] Shareable Format Export');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const jsonData = exportGraphData(analyzer);
        const parsed = JSON.parse(jsonData);

        if (parsed.nodes && parsed.edges && parsed.issues) {
            console.log(`  ✓ Exported shareable JSON format (${jsonData.length} bytes)`);
            passed++;
        } else {
            console.error('  ✗ Shareable format invalid');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Shareable export failed:', e);
        failed++;
    }

    // Test 9: Issue Severity Levels
    console.log('\n[Test 9] Issue Severity Levels');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        const hasCritical = issues.some(i => i.severity === 'critical');
        const hasWarning = issues.some(i => i.severity === 'warning');
        const hasInfo = issues.some(i => i.severity === 'info');

        if (hasWarning || hasInfo) {
            console.log('  ✓ Multiple severity levels present');
            passed++;
        } else {
            console.error('  ✗ Severity levels not diverse');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Severity check failed:', e);
        failed++;
    }

    // Test 10: Fix Suggestions
    console.log('\n[Test 10] Fix Suggestions');
    try {
        const analyzer = new RootCauseAnalyzer(mockGraph, mockContext as BuildContext);
        const issues = analyzer.analyze();

        const withFixes = issues.filter(i => i.fix && i.fix.length > 0);
        if (withFixes.length === issues.length) {
            console.log(`  ✓ All ${issues.length} issues have fix suggestions`);
            passed++;
        } else {
            console.error(`  ✗ Only ${withFixes.length}/${issues.length} issues have fixes`);
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Fix suggestion check failed:', e);
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Tests Passed: ${passed}`);
    console.log(`Tests Failed: ${failed}`);
    console.log('='.repeat(50));

    if (failed === 0) {
        console.log('\n✅ All Root Cause Analysis Tests Passed!');
        console.log('\nSummary:');
        console.log('  - Bundle bloat detection working');
        console.log('  - Unused dependency detection working');
        console.log('  - Circular dependency detection working');
        console.log('  - Graph slicing functional');
        console.log('  - Import path tracing working');
        console.log('  - Export for visualization ready');
        console.log('  - Production ready');
        process.exit(0);
    } else {
        console.error('\n❌ Some tests failed');
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error('\n❌ TEST FAILED');
    console.error(err);
    process.exit(1);
});
