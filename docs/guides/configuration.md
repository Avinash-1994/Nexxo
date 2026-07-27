# Configuration Guide

Complete reference for configuring Lunx.

## Configuration File

Lunx supports multiple configuration formats:

- `lunx.config.js` (recommended)
- `lunx.config.ts`
- `lunx.config.mjs`
- `lunx.config.cjs`

## Basic Configuration

```javascript
module.exports = {
  // Project root directory
  root: '.',
  
  // Entry points (can be array or single string)
  entry: ['./src/index.tsx'],
  
  // Output directory
  outDir: './dist',
  
  // Framework (auto-detected if omitted)
  framework: 'react', // 'react' | 'vue' | 'svelte' | 'angular' | etc.
  
  // Public directory for static assets
  publicDir: './public',
};
```

## Build Options

```javascript
module.exports = {
  build: {
    // Enable minification
    minify: true,
    
    // Source map generation
    // 'none' | 'inline' | 'external' | 'hidden'
    sourcemap: 'external',
    
    // Enable CSS Modules
    cssModules: false,
    
    // Code splitting strategy
    // true | false | 'module' | 'route'
    splitting: true,
    
    // Target environment
    target: 'browser', // 'browser' | 'node' | 'edge'
    
    // Output format
    format: 'esm', // 'esm' | 'cjs' | 'iife'
    
    // Compression
    compress: {
      gzip: true,
      brotli: true,
    },
  },
};
```

## Development Server

```javascript
module.exports = {
  dev: {
    // Port number
    port: 3000,
    
    // Enable Hot Module Replacement
    hmr: true,
    
    // Open browser on start
    open: true,
    
    // HTTPS configuration
    https: false,
    // or
    https: {
      key: './cert/key.pem',
      cert: './cert/cert.pem',
    },
    
    // Proxy configuration
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    
    // CORS configuration
    cors: true,
  },
};
```

## Module Federation

```javascript
module.exports = {
  federation: {
    // Application name
    name: 'my_app',
    
    // Remote entry filename
    filename: 'remoteEntry.js',
    
    // Exposed modules
    exposes: {
      './Button': './src/components/Button.tsx',
      './Header': './src/components/Header.tsx',
    },
    
    // Remote applications
    remotes: {
      'app2': 'http://localhost:3001/remoteEntry.js',
      'shared': 'https://cdn.example.com/shared/remoteEntry.js',
    },
    
    // Shared dependencies
    shared: {
      'react': {
        singleton: true,
        requiredVersion: '^18.0.0',
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0',
      },
    },
    
    // Prefetch remotes
    prefetch: ['app2'],
    
    // Fallback URL
    fallback: 'https://cdn.example.com/fallback',
    
    // Health check endpoint
    healthCheck: '/health',
  },
};
```

## Plugins

```javascript
module.exports = {
  plugins: [
    // Custom plugin
    {
      name: 'my-plugin',
      transform(code, id) {
        // Transform code
        return { code };
      },
    },
    
    // Or import external plugins
    require('@lunx/plugin-react-refresh'),
  ],
};
```

## SSR Configuration

```javascript
module.exports = {
  ssr: {
    // Enable SSR
    enabled: true,
    
    // SSR entry point
    entry: './src/entry-server.tsx',
    
    // Server port
    port: 3001,
    
    // Prerender routes
    prerender: [
      '/',
      '/about',
      '/contact',
    ],
    
    // External packages (not bundled)
    external: ['express', 'react', 'react-dom'],
  },
};
```

## Environment Variables

```javascript
module.exports = {
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __API_URL__: JSON.stringify(process.env.API_URL),
  },
  
  // Environment variable prefix
  envPrefix: ['VITE_', 'LUNX_'],
};
```

## Path Aliases

```javascript
module.exports = {
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
    },
    
    // Extensions to resolve
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
};
```

## Optimization

```javascript
module.exports = {
  optimization: {
    // Tree shaking
    treeShaking: true,
    
    // Dead code elimination
    deadCodeElimination: true,
    
    // Chunk splitting
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
    },
    
    // Runtime chunk
    runtimeChunk: 'single',
  },
};
```

## CSS Processing

```javascript
module.exports = {
  css: {
    // PostCSS config
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
    
    // CSS Modules configuration
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    
    // Preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
};
```

## TypeScript

```javascript
module.exports = {
  typescript: {
    // Type checking
    check: true,
    
    // Generate declaration files
    declaration: true,
    
    // TSConfig path
    configFile: './tsconfig.json',
  },
};
```

## Complete Example

```javascript
module.exports = {
  root: '.',
  entry: ['./src/index.tsx'],
  outDir: './dist',
  framework: 'react',
  
  build: {
    minify: true,
    sourcemap: 'external',
    cssModules: true,
    splitting: true,
    target: 'browser',
    compress: {
      gzip: true,
      brotli: true,
    },
  },
  
  dev: {
    port: 3000,
    hmr: true,
    open: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  
  federation: {
    name: 'my_app',
    filename: 'remoteEntry.js',
    exposes: {
      './App': './src/App.tsx',
    },
    shared: {
      'react': { singleton: true },
      'react-dom': { singleton: true },
    },
  },
  
  resolve: {
    alias: {
      '@': './src',
    },
  },
  
  plugins: [],
};
```

## Environment-Specific Configuration

```javascript
// lunx.config.js
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  build: {
    minify: !isDev,
    sourcemap: isDev ? 'inline' : 'external',
  },
  
  dev: {
    port: isDev ? 3000 : 8080,
  },
};
```

## Next Steps

- [Plugin Development](./plugins.md)
- [Framework Support](./frameworks.md)
- [Module Federation Guide](./federation.md)
- [API Reference](../api/README.md)
