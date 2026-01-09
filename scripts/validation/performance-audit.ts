
import { CoreBuildEngine } from '../../src/core/engine/index.js';
import { BuildConfig } from '../../src/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const benchRoot = path.resolve(__dirname, '../../performance-bench');

async function generateLargeProject(moduleCount: number) {
    console.log(`📦 Generating ${moduleCount} modules project...`);

    await fs.mkdir(benchRoot, { recursive: true });
    await fs.mkdir(path.join(benchRoot, 'src'), { recursive: true });

    // 1. main.js - Entry point
    let mainContent = '';
    for (let i = 0; i < moduleCount; i++) {
        mainContent += `import { val${i} } from './mod${i}.js';\n`;
    }
    mainContent += `console.log('Total modules:', ${moduleCount});`;
    await fs.writeFile(path.join(benchRoot, 'src/main.js'), mainContent);

    // 2. modN.js - Individual modules
    const promises = [];
    for (let i = 0; i < moduleCount; i++) {
        const nextImport = i < moduleCount - 1 ? `import { val${i + 1} } from './mod${i + 1}.js';` : '';
        const content = `
      ${nextImport}
      export const val${i} = ${i};
      export function func${i}() { return val${i} * 2; }
    `;
        promises.push(fs.writeFile(path.join(benchRoot, 'src/mod${i}.js'), content));

        // Batch writes to avoid EMFILE
        if (promises.length > 50) {
            await Promise.all(promises);
            promises.length = 0;
        }
    }
    await Promise.all(promises);

    console.log('✅ Generation complete');
}

async function runBenchmark() {
    const moduleCount = 500; // Large but manageable for first run
    await generateLargeProject(moduleCount);

    const engine = new CoreBuildEngine();
    const config: BuildConfig = {
        root: benchRoot,
        entry: ['src/main.js'],
        outDir: 'dist',
        mode: 'production',
        platform: 'browser',
        preset: 'spa',
        plugins: [{
            id: 'slow-plugin',
            manifest: {
                name: 'slow-plugin',
                version: '1.0.0',
                engineVersion: '1.0.0',
                type: 'js',
                hooks: ['transformModule'],
                permissions: { fs: 'read' }
            },
            async runHook(hook: string, args: any) {
                if (hook === 'transformModule') {
                    console.log(`Transforming ${args.id}`);
                    // Simulate work (1ms)
                    await new Promise(resolve => setTimeout(resolve, 1));
                    return { ...args, code: args.code };
                }
            }
        }]
    } as any;

    console.log('\n🧹 Cleaning old cache...');
    await fs.rm(path.join(benchRoot, '.nexxo_cache'), { recursive: true, force: true });

    console.log('\n🚀 Starting Cold Build...');
    const startCold = Date.now();
    const build1 = await engine.run(config as any, 'production', benchRoot);
    const endCold = Date.now();

    if (!build1.success) {
        console.error('Cold build failed:', build1.error);
        process.exit(1);
    }

    console.log(`✅ Cold Build: ${endCold - startCold}ms`);

    console.log('\n🔃 Starting Warm Build (No Changes)...');
    const startWarm = Date.now();
    const build2 = await engine.run(config as any, 'production', benchRoot);
    const endWarm = Date.now();
    console.log(`✅ Warm Build: ${endWarm - startWarm}ms`);

    console.log('\n📝 Starting Incremental Build (1 file change)...');
    const modIndex = Math.floor(moduleCount / 2);
    await fs.writeFile(path.join(benchRoot, `src/mod${modIndex}.js`), `export const val${modIndex} = 'changed';`);
    const startInc = Date.now();
    const build3 = await engine.run(config as any, 'production', benchRoot, [path.join(benchRoot, `src/mod${modIndex}.js`)]);
    const endInc = Date.now();
    console.log(`✅ Incremental Build: ${endInc - startInc}ms`);

    console.log('\n' + '='.repeat(40));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('='.repeat(40));
    console.log(`Cold Build:        ${(endCold - startCold).toFixed(0)}ms`);
    console.log(`Warm (Cache):      ${(endWarm - startWarm).toFixed(0)}ms`);
    console.log(`Incremental:       ${(endInc - startInc).toFixed(0)}ms`);
    console.log(`Throughput:        ${(moduleCount / ((endCold - startCold) / 1000)).toFixed(1)} modules/sec`);
    console.log('='.repeat(40));

    await engine.close();
}

runBenchmark().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
