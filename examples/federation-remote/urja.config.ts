import { defineConfig } from '../../src/config/index.js';

export default defineConfig({
    root: '.',
    entry: ['src/Button.tsx'],
    outDir: 'dist',
    mode: 'production',
    build: {
        splitting: true,
        minify: true
    },
    federation: {
        name: 'remote',
        filename: 'remoteEntry.json',
        exposes: {
            './Button': './src/Button.tsx'
        },
        shared: {
            'react': { singleton: true, requiredVersion: '^18.0.0' },
            'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
        }
    }
});
