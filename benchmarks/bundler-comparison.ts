
import { rolldownBundler } from '../src/core/bundler-rolldown.js';
import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { performance } from 'perf_hooks';
import * as path from 'path';

// Setup test files
const TEMP_DIR = path.resolve('./.bundler_bench_temp');
const OUT_DIR_ROLLDOWN = path.resolve('./.bundler_bench_out_rolldown');
const OUT_DIR_ESBUILD = path.resolve('./.bundler_bench_out_esbuild');

async function setup() {
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Create main entry
    await fs.writeFile(path.join(TEMP_DIR, 'index.js'), `
        import { foo } from './foo.js';
        import { bar } from './bar.js';
        import React from 'react';
        
        console.log(foo(), bar());
        export const App = () => React.createElement('div', null, 'Hello');
    `);

    // Create 100 modules
    for (let i = 0; i < 100; i++) {
        await fs.writeFile(path.join(TEMP_DIR, `module${i}.js`), `
            export const value${i} = ${i};
            export function func${i}() { return 'result ${i}'; }
        `);
    }

    // Update foo/bar to import some modules
    await fs.writeFile(path.join(TEMP_DIR, 'foo.js'), `
        import { value0 } from './module0.js';
        export function foo() { return 'foo ' + value0; }
    `);

    await fs.writeFile(path.join(TEMP_DIR, 'bar.js'), `
        import { value99 } from './module99.js';
        export function bar() { return 'bar ' + value99; }
    `);
}

async function cleanup() {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    await fs.rm(OUT_DIR_ROLLDOWN, { recursive: true, force: true });
    await fs.rm(OUT_DIR_ESBUILD, { recursive: true, force: true });
}

async function runBenchmark() {
    console.log('🚀 Starting Bundler Comparison Benchmark');
    await setup();

    const input = path.join(TEMP_DIR, 'index.js');

    // Warmup
    console.log('🔥 Warming up...');

    // Benchmark Rolldown
    console.log('⚡ Benchmarking Rolldown...');
    const startRolldown = performance.now();
    await rolldownBundler.build({
        input,
        outDir: OUT_DIR_ROLLDOWN,
        format: 'esm',
        minify: true,
        sourcemap: true
    });
    const timeRolldown = performance.now() - startRolldown;

    // Benchmark esbuild
    console.log('⚡ Benchmarking esbuild...');
    const startEsbuild = performance.now();
    await esbuild.build({
        entryPoints: [input],
        outdir: OUT_DIR_ESBUILD,
        format: 'esm',
        minify: true,
        sourcemap: true,
        bundle: true,
    });
    const timeEsbuild = performance.now() - startEsbuild;

    console.log('----------------------------------------');
    console.log(`📊 Results:`);
    console.log(`Rolldown: ${timeRolldown.toFixed(2)}ms`);
    console.log(`esbuild:  ${timeEsbuild.toFixed(2)}ms`);

    if (timeRolldown < timeEsbuild) {
        const imp = ((timeEsbuild - timeRolldown) / timeEsbuild) * 100;
        console.log(`✅ Rolldown is ${imp.toFixed(2)}% faster`);
    } else {
        console.log(`⚠️ esbuild is faster by ${((timeRolldown - timeEsbuild) / timeRolldown * 100).toFixed(2)}%`);
        console.log(`   (Note: Rolldown is still in beta/alpha, performance may vary on small graphs)`);
    }

    await cleanup();
}

runBenchmark().catch(console.error);
