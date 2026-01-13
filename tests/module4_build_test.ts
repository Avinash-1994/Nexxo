
/**
 * Module 4: Multi-Target Build Test
 * Validates Day 28 Pipeline Logic
 */

import { BuildPipeline } from '../src/build/pipeline.js';

async function runBuildTest() {
    console.log('🧪 Testing Multi-Target Build Pipeline...\n');

    // Test 1: Single Target (SPA)
    console.log('Scenario 1: SPA Build...');
    const spaPipeline = new BuildPipeline({
        target: ['spa'],
        outDir: './dist',
        minify: true,
        ssr: false,
        edge: false
    });
    await spaPipeline.build();
    console.log('✅ SPA Build Verified\n');

    // Test 2: Multi-Target (SPA + SSR + Edge)
    console.log('Scenario 2: Multi-Target Build...');
    const multiPipeline = new BuildPipeline({
        target: ['spa', 'ssr', 'edge'],
        outDir: './dist',
        minify: true,
        ssr: true,
        edge: true
    });
    await multiPipeline.build();
    console.log('✅ Multi-Target Build Verified\n');

    // Test 3: All Targets
    console.log('Scenario 3: All Targets...');
    const allPipeline = new BuildPipeline({
        target: ['spa', 'ssr', 'ssg', 'edge', 'lib'],
        outDir: './dist',
        minify: true,
        ssr: true,
        edge: true
    });
    await allPipeline.build();
    console.log('✅ All Targets Build Verified\n');

    console.log('---------------------------');
    console.log('🎉 Day 28 Multi-Target Pipeline Verified!');
}

runBuildTest().catch(e => {
    console.error('❌ Build Test Failed:', e);
    process.exit(1);
});
