import { startDevServer } from './dev/devServer.js';
import path from 'path';

// Minimal test script to run the server against react-complete
const root = path.resolve(process.cwd(), 'examples/svelte-test');
console.log(`Starting dev server in ${root}...`);

const config = {
    root,
    port: 3000,
    server: {
        port: 3000,
        host: 'localhost',
    },
    entry: ['./src/main.tsx'],
    outDir: './dist',
    mode: 'development' as const,
    platform: 'browser' as const,
    preset: 'spa' as const
};

startDevServer(config).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
