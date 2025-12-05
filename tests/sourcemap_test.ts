import { BundlerStep } from '../src/core/steps.js';
import { PipelineContext } from '../src/core/pipeline.js';
import { BuildConfig } from '../src/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Source Map Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_sourcemap');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    // Create dummy entry file
    const entryFile = path.join(testDir, 'index.js');
    await fs.writeFile(entryFile, 'console.log("hello world");');

    const modes = ['inline', 'external', 'hidden', 'none'] as const;
    let passed = 0;
    let failed = 0;

    for (const mode of modes) {
        console.log(`Testing mode: ${mode}`);

        const outDir = path.join(testDir, `dist_${mode}`);

        const config: BuildConfig = {
            root: testDir,
            entry: ['index.js'],
            mode: 'development',
            outDir: `dist_${mode}`,
            port: 3000,
            platform: 'browser',
            preset: 'spa',
            build: {
                sourcemap: mode
            }
        };

        const context: PipelineContext = {
            config,
            pluginManager: {
                transform: async (code: string) => code,
                resolveId: async () => undefined,
                load: async () => undefined
            } as any,
            entryPoints: { 'index': entryFile },
            files: {},
            artifacts: [],
            startTime: Date.now()
        };

        const step = new BundlerStep();
        try {
            await step.run(context);

            // Verification
            const jsPath = path.join(outDir, 'index.js');
            const mapPath = path.join(outDir, 'index.js.map');

            const jsContent = await fs.readFile(jsPath, 'utf-8');
            const mapExists = await fs.access(mapPath).then(() => true).catch(() => false);

            if (mode === 'inline') {
                if (jsContent.includes('sourceMappingURL=data:application/json;base64')) {
                    console.log('✅ Inline source map found');
                    passed++;
                } else {
                    console.error('❌ Inline source map missing');
                    failed++;
                }
            } else if (mode === 'external') {
                if (mapExists && jsContent.includes('sourceMappingURL=')) {
                    console.log(`✅ ${mode} source map found and linked`);
                    passed++;
                } else {
                    console.error(`❌ ${mode} source map missing or not linked`);
                    console.log('Map exists:', mapExists);
                    console.log('JS content end:', jsContent.slice(-100));
                    failed++;
                }
            } else if (mode === 'hidden') {
                if (mapExists && !jsContent.includes('sourceMappingURL=')) {
                    console.log(`✅ ${mode} source map found (no link in JS)`);
                    passed++;
                } else {
                    console.error(`❌ ${mode} source map check failed`);
                    console.log('Map exists:', mapExists);
                    console.log('Has link:', jsContent.includes('sourceMappingURL='));
                    failed++;
                }
            } else if (mode === 'none') {
                if (!mapExists && !jsContent.includes('sourceMappingURL=')) {
                    console.log('✅ No source map generated');
                    passed++;
                } else {
                    console.error('❌ Source map generated when disabled');
                    failed++;
                }
            }

        } catch (e) {
            console.error(`❌ Test failed for mode ${mode}:`, e);
            failed++;
        }
    }

    await rimraf(testDir);

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTest().catch(console.error);
