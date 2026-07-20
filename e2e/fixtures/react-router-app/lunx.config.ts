export default {
  preset: 'ssr',
  entry: ['src/entry-ssr.js'],
  security: { vulnSeverity: 'off' }
};
