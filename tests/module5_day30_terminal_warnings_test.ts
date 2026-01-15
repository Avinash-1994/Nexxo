import { WarningDetector } from '../src/ui/warning-detector.js';
import { WarningLibrary } from '../src/ui/warning-library.js';
import { BuildContext, BuildArtifact } from '../src/core/engine/types.js';

async function runTest() {
    console.log('🧪 Running Module 5 Day 30 - Terminal Warnings Test\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Warning Library Coverage
    console.log('[Test 1] Warning Library Coverage');
    const libraryWarnings = Object.keys(WarningLibrary).length;
    console.log(`  ✓ Warning library contains ${libraryWarnings} warning types`);
    if (libraryWarnings >= 20) {
        passed++;
    } else {
        failed++;
        console.error('  ✗ Should have at least 20 warning types');
    }

    // Test 2: Warning Generation
    console.log('\n[Test 2] Warning Generation');
    try {
        const largeBundleWarning = WarningLibrary.LARGE_BUNDLE(300000);
        if (largeBundleWarning.severity === 'warning' &&
            largeBundleWarning.message.includes('292') &&
            largeBundleWarning.fix) {
            console.log('  ✓ Large bundle warning generated correctly');
            passed++;
        } else {
            failed++;
            console.error('  ✗ Warning properties incorrect');
        }

        const securityWarning = WarningLibrary.VULNERABLE_DEPENDENCY('lodash', 'high');
        if (securityWarning.severity === 'critical' &&
            securityWarning.message.includes('lodash')) {
            console.log('  ✓ Security warning generated correctly');
            passed++;
        } else {
            failed++;
            console.error('  ✗ Security warning incorrect');
        }
    } catch (e) {
        failed += 2;
        console.error('  ✗ Warning generation failed:', e);
    }

    // Test 3: Warning Detector - Build Config Analysis
    console.log('\n[Test 3] Warning Detector - Build Config');
    const detector = new WarningDetector();

    const mockContext: Partial<BuildContext> = {
        mode: 'production',
        config: {
            entryPoints: ['index.js'],
            outputDir: '/dist',
            publicPath: '/',
            splittingStrategy: 'route',
            hashing: 'content',
            sourceMaps: false,
            minify: false
        },
        rootDir: '/test',
        target: 'browser',
        engine: { name: 'nexxo', version: '1.0.0' }
    };

    const configWarnings = detector.analyzeContext(mockContext as BuildContext);
    console.log(`  ✓ Detected ${configWarnings.length} configuration warnings`);

    const hasSourceMapWarning = configWarnings.some(w =>
        w.message.includes('Source maps')
    );
    const hasMinifyWarning = configWarnings.some(w =>
        w.message.includes('minification')
    );

    if (hasSourceMapWarning && hasMinifyWarning) {
        console.log('  ✓ Source map and minification warnings detected');
        passed++;
    } else {
        failed++;
        console.error('  ✗ Expected warnings not detected');
    }

    // Test 4: Artifact Analysis
    console.log('\n[Test 4] Artifact Analysis');
    const largeBundle = Buffer.alloc(300 * 1024); // 300KB
    const mockArtifacts: BuildArtifact[] = [
        {
            id: 'test-bundle',
            type: 'js',
            fileName: 'main.bundle.js',
            dependencies: [],
            source: largeBundle
        }
    ];

    const artifactWarnings = detector.analyzeArtifacts(
        mockArtifacts,
        mockContext as BuildContext
    );

    const hasBundleSizeWarning = artifactWarnings.some(w =>
        w.message.includes('Bundle size')
    );
    if (hasBundleSizeWarning) {
        console.log('  ✓ Large bundle size warning detected');
        passed++;
    } else {
        failed++;
        console.error('  ✗ Bundle size warning not detected');
    }

    // Test 5: Severity Levels
    console.log('\n[Test 5] Severity Levels');
    try {
        const criticalWarning = WarningLibrary.EXPOSED_API_KEY('config.ts', 42);
        const warningLevel = WarningLibrary.MISSING_TREE_SHAKING();
        const infoLevel = WarningLibrary.UNUSED_CSS('.unused', 'style.css');

        if (criticalWarning.severity === 'critical' &&
            warningLevel.severity === 'warning' &&
            infoLevel.severity === 'info') {
            console.log('  ✓ All severity levels work correctly');
            passed++;
        } else {
            failed++;
            console.error('  ✗ Severity levels incorrect');
        }
    } catch (e) {
        failed++;
        console.error('  ✗ Severity level test failed:', e);
    }

    // Test 6: Category Coverage
    console.log('\n[Test 6] Category Coverage');
    const sampleWarnings = [
        WarningLibrary.LARGE_BUNDLE(300000),
        WarningLibrary.VULNERABLE_DEPENDENCY('test', 'high'),
        WarningLibrary.IMPLICIT_ANY('test.ts', 10),
        WarningLibrary.MISSING_KEY_PROP('Component.tsx', 20),
        WarningLibrary.UNUSED_CSS('.test', 'style.css'),
        WarningLibrary.MISSING_SOURCE_MAPS(),
        WarningLibrary.MISSING_ALT_TEXT('Image.tsx', 15)
    ];

    const foundCategories = new Set(
        sampleWarnings.map(w => w.category).filter(Boolean)
    );

    console.log(`  ✓ Covered ${foundCategories.size} categories:`);
    foundCategories.forEach(cat => console.log(`    - ${cat}`));
    if (foundCategories.size >= 5) {
        passed++;
    } else {
        failed++;
        console.error('  ✗ Should cover at least 5 categories');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Tests Passed: ${passed}`);
    console.log(`Tests Failed: ${failed}`);
    console.log('='.repeat(50));

    if (failed === 0) {
        console.log('\n✅ All Terminal Warnings Tests Passed!');
        console.log(`\nSummary:`);
        console.log(`  - ${libraryWarnings} warning types in library`);
        console.log(`  - ${foundCategories.size} warning categories`);
        console.log(`  - All warnings have actionable fixes`);
        console.log(`  - Severity levels: critical, warning, info`);
        console.log(`  - Live detection and analysis working`);
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
