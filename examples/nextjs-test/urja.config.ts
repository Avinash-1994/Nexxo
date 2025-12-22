import { defineConfig } from '../../src/config/index.js';

export default defineConfig({
    root: '.',
    entry: ['pages/_app.tsx'],
    outDir: 'build_output',
    framework: 'nextjs'
});
