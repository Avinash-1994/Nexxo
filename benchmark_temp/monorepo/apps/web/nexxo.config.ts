
import { defineConfig } from 'nexxo';
import react from '/home/avinash/Desktop/framework_practis/build/src/plugins/implementations/react.ts';

export default defineConfig({
    server: { port: 4005 },
    rocksdb: {
        blockCacheSize: '1GB',
        shardBits: 4,
        backgroundThreads: 8,
        warmupRuns: 2,
        lruCache: true
    },
    plugins: [react()]
});
