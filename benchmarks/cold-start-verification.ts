import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { performance } from 'perf_hooks';

/**
 * MODULE 8: COLD START VERIFICATION SCRIPT
 * 
 * Specifically designed to measure the impact of 
 * tiered initialization and lazy RocksDB loading.
 */

async function measureColdStart(cwd: string) {
    console.log(`\n🚀 Measuring True Cold Start in ${cwd}...`);

    // Clean cache for TRUE cold start
    const cacheDir = path.join(cwd, '.lunx_cache');
    if (fs.existsSync(cacheDir)) {
        console.log('🧹 Cleaning existing cache...');
        fs.rmSync(cacheDir, { recursive: true, force: true });
    }

    const lunxBin = path.join(process.cwd(), 'dist/cli.mjs');
    if (!fs.existsSync(lunxBin)) {
        console.error('❌ Lunx CLI not found at dist/cli.mjs. Run npm run build first.');
        process.exit(1);
    }

    const start = performance.now();
    const server = spawn('node', [lunxBin, 'dev', '--port', '4099'], {
        cwd,
        detached: true,
        env: { ...process.env, LUNX_QUIET: 'true' }
    });

    return new Promise<{ coldStart: number; ttfb: number }>((resolve) => {
        let firstResponse = 0;

        const check = async () => {
            try {
                const res = await fetch('http://127.0.0.1:4099');
                if (res.ok || res.status === 200) {
                    firstResponse = performance.now();
                    const coldStart = firstResponse - start;

                    // Measure TTFB
                    const t1 = performance.now();
                    await fetch('http://127.0.0.1:4099');
                    const ttfb = performance.now() - t1;

                    console.log(`✅ Server Ready: ${coldStart.toFixed(2)}ms`);
                    console.log(`✅ TTFB: ${ttfb.toFixed(2)}ms`);

                    try { process.kill(-server.pid!); } catch { }
                    resolve({ coldStart, ttfb });
                    return;
                }
            } catch (e) {
                setTimeout(check, 5);
            }
        };

        check();

        // Safety timeout
        setTimeout(() => {
            try { process.kill(-server.pid!); } catch { }
            resolve({ coldStart: 5000, ttfb: 5000 });
        }, 5000);
    });
}

async function run() {
    const tempDir = path.join(process.cwd(), 'benchmark_temp_small_app');
    if (!fs.existsSync(tempDir)) {
        console.log('Scaffolding temp app...');
        // Generic scaffolding logic ...
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(path.join(tempDir, 'index.html'), '<html><body>Hello</body></html>');
    }

    const results = await measureColdStart(tempDir);

    console.log('\n📊 FINAL COLD START REPORT (Tiered Init)');
    console.log('-----------------------------------------');
    console.log(`Target:    <200.00ms`);
    console.log(`Actual:    ${results.coldStart.toFixed(2)}ms`);
    console.log(`Status:    ${results.coldStart < 200 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('-----------------------------------------');
}

run();
