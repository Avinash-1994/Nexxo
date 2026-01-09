module.exports = {
    adapter: 'react-adapter',
    entry: ['src/main.tsx'],
    root: __dirname,
    outputDir: 'dist',
    publicDir: 'public',
    preset: 'spa',
    css: {
        framework: 'tailwind'
    },
    prebundle: {
        include: ['react', 'react-dom', 'react-dom/client', 'lucide-react']
    },
    plugins: [
        {
            name: 'website-plugin',
            manifest: {
                name: 'website-plugin',
                version: '1.0.0',
                engineVersion: '0.1.3',
                type: 'js',
                hooks: []
            },
            id: 'website-plugin',
            runHook: async (hook, input) => input
        }
    ]

};
