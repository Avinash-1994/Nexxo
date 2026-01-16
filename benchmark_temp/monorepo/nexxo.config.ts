
import { defineConfig } from 'nexxo';

export default defineConfig({
    server: { port: 4005 },
    rocksdb: {
        blockCacheSize: '1GB',
        shardBits: 4,
        backgroundThreads: 8,
        warmupRuns: 2,
        lruCache: true
    },
    workspace: {
        packages: ['apps/*', 'packages/*']
    }
});
