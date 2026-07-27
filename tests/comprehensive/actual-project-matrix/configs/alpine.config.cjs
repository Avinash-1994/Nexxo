
module.exports = {
  root: '.',
  entry: ['./packages/alpinejs/src/index.js'],
  outDir: './dist',
  plugins: [],
  build: {
    minify: true,
    sourcemap: 'external',
    cssModules: true,
  },
  dev: {
    port: 3000,
    hmr: true,
  },
  federation: {
    name: 'lunx_remote',
    filename: 'remoteEntry.js',
    exposes: {
      './Content': './packages/alpinejs/src/index.js'
    }
  }
};