export default {
  entry: ['src/Widget.vue'],
  framework: 'vue',
  server: { port: 5175 },
  federation: {
    name: 'vueRemote',
    filename: 'remoteEntry.js',
    exposes: { './Widget': './src/Widget.vue' },
    shared: { vue: { singleton: true } }
  }
};
