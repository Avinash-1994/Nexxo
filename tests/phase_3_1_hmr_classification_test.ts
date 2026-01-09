/**
 * Phase 3.1: HMR Classification Tests
 * Tests for intelligent HMR decision engine
 */

import { HMRClassifier, HMRLevel, type FileChange } from '../src/hmr/classifier.js';
import { strict as assert } from 'assert';

async function testConfigFileDetection() {
    console.log('\n[Test 1] HMR - Config File Detection');

    const classifier = new HMRClassifier();

    const configChange: FileChange = {
        path: 'nexxo.config.ts',
        type: 'updated'
    };

    const decision = classifier.classify(configChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_FULL_RELOAD);
    assert.ok(decision.reason.includes('Configuration'));
    assert.deepStrictEqual(decision.affectedModules, ['*']);

    console.log('✅ Config file triggers full reload');
}

async function testEntryPointDetection() {
    console.log('\n[Test 2] HMR - Entry Point Detection');

    const classifier = new HMRClassifier();

    const entryChange: FileChange = {
        path: 'src/main.ts',
        type: 'updated'
    };

    const decision = classifier.classify(entryChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_FULL_RELOAD);
    assert.ok(decision.reason.includes('Entry point'));

    console.log('✅ Entry point triggers full reload');
}

async function testCSSHotReload() {
    console.log('\n[Test 3] HMR - CSS Safe Update');

    const classifier = new HMRClassifier();

    const cssChange: FileChange = {
        path: 'src/styles/App.css',
        type: 'updated'
    };

    const decision = classifier.classify(cssChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_SAFE);
    assert.ok(decision.reason.includes('Stylesheet'));
    assert.deepStrictEqual(decision.affectedModules, ['src/styles/App.css']);

    console.log('✅ CSS changes are safe updates');
}

async function testImageAssetUpdate() {
    console.log('\n[Test 4] HMR - Image Asset Update');

    const classifier = new HMRClassifier();

    const imageChange: FileChange = {
        path: 'src/assets/logo.png',
        type: 'updated'
    };

    const decision = classifier.classify(imageChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_SAFE);
    assert.ok(decision.reason.includes('Image asset'));

    console.log('✅ Image assets are safe updates');
}

async function testComponentPartialUpdate() {
    console.log('\n[Test 5] HMR - Component Partial Update');

    const classifier = new HMRClassifier();

    const componentChange: FileChange = {
        path: 'src/components/Button.tsx',
        type: 'updated'
    };

    const decision = classifier.classify(componentChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_PARTIAL);
    assert.ok(decision.reason.includes('partial'));

    console.log('✅ Component changes trigger partial HMR');
}

async function testGraphAnalysisIsolated() {
    console.log('\n[Test 6] HMR - Graph Analysis (Isolated Change)');

    const classifier = new HMRClassifier();

    // Create a simple dependency graph
    const graph = new Map<string, Set<string>>();
    graph.set('src/components/Button.tsx', new Set(['src/utils/styles.ts']));
    graph.set('src/App.tsx', new Set(['src/components/Button.tsx']));

    const componentChange: FileChange = {
        path: 'src/components/Button.tsx',
        type: 'updated'
    };

    const decision = classifier.classify(componentChange, graph);

    assert.strictEqual(decision.level, HMRLevel.HMR_PARTIAL);
    assert.ok(decision.affectedModules.includes('src/components/Button.tsx'));
    assert.ok(decision.affectedModules.includes('src/App.tsx'));

    console.log('✅ Graph analysis detects isolated changes');
}

async function testCircularDependencyDetection() {
    console.log('\n[Test 7] HMR - Circular Dependency Detection');

    const classifier = new HMRClassifier();

    // Create a circular dependency graph
    const graph = new Map<string, Set<string>>();
    graph.set('src/A.ts', new Set(['src/B.ts']));
    graph.set('src/B.ts', new Set(['src/C.ts']));
    graph.set('src/C.ts', new Set(['src/A.ts'])); // Circular!

    const change: FileChange = {
        path: 'src/A.ts',
        type: 'updated'
    };

    const decision = classifier.classify(change, graph);

    assert.strictEqual(decision.level, HMRLevel.HMR_FULL_RELOAD);
    assert.ok(decision.reason.includes('Circular dependency'));
    assert.ok(decision.suggestedOptimizations);
    assert.ok(decision.suggestedOptimizations.some(opt => opt.includes('circular')));

    console.log('✅ Circular dependencies trigger full reload');
}

async function testBatchClassification() {
    console.log('\n[Test 8] HMR - Batch Classification');

    const classifier = new HMRClassifier();

    const changes: FileChange[] = [
        { path: 'src/styles/App.css', type: 'updated' },
        { path: 'src/styles/Button.css', type: 'updated' },
        { path: 'src/assets/icon.svg', type: 'updated' }
    ];

    const decision = classifier.classifyBatch(changes);

    assert.strictEqual(decision.level, HMRLevel.HMR_SAFE);
    assert.ok(decision.reason.includes('safe update'));
    assert.strictEqual(decision.affectedModules.length, 3);

    console.log('✅ Batch classification works correctly');
}

async function testBatchWithFullReload() {
    console.log('\n[Test 9] HMR - Batch with Full Reload');

    const classifier = new HMRClassifier();

    const changes: FileChange[] = [
        { path: 'src/styles/App.css', type: 'updated' },
        { path: 'nexxo.config.ts', type: 'updated' }, // Config file!
        { path: 'src/components/Button.tsx', type: 'updated' }
    ];

    const decision = classifier.classifyBatch(changes);

    assert.strictEqual(decision.level, HMRLevel.HMR_FULL_RELOAD);
    assert.ok(decision.reason.includes('full reload'));
    assert.deepStrictEqual(decision.affectedModules, ['*']);

    console.log('✅ Batch with config change triggers full reload');
}

async function testOptimizationSuggestions() {
    console.log('\n[Test 10] HMR - Optimization Suggestions');

    const classifier = new HMRClassifier();

    // Create a graph with many dependents
    const graph = new Map<string, Set<string>>();
    const utilFile = 'src/utils/common.ts';

    // 15 files depend on common.ts
    for (let i = 0; i < 15; i++) {
        graph.set(`src/components/Component${i}.tsx`, new Set([utilFile]));
    }

    const change: FileChange = {
        path: utilFile,
        type: 'updated'
    };

    const decision = classifier.classify(change, graph);

    // Should be partial HMR (not isolated due to many dependents)
    assert.strictEqual(decision.level, HMRLevel.HMR_PARTIAL);
    assert.ok(decision.suggestedOptimizations);
    assert.ok(decision.suggestedOptimizations.some(opt => opt.includes('code splitting')));

    console.log('✅ Optimization suggestions generated for high-impact changes');
}

async function testDeletedFileHandling() {
    console.log('\n[Test 11] HMR - Deleted File Handling');

    const classifier = new HMRClassifier();

    const deleteChange: FileChange = {
        path: 'src/components/OldComponent.tsx',
        type: 'deleted'
    };

    const decision = classifier.classify(deleteChange);

    assert.strictEqual(decision.level, HMRLevel.HMR_PARTIAL);
    assert.strictEqual(decision.graphChanges[0].type, 'removed');

    console.log('✅ Deleted files handled correctly');
}

async function testSCSSAndLessFiles() {
    console.log('\n[Test 12] HMR - SCSS and Less Files');

    const classifier = new HMRClassifier();

    const scssChange: FileChange = {
        path: 'src/styles/theme.scss',
        type: 'updated'
    };

    const lessChange: FileChange = {
        path: 'src/styles/variables.less',
        type: 'updated'
    };

    const scssDecision = classifier.classify(scssChange);
    const lessDecision = classifier.classify(lessChange);

    assert.strictEqual(scssDecision.level, HMRLevel.HMR_SAFE);
    assert.strictEqual(lessDecision.level, HMRLevel.HMR_SAFE);

    console.log('✅ SCSS and Less files are safe updates');
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 3.1: HMR Classification - Test Suite');
    console.log('='.repeat(60));

    try {
        await testConfigFileDetection();
        await testEntryPointDetection();
        await testCSSHotReload();
        await testImageAssetUpdate();
        await testComponentPartialUpdate();
        await testGraphAnalysisIsolated();
        await testCircularDependencyDetection();
        await testBatchClassification();
        await testBatchWithFullReload();
        await testOptimizationSuggestions();
        await testDeletedFileHandling();
        await testSCSSAndLessFiles();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED (12/12)');
        console.log('='.repeat(60));
        console.log('\nPhase 3.1 HMR Classification is VERIFIED and READY');

        return true;
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
});
