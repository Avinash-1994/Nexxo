/**
 * Direct Server Startup Benchmark
 * Tests the actual server startup time without CLI/tsx overhead
 */

import { performance } from 'perf_hooks';
import { loadConfig } from '../src/config/index.js';
import { startDevServerOptimized } from '../src/dev/optimizedServer.js';

async function benchmarkDirectStartup() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 Direct Server Startup Benchmark (No CLI Overhead)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Config loading
    const configStart = performance.now();
    const cfg = await loadConfig(process.cwd());
    const configDuration = performance.now() - configStart;
    console.log(`✅ Config Loading: ${Math.round(configDuration)}ms`);

    // Test 2: Server startup (optimized)
    const serverStart = performance.now();
    cfg.port = 5174; // Use different port
    const server = await startDevServerOptimized(cfg);
    const serverDuration = performance.now() - serverStart;
    console.log(`✅ Server Startup: ${Math.round(serverDuration)}ms`);

    // Total
    const total = configDuration + serverDuration;
    console.log(`\n📊 Total Cold Start: ${Math.round(total)}ms`);

    // Comparison
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 Competitor Comparison');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`  Nexxo (Direct):  ${Math.round(total)}ms`);
    console.log(`  esbuild (target): 200ms`);
    console.log(`  Rspack:          ~300ms`);
    console.log(`  Turbopack:       ~400ms`);
    console.log(`  Vite:            ~425ms`);

    if (total < 200) {
        console.log(`\n  🏆 BEATS esbuild target by ${Math.round(200 - total)}ms!`);
    } else if (total < 425) {
        console.log(`\n  ✅ FASTER than Vite by ${Math.round(425 - total)}ms`);
        console.log(`  📊 ${Math.round((total - 200) / 200 * 100)}% slower than esbuild target`);
    } else {
        console.log(`\n  ⚠️  ${Math.round((total - 425) / 425 * 100)}% slower than Vite`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Cleanup
    server.close();
    process.exit(total < 200 ? 0 : 1);
}

benchmarkDirectStartup().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
