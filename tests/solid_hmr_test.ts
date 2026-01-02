
import { CoreBuildEngine } from '../dist/core/engine/index.js';
import { BuildConfig } from '../dist/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';
import { strict as assert } from 'assert';

async function runTest() {
    console.log('🧪 Running SolidJS HMR Verification Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_solid');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    // Create package.json for Framework Detection
    await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({
        dependencies: {
            'solid-js': '1.8.0'
        },
        devDependencies: {
            'babel-preset-solid': '1.8.0'
        }
    }));

    // Mock node_modules
    const nodeModules = path.join(testDir, 'node_modules');
    await fs.mkdir(path.join(nodeModules, 'solid-js'), { recursive: true });
    await fs.writeFile(path.join(nodeModules, 'solid-js', 'package.json'),
        JSON.stringify({ version: '1.8.0', name: 'solid-js' }));

    // Create Source Files
    const srcDir = path.join(testDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    // SolidJS Component
    await fs.writeFile(path.join(srcDir, 'Counter.tsx'), `
        import { createSignal } from 'solid-js';
        
        export function Counter() {
            const [count, setCount] = createSignal(0);
            return (
                <button onClick={() => setCount(count() + 1)}>
                    Count: {count()}
                </button>
            );
        }
    `);

    // Entry point
    await fs.writeFile(path.join(srcDir, 'main.tsx'), `
        import { render } from 'solid-js/web';
        import { Counter } from './Counter';
        
        render(() => <Counter />, document.getElementById('root')!);
    `);

    // Config
    const config: BuildConfig = {
        root: testDir,
        entry: ['src/main.tsx'],
        mode: 'development',
        outDir: 'dist',
        port: 3000,
        platform: 'browser',
        preset: 'spa'
    };

    try {
        const engine = new CoreBuildEngine();
        const result = await engine.run(config, 'dev', testDir);

        if (!result.success) {
            console.error('Build failed:', result.error);
            throw new Error('Build failed');
        }

        console.log('✅ Build completed successfully');

        // Verify Bundle
        const bundlePath = path.join(testDir, 'dist', 'main.bundle.js');
        const content = await fs.readFile(bundlePath, 'utf-8');

        // Check for SolidJS reactivity primitives
        assert.ok(content.includes('Counter') || content.includes('count'),
            'Bundle should contain component logic');

        console.log('✅ SolidJS component compilation verified');

        // Check HMR configuration from preset
        const { getFrameworkPreset } = await import('../dist/presets/frameworks.js');
        const solidPreset = getFrameworkPreset('solid');

        assert.ok(solidPreset.hmr?.enabled, 'HMR should be enabled for SolidJS');
        assert.equal(solidPreset.jsx?.runtime, 'automatic', 'Should use automatic JSX runtime');
        assert.equal(solidPreset.jsx?.importSource, 'solid-js', 'Should use solid-js as import source');

        console.log('✅ SolidJS HMR configuration verified');
        console.log('   - HMR Enabled:', solidPreset.hmr?.enabled);
        console.log('   - JSX Runtime:', solidPreset.jsx?.runtime);
        console.log('   - Import Source:', solidPreset.jsx?.importSource);

        console.log('\n✨ SolidJS Test Passed!');

    } catch (e) {
        console.error('❌ SolidJS Test Failed:', e);
        process.exit(1);
    } finally {
        await rimraf(testDir);
    }
}

runTest().catch(console.error);
