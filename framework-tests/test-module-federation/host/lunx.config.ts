export default {
  framework: 'react',
  preset: 'spa',
  entry: ['src/main.tsx'],
  federation: {
    name: 'host',
    remotes: {
      'reactRemote': 'http://localhost:5173/remoteEntry.js',
      'vueRemote': 'http://localhost:5174/remoteEntry.js'
    },
    shared: { react: { singleton: true, requiredVersion: '18.3.1' }, 'react-dom': { singleton: true } }
  }
};
