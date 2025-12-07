// Urja Test Project Configuration
export default {
    root: '.',
    entry: ['src/main.jsx'],
    outDir: 'dist',
    mode: 'development',
    port: 3000,

    // React Fast Refresh
    plugins: [
        {
            name: 'react-refresh',
            enabled: true
        }
    ],

    // Hot Module Replacement
    hmr: {
        enabled: true,
        host: 'localhost',
        port: 24678
    },

    // Parallel plugin execution for faster builds
    parallelPlugins: {
        enabled: true,
        workers: 4
    }
};
