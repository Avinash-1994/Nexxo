
import { defineConfig } from 'nexxo';
import edge from '/home/avinash/Desktop/framework_practis/build/src/plugins/implementations/edge.ts';

export default defineConfig({
    server: { port: 4005 },
    rocksdb: {
        blockCacheSize: '1GB',
        shardBits: 4,
        backgroundThreads: 8,
        warmupRuns: 2,
        lruCache: true
    },
    plugins: [edge()],
    build: {
        target: 'esnext',
        outDir: 'dist/edge'
    }
});
