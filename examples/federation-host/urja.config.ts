import { defineConfig } from '../../src/config/index.js';

export default defineConfig({
    root: '.',
    entry: ['src/main.tsx'],
    outDir: 'dist',
    mode: 'development',
    server: {
        port: 3001,
        cors: true
    },
    federation: {
        name: 'host',
        remotes: {
            'remote': 'http://localhost:3002'
        },
        shared: {
            'react': { singleton: true, requiredVersion: '^18.0.0' },
            'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
        }
    }
});
