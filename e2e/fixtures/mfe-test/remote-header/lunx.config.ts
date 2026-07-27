export default {
  framework: 'react',
  server: { port: 5175 },
  prebundle: { enabled: true, exclude: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'] },
  federation: {
    name: 'remote_header',
    filename: 'remoteEntry.js',
    exposes: {
      './HeaderBar': './src/HeaderBar.tsx'
    },
    shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
    },
    singletonHost: 'http://localhost:5173'
  }
};
