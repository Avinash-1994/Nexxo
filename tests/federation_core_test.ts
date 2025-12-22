import { BundlerStep } from '../dist/core/steps.js';
import { PluginManager } from '../dist/plugins/index.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Federation Core Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_fed_core');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    // Create source files
    const srcDir = path.join(testDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'Button.tsx'), `export const Button = () => <button>Click</button>;`);
    await fs.writeFile(path.join(srcDir, 'main.tsx'), `import { Button } from './Button'; console.log(Button);`);

    // Mock node_modules for shared deps
    const nodeModules = path.join(testDir, 'node_modules');
    await fs.mkdir(path.join(nodeModules, 'react'), { recursive: true });
    await fs.writeFile(path.join(nodeModules, 'react', 'package.json'), JSON.stringify({ version: '18.2.0' }));

    const config: BuildConfig = {
        root: testDir,
        entry: ['src/main.tsx'],
        mode: 'production',
        outDir: 'dist',
        port: 3000,
        platform: 'browser',
        preset: 'spa',
        federation: {
            name: 'app1',
            filename: 'remoteEntry.json',
            exposes: {
                './Button': './src/Button.tsx'
            },
            shared: {
                'react': { singleton: true, requiredVersion: '^18.0.0' }
            },
            healthCheck: '/health'
        }
    };

    // Mock Context
    const ctx: any = {
        config,
        entryPoints: {
            main: path.join(srcDir, 'main.tsx')
        },
        pluginManager: new PluginManager()
    };

    try {
        console.log('Starting bundler...');
        const bundler = new BundlerStep();
        await bundler.run(ctx).catch(e => {
            console.error('Bundler run failed:', e);
            throw e;
        });

        console.log('✅ Build completed');

        // Verify Manifest
        const manifestPath = path.join(testDir, 'dist/remoteEntry.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);

        console.log('Manifest:', manifest);

        if (manifest.name !== 'app1') throw new Error('Incorrect name');
        if (!manifest.exposes['./Button']) throw new Error('Missing exposed module');
        if (manifest.shared['react'].version !== '18.2.0') throw new Error('Incorrect shared version');
        if (manifest.health !== '/health') throw new Error('Missing health check');
        if (!manifest.manifestHash) throw new Error('Missing hash');

        console.log('✅ Manifest verified');
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
