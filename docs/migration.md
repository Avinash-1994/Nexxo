# Migration Guide: Moving to Lunx

> **Goal**: Migrate from Vite, Webpack, Rollup, or Angular CLI to Lunx in **under 30 minutes**.

---

## Quick Start

```bash
# Analyze your existing project
npx lunx migrate /path/to/your/project --dry-run

# Apply migration (creates lunx.config.ts, updates package.json)
npx lunx migrate /path/to/your/project

# Install dependencies
npm install

# Start development
npm run dev
```

---

## Migrating from Vite

### What Gets Auto-Migrated ✅

- Entry points (`index.html`, `main.ts/tsx`)
- Framework detection (React, Vue, Svelte, Solid)
- Aliases (`@/` → `src/`)
- Environment variables (`.env` files)
- CSS preprocessors (Sass, Less, PostCSS)
- Tailwind CSS configuration
- Build output settings

### Example: Vite → Lunx

**Before** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

**After** (`lunx.config.ts`):
```typescript
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'spa',
  framework: 'react',
  entry: ['index.html'],
  outDir: 'dist',
  platform: 'browser',
  
  resolve: {
    alias: {
      '@': './src'
    }
  },
  
  server: {
    port: 3000
  },
  
  build: {
    sourcemap: 'external',
    minify: true
  }
});
```

**Package.json changes**:
```json
{
  "scripts": {
    "dev": "lunx dev",
    "build": "lunx build",
    "preview": "lunx preview",
    "test": "lunx test"
  }
}
```

### Manual Steps

1. **Vite Plugins**: Check if equivalent Lunx plugins exist in marketplace
2. **Custom Rollup Plugins**: May need adaptation (see [Plugins Guide](./plugins.md))
3. **SSR**: Use `preset: 'ssr'` and configure server entry

---

## Migrating from Webpack

### What Gets Auto-Migrated ✅

- Entry points
- Output configuration
- Loaders → Lunx plugins
- Aliases
- DevServer settings
- Environment variables

### Example: Webpack → Lunx

**Before** (`webpack.config.js`):
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    port: 8080
  }
};
```

**After** (`lunx.config.ts`):
```typescript
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'spa',
  framework: 'react',
  entry: ['src/index.tsx'],
  outDir: 'dist',
  platform: 'browser',
  
  resolve: {
    alias: {
      '@': './src'
    }
  },
  
  server: {
    port: 8080
  },
  
  build: {
    hashing: 'content',
    minify: true
  }
});
```

### Common Webpack Loaders → Lunx

| Webpack Loader | Lunx Equivalent |
|----------------|------------------|
| `ts-loader` | Built-in TypeScript support |
| `babel-loader` | Built-in (via Bun parser) |
| `css-loader` | Built-in CSS support |
| `sass-loader` | `@lunx/plugin-sass` |
| `file-loader` | Built-in asset handling |
| `url-loader` | Built-in (auto inline < 4KB) |
| `svg-loader` | `@lunx/plugin-svgr` |

### Manual Steps

1. **Complex Webpack Plugins**: Check marketplace or write custom plugin
2. **Module Federation**: Use Lunx's built-in federation
3. **Custom Loaders**: Adapt to Lunx plugin API

---

## Migrating from Rollup

### What Gets Auto-Migrated ✅

- Input/output configuration
- Plugins (common ones)
- External dependencies
- Tree-shaking settings

### Example: Rollup → Lunx

**Before** (`rollup.config.js`):
```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
```

**After** (`lunx.config.ts`):
```typescript
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'spa',
  framework: 'vanilla',
  entry: ['src/index.ts'],
  outDir: 'dist',
  platform: 'browser',
  
  build: {
    format: 'esm',
    minify: true
  }
});
```

---

## Migrating from Angular CLI

### What Gets Auto-Migrated ✅

- Project structure detection
- TypeScript configuration
- Assets and styles
- Environment files
- Build configurations

### Example: Angular CLI → Lunx

**Before** (`angular.json`):
```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/my-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "styles": ["src/styles.css"],
            "scripts": []
          }
        },
        "serve": {
          "options": {
            "port": 4200
          }
        }
      }
    }
  }
}
```

**After** (`lunx.config.ts`):
```typescript
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'spa',
  framework: 'angular',
  entry: ['src/main.ts'],
  outDir: 'dist/my-app',
  platform: 'browser',
  
  server: {
    port: 4200
  },
  
  css: {
    framework: 'none'
  }
});
```

**Package.json changes**:
```json
{
  "scripts": {
    "ng": "lunx",
    "start": "lunx dev",
    "build": "lunx build",
    "test": "lunx test"
  }
}
```

---

## Migration Analyzer

Lunx includes an intelligent migration analyzer:

```bash
npx lunx migrate /path/to/project --dry-run
```

**Output**:
```
🔍 Analyzing project...

✅ Detected: Vite + React + TypeScript
✅ Found: 15 dependencies, 3 plugins
✅ Risk Level: LOW

📋 Migration Plan:
  Auto-migrate:
    ✓ Entry points (index.html, src/main.tsx)
    ✓ Aliases (@/ → src/)
    ✓ Environment variables (.env)
    ✓ Tailwind CSS config
    ✓ React Fast Refresh

  Manual steps:
    ⚠ vite-plugin-pwa → Check @lunx/plugin-pwa
    ⚠ Custom Vite plugin → Needs adaptation

📊 Expected Success Rate: 95%
⏱️  Estimated Migration Time: 15 minutes

Run without --dry-run to apply changes.
```

---

## Common Migration Patterns

### 1. Monorepo Migration

```typescript
// lunx.config.ts (root)
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'monorepo',
  workspaces: ['packages/*', 'apps/*'],
  
  build: {
    cache: true,
    parallel: true
  }
});
```

### 2. SSR Migration

```typescript
// lunx.config.ts
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'ssr',
  framework: 'react',
  
  entry: {
    client: 'src/entry-client.tsx',
    server: 'src/entry-server.tsx'
  },
  
  ssr: {
    runtime: 'node',
    port: 3000
  }
});
```

### 3. Edge Function Migration

```typescript
// lunx.config.ts
import { defineConfig } from 'lunx';

export default defineConfig({
  preset: 'edge',
  framework: 'vanilla',
  entry: ['src/index.ts'],
  
  edge: {
    target: 'cloudflare-workers',
    minify: true
  }
});
```

---

## Troubleshooting

### Issue: "Module not found"

**Cause**: Alias paths not resolved correctly

**Solution**:
```typescript
// lunx.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components'
    }
  }
});
```

### Issue: "CSS not loading"

**Cause**: CSS framework not detected

**Solution**:
```typescript
export default defineConfig({
  css: {
    framework: 'tailwind', // or 'bootstrap', 'bulma'
    purge: true
  }
});
```

### Issue: "Build slower than Vite"

**Cause**: RocksDB cache not warmed up

**Solution**: Run build twice (first run warms cache)
```bash
npm run build  # First run: ~15s (cold)
npm run build  # Second run: ~500ms (warm)
```

---

## Honest Limitations

### What Lunx Does Better ✅

- **Memory efficiency**: ~0.1MB vs 20MB+ (Vite)
- **HMR speed**: Fast updates with incremental reloads
- **Security**: Isolated plugin execution model
- **Build caching**: Persistent RocksDB cache

### What Needs Improvement ⚠️

- **Cold start**: ~15s first run (RocksDB warmup)
- **Plugin ecosystem**: Growing but smaller than Vite/Webpack
- **Documentation**: Still expanding
- **Community**: Newer, smaller community

### Not Supported Yet ❌

- **Vite-specific APIs**: Some Vite plugins won't work directly
- **Webpack loaders**: Complex loaders need adaptation
- **Legacy IE11**: Targets modern browsers only

---

## Migration Checklist

- [ ] Run `lunx migrate --dry-run`
- [ ] Review migration plan
- [ ] Backup existing config files
- [ ] Run `lunx migrate`
- [ ] Install dependencies (`npm install`)
- [ ] Test dev server (`npm run dev`)
- [ ] Test production build (`npm run build`)
- [ ] Check plugin compatibility
- [ ] Update CI/CD scripts
- [ ] Run tests
- [ ] Deploy to staging

---

## Getting Help

- **Documentation**: [https://lunx.dev/docs](https://lunx.dev/docs)
- **GitHub Issues**: [https://github.com/your-org/lunx/issues](https://github.com/your-org/lunx/issues)
- **Discord**: [https://discord.gg/lunx](https://discord.gg/lunx)
- **Migration Tool**: `lunx doctor` for diagnostics

---

## Next Steps

1. ✅ Migration complete? → [Explore Plugins](./plugins.md)
2. 🚀 Starting fresh? → [Use Starter Templates](./starters.md)
3. 📊 Performance questions? → [See Benchmarks](./benchmarks.md)
4. 🔒 Security concerns? → [Read Security Guide](./security.md)
