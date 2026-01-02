module.exports = {
    adapter: 'react-adapter',
    entry: ['src/main.tsx'],
    root: __dirname,
    outputDir: 'dist',
    publicDir: 'public',
    preset: 'spa',
    port: 5174,
    host: '0.0.0.0',
    css: {
        framework: 'tailwind'
    },
    prebundle: {
        include: ['react', 'react-dom', 'react-dom/client', 'lucide-react']
    }
};
