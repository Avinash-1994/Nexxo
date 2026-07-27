export default {
    entry: 'src/main.jsx',
    outDir: 'dist',
    mode: 'production', // Ensure DCE is active
    moduleTypes: {
        'jsx': 'jsx',
        'js': 'js'
    }
};
