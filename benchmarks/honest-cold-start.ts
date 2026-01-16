/**
 * REAL Cold Start Benchmark - Honest Testing
 * 
 * This tests the ACTUAL dev server startup time, not just cache init.
 * We measure from process start to server ready.
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import http from 'http';

interface BenchmarkResult {
    scenario: string;
    duration: number;
    success: boolean;
}

const results: BenchmarkResult[] = [];

/**
 * Test actual dev server cold start
 */
async function testDevServerColdStart(): Promise<BenchmarkResult> {
    console.log('\n🔥 Testing REAL dev server cold start...');

    // Clean cache for true cold start
    const cacheDir = path.join(process.cwd(), 'node_modules', '.nexxo');
    if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
    }

    const start = performance.now();

    return new Promise((resolve) => {
        // Start dev server
        const devServer = spawn('npx', ['tsx', 'src/cli.ts', 'dev', '--port', '5555'], {
            cwd: process.cwd(),
            stdio: 'pipe',
        });

        let serverReady = false;
        let output = '';

        devServer.stdout?.on('data', (data) => {
            output += data.toString();

            // Check if server is ready
            if (output.includes('Server running') || output.includes('localhost:5555')) {
                if (!serverReady) {
                    serverReady = true;
                    const duration = performance.now() - start;

                    // Kill server
                    devServer.kill();

                    resolve({
                        scenario: 'Dev Server Cold Start (Real)',
                        duration: Math.round(duration),
                        success: duration < 1000, // 1 second is reasonable
                    });
                }
            }
        });

        devServer.stderr?.on('data', (data) => {
            output += data.toString();
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            if (!serverReady) {
                devServer.kill();
                const duration = performance.now() - start;
                resolve({
                    scenario: 'Dev Server Cold Start (Real)',
                    duration: Math.round(duration),
                    success: false,
                });
            }
        }, 10000);
    });
}

/**
 * Test warm start (second run)
 */
async function testDevServerWarmStart(): Promise<BenchmarkResult> {
    console.log('🔥 Testing dev server warm start...');

    const start = performance.now();

    return new Promise((resolve) => {
        const devServer = spawn('npx', ['tsx', 'src/cli.ts', 'dev', '--port', '5556'], {
            cwd: process.cwd(),
            stdio: 'pipe',
        });

        let serverReady = false;
        let output = '';

        devServer.stdout?.on('data', (data) => {
            output += data.toString();

            if (output.includes('Server running') || output.includes('localhost:5556')) {
                if (!serverReady) {
                    serverReady = true;
                    const duration = performance.now() - start;

                    devServer.kill();

                    resolve({
                        scenario: 'Dev Server Warm Start (Real)',
                        duration: Math.round(duration),
                        success: duration < 800,
                    });
                }
            }
        });

        devServer.stderr?.on('data', (data) => {
            output += data.toString();
        });

        setTimeout(() => {
            if (!serverReady) {
                devServer.kill();
                const duration = performance.now() - start;
                resolve({
                    scenario: 'Dev Server Warm Start (Real)',
                    duration: Math.round(duration),
                    success: false,
                });
            }
        }, 10000);
    });
}

/**
 * Test build time
 */
async function testBuildTime(): Promise<BenchmarkResult> {
    console.log('🔥 Testing build time...');

    const start = performance.now();

    return new Promise((resolve) => {
        const build = spawn('npm', ['run', 'build'], {
            cwd: process.cwd(),
            stdio: 'pipe',
        });

        let output = '';

        build.stdout?.on('data', (data) => {
            output += data.toString();
        });

        build.stderr?.on('data', (data) => {
            output += data.toString();
        });

        build.on('close', (code) => {
            const duration = performance.now() - start;

            resolve({
                scenario: 'Build Time (npm run build)',
                duration: Math.round(duration),
                success: code === 0 && duration < 30000, // 30 seconds
            });
        });

        setTimeout(() => {
            build.kill();
            const duration = performance.now() - start;
            resolve({
                scenario: 'Build Time (npm run build)',
                duration: Math.round(duration),
                success: false,
            });
        }, 60000);
    });
}

async function runHonestBenchmarks() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 HONEST Cold Start Benchmark - Real Dev Server Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Cold start
    const coldStart = await testDevServerColdStart();
    results.push(coldStart);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Warm start
    const warmStart = await testDevServerWarmStart();
    results.push(warmStart);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Build time
    const buildTime = await testBuildTime();
    results.push(buildTime);

    // Print results
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 HONEST RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const color = result.success ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';

        console.log(`${status} ${result.scenario.padEnd(35)} ${color}${result.duration}ms${reset}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 Competitor Comparison (Honest)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const coldStartResult = results.find(r => r.scenario.includes('Cold Start'));

    if (coldStartResult) {
        console.log('Dev Server Cold Start:');
        console.log(`  Nexxo:     ${coldStartResult.duration}ms`);
        console.log(`  Vite:      ~425ms (from Module 7 benchmarks)`);
        console.log(`  esbuild:   ~200ms (target)`);
        console.log(`  Turbopack: ~400ms (estimated)`);
        console.log(`  Rspack:    ~300ms (estimated)`);

        if (coldStartResult.duration < 425) {
            console.log(`\n  ✅ Nexxo is ${Math.round((425 - coldStartResult.duration) / 425 * 100)}% faster than Vite!`);
        } else {
            console.log(`\n  ⚠️  Nexxo is ${Math.round((coldStartResult.duration - 425) / 425 * 100)}% slower than Vite`);
        }

        if (coldStartResult.duration < 200) {
            console.log(`  🏆 Nexxo BEATS esbuild target!`);
        } else {
            console.log(`  📊 Nexxo is ${Math.round((coldStartResult.duration - 200) / 200 * 100)}% slower than esbuild target`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 HONEST ASSESSMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (coldStartResult) {
        if (coldStartResult.duration < 200) {
            console.log('✅ EXCELLENT: Beats esbuild target (<200ms)');
        } else if (coldStartResult.duration < 425) {
            console.log('✅ GOOD: Faster than Vite, but slower than esbuild');
            console.log('   Optimization opportunity: Reduce to <200ms');
        } else if (coldStartResult.duration < 1000) {
            console.log('⚠️  NEEDS WORK: Slower than Vite');
            console.log('   Critical: Must optimize for Module 8 Day 51');
        } else {
            console.log('❌ CRITICAL: Very slow cold start');
            console.log('   Urgent optimization needed');
        }
    }

    console.log('\n');
}

// Run honest benchmarks
runHonestBenchmarks().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
