export default {
  entry: ['src/Dashboard.tsx'],
  framework: 'react',
  server: { port: 5174 },
  federation: {
    name: 'reactRemote',
    filename: 'remoteEntry.js',
    exposes: { './Dashboard': './src/Dashboard.tsx' },
    shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
  }
};
