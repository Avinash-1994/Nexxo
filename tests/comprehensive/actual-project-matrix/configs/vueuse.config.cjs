
module.exports = {
  root: '.',
  entry: ['./index.ts'],
  outDir: './dist',
  framework: 'vue',
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
      './App': './src/main.ts'
    }
  }
};