import { AlpineAdapter } from '../src/index.js';
import type { AdapterOutput } from '../src/types.js';
import path from 'path';
import fs from 'fs/promises';

const root = path.resolve(__dirname, '../');

async function verifyApp(appName: string, checkFn: (output: AdapterOutput) => void) {
    console.log(`\n🧪 Verifying ${appName}...`);
    const testAppPath = path.join(root, 'tests', appName);
    const outputDir = path.join(testAppPath, 'dist');
    const entryPoint = path.join(testAppPath, 'src/index.ts');

    // Clean output
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => { });

    const adapter = new AlpineAdapter();
    await adapter.init({
        root: testAppPath,
        entryPoints: [entryPoint],
        mode: 'prod',
        env: {},
        outputDir: outputDir
    });

    console.log('🔨 Building...');
    const output = await adapter.build();

    if (Object.keys(output.manifest).length === 0) {
        throw new Error(`❌ [${appName}] Manifest is empty`);
    }

    checkFn(output);
    console.log(`✅ [${appName}] Passed!`);
}

async function run() {
    try {
        await verifyApp('app-hello', (output) => {
            const jsFile = output.assets.find(a => a.type === 'js');
            if (!jsFile || !jsFile.source.toString().includes('Alpine.start')) {
                throw new Error('JS output missing Alpine.start()');
            }
        });

        await verifyApp('app-styles', (output) => {
            const cssFile = output.assets.find(a => a.type === 'css');
            const assetFile = output.assets.find(a => a.type === 'asset');

            // Vite might inline small assets or CSS depending on size/config.
            // Our config output CSS to assets with [hash].

            if (!cssFile) {
                console.log('Available Assets:', output.assets);
                throw new Error('CSS file not extracted');
            }
            if (!assetFile) {
                // Check if it was inlined
                const inlinedInCss = cssFile && cssFile.source.toString().includes('data:image');
                const inlinedInJs = output.assets.some(a => a.type === 'js' && a.source.toString().includes('data:image'));

                if (inlinedInCss || inlinedInJs) {
                    console.log('⚠️ Asset inlined (acceptable behavior)');
                } else {
                    console.log('Available Assets:', output.assets);
                    throw new Error('Image asset not processed (neither extracted nor inlined)');
                }
            }
        });

        await verifyApp('app-split', (output) => {
            const jsFiles = output.assets.filter(a => a.type === 'js');
            // Should have entry + chunk
            if (jsFiles.length < 2) {
                console.log('Assets:', output.assets.map(a => a.fileName));
                throw new Error('Code splitting failed (expected >=2 JS files)');
            }
        });

        console.log('\n🎉 ALL ADAPTER TESTS PASSED!');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
