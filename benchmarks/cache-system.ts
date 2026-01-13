
import { getCacheManager } from '../src/core/cache-manager.js';
import { performance } from 'perf_hooks';
import * as path from 'path';

async function runBenchmark() {
    console.log('🚀 Starting Cache System Benchmark');

    const root = path.resolve('.bench_cache_sys');
    const manager = getCacheManager(root);

    // 1. Cold Write Benchmark
    console.log('----------------------------------------');
    console.log('❄️  Cold Write (1000 items)...');
    const startWrite = performance.now();
    for (let i = 0; i < 1000; i++) {
        manager.set('transform', `file_${i}.ts`, JSON.stringify({ code: `console.log(${i})`, map: null }));
    }
    const timeWrite = performance.now() - startWrite;
    console.log(`✓ Write Time: ${timeWrite.toFixed(2)}ms (${(1000 / timeWrite * 1000).toFixed(0)} ops/sec)`);

    // 2. Warm Read Benchmark
    console.log('----------------------------------------');
    console.log('🔥 Warm Read (1000 items)...');
    const startRead = performance.now();
    let hits = 0;
    for (let i = 0; i < 1000; i++) {
        const val = manager.get('transform', `file_${i}.ts`);
        if (val) hits++;
    }
    const timeRead = performance.now() - startRead;
    console.log(`✓ Read Time: ${timeRead.toFixed(2)}ms (${(1000 / timeRead * 1000).toFixed(0)} ops/sec)`);
    console.log(`✓ Hit Rate: ${(hits / 1000 * 100).toFixed(2)}%`);

    // 3. Stats & Policy
    console.log('----------------------------------------');
    console.log('📊 Enforcing Policy...');
    await manager.enforcePolicy();
    const stats = manager.getStats();
    console.log('Cache Stats:', {
        entries: stats.totalEntries,
        size: `${(stats.sizeBytes / 1024).toFixed(2)} KB`,
        hitRate: `${stats.hitRate.toFixed(2)}%`
    });

    // Cleanup
    manager.close();
    // note: we leave the dir for inspection if needed, or clean up manually
}

runBenchmark().catch(console.error);
