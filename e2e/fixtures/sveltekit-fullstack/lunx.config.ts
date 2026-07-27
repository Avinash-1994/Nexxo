export default {
  preset: 'ssr',
  entry: ['src/entry-server.js'],
  security: { vulnSeverity: 'off' }
};
