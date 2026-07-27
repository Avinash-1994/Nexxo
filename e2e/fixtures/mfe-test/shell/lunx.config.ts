export default {
  framework: 'react',
  federation: {
    name: 'shell',
    remotes: {
      remote_cart:   'remote_cart@http://localhost:5174/remoteEntry.js',
      remote_header: 'remote_header@http://localhost:5175/remoteEntry.js',
    },
    shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
    }
  }
};