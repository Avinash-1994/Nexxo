export default {
  preset: 'ssr',
  adapter: 'solid',
  entry: ['src/entry-ssr.js'],
  security: { vulnSeverity: 'off' }
};
