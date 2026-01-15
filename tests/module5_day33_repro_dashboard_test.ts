import { ReproDashboard } from '../src/repro/dashboard.js';
import fs from 'fs/promises';
import path from 'path';

async function runTest() {
    console.log('🧪 Running Module 5 Day 33 - Repro Dashboard Test\n');

    let passed = 0;
    let failed = 0;

    const testDbPath = path.join(process.cwd(), 'tests/temp_repro.db');

    // Cleanup before test
    try {
        await fs.unlink(testDbPath);
    } catch { }

    const dashboard = new ReproDashboard(testDbPath);

    // Test 1: Initialize Dashboard
    console.log('[Test 1] Initialize Dashboard');
    try {
        dashboard.init();
        console.log('  ✓ Dashboard initialized successfully');
        passed++;
    } catch (e) {
        console.error('  ✗ Initialization failed:', e);
        failed++;
    }

    // Test 2: Submit Repro
    console.log('\n[Test 2] Submit Repro');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Test Bug',
            description: 'A test bug repro',
            code: 'const x = 1;',
            error: 'Test error'
        });

        if (reproId && reproId.startsWith('repro-')) {
            console.log(`  ✓ Repro submitted: ${reproId}`);
            passed++;
        } else {
            console.error('  ✗ Invalid repro ID');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Submit failed:', e);
        failed++;
    }

    // Test 3: Get Repro
    console.log('\n[Test 3] Get Repro');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Get Test',
            description: 'Test retrieval',
            code: 'const y = 2;'
        });

        const repro = dashboard.getRepro(reproId);

        if (repro && repro.id === reproId && repro.title === 'Get Test') {
            console.log('  ✓ Repro retrieved successfully');
            passed++;
        } else {
            console.error('  ✗ Repro retrieval failed');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Get failed:', e);
        failed++;
    }

    // Test 4: Analyze Repro
    console.log('\n[Test 4] Analyze Repro');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Analysis Test',
            description: 'Test analysis',
            code: 'import missing from "missing";',
            error: 'Cannot find module "missing"'
        });

        const startTime = Date.now();
        const analysis = await dashboard.analyzeRepro(reproId);
        const analysisTime = Date.now() - startTime;

        if (analysis && analysis.issues.length > 0 && analysisTime < 30000) {
            console.log(`  ✓ Analysis completed in ${analysisTime}ms`);
            console.log(`    - Found ${analysis.issues.length} issue(s)`);
            console.log(`    - ${analysis.suggestedFixes.length} fix suggestion(s)`);
            passed++;
        } else {
            console.error('  ✗ Analysis failed or too slow');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Analysis failed:', e);
        failed++;
    }

    // Test 5: Shareable Links
    console.log('\n[Test 5] Shareable Links');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Link Test',
            description: 'Test shareable link',
            code: 'const z = 3;'
        });

        const repro = dashboard.getRepro(reproId);

        if (repro && repro.shareableLink && repro.shareableLink.includes(reproId)) {
            console.log(`  ✓ Shareable link generated: ${repro.shareableLink}`);
            passed++;
        } else {
            console.error('  ✗ Shareable link generation failed');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Link generation failed:', e);
        failed++;
    }

    // Test 6: Get All Repros
    console.log('\n[Test 6] Get All Repros');
    try {
        const allRepros = dashboard.getAllRepros();

        if (allRepros.length > 0) {
            console.log(`  ✓ Retrieved ${allRepros.length} repro(s)`);
            passed++;
        } else {
            console.error('  ✗ No repros found');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Get all failed:', e);
        failed++;
    }

    // Test 7: Generate Template
    console.log('\n[Test 7] Generate Template');
    try {
        const reactTemplate = dashboard.generateTemplate('react');
        const vueTemplate = dashboard.generateTemplate('vue');

        if (reactTemplate.includes('React') && vueTemplate.includes('template')) {
            console.log('  ✓ Templates generated for multiple frameworks');
            passed++;
        } else {
            console.error('  ✗ Template generation failed');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Template generation failed:', e);
        failed++;
    }

    // Test 8: Replay Repro
    console.log('\n[Test 8] Replay Repro');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Replay Test',
            description: 'Test replay',
            code: 'const a = 1;'
        });

        const result = await dashboard.replayRepro(reproId);

        if (result.success) {
            console.log('  ✓ Repro replay successful');
            passed++;
        } else {
            console.error('  ✗ Repro replay failed');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Replay failed:', e);
        failed++;
    }

    // Test 9: Error Analysis
    console.log('\n[Test 9] Error Analysis');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Error Test',
            description: 'Test error analysis',
            code: 'import A from "./a"; import B from "./b";',
            error: 'Error: circular dependency detected between ./a and ./b'
        });

        const analysis = await dashboard.analyzeRepro(reproId);

        const hasCircularIssue = analysis.issues.some(i => i.type === 'circular-dep');

        if (hasCircularIssue) {
            console.log('  ✓ Circular dependency detected in analysis');
            passed++;
        } else {
            console.error('  ✗ Failed to detect circular dependency');
            failed++;
        }
    } catch (e) {
        console.error('  ✗ Error analysis failed:', e);
        failed++;
    }

    // Test 10: Database Persistence
    console.log('\n[Test 10] Database Persistence');
    try {
        const reproId = dashboard.submitRepro({
            title: 'Persistence Test',
            description: 'Test persistence',
            code: 'const persist = true;'
        });

        dashboard.close();

        // Reopen dashboard
        const dashboard2 = new ReproDashboard(testDbPath);
        dashboard2.init();

        const repro = dashboard2.getRepro(reproId);

        if (repro && repro.title === 'Persistence Test') {
            console.log('  ✓ Data persisted across sessions');
            passed++;
        } else {
            console.error('  ✗ Persistence failed');
            failed++;
        }

        dashboard2.close();
    } catch (e) {
        console.error('  ✗ Persistence test failed:', e);
        failed++;
    }

    // Cleanup
    try {
        await fs.unlink(testDbPath);
    } catch { }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Tests Passed: ${passed}`);
    console.log(`Tests Failed: ${failed}`);
    console.log('='.repeat(50));

    if (failed === 0) {
        console.log('\n✅ All Repro Dashboard Tests Passed!');
        console.log('\nSummary:');
        console.log('  - Repro submission working');
        console.log('  - Auto-analysis functional (<30s)');
        console.log('  - Shareable links generated');
        console.log('  - Database persistence working');
        console.log('  - Template generation ready');
        console.log('  - Repro replay functional');
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
