# Nexxo Plugins Guide

> **100+ production-ready plugins** with WASM sandboxing and WebCrypto signing.

---

## Quick Start

```bash
# Search for plugins
nexxo plugin search react

# Install a plugin
nexxo plugin install @nexxo/plugin-react

# List installed plugins
nexxo plugin list

# Verify plugin signatures
nexxo plugin verify @nexxo/plugin-react
```

---

## Using Plugins

### In `nexxo.config.ts`

```typescript
import { defineConfig } from 'nexxo';
import react from '@nexxo/plugin-react';
import tailwind from '@nexxo/plugin-tailwind';
import pwa from '@nexxo/plugin-pwa';

export default defineConfig({
  preset: 'spa',
  
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: ['babel-plugin-styled-components']
      }
    }),
    
    tailwind({
      config: './tailwind.config.js'
    }),
    
    pwa({
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#000000'
      }
    })
  ]
});
```

---

## Plugin Categories

### Framework Plugins

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-react` | React Fast Refresh + JSX | `nexxo plugin install @nexxo/plugin-react` |
| `@nexxo/plugin-vue` | Vue 3 SFC support | `nexxo plugin install @nexxo/plugin-vue` |
| `@nexxo/plugin-svelte` | Svelte compiler | `nexxo plugin install @nexxo/plugin-svelte` |
| `@nexxo/plugin-solid` | Solid.js JSX | `nexxo plugin install @nexxo/plugin-solid` |
| `@nexxo/plugin-angular` | Angular AOT compiler | `nexxo plugin install @nexxo/plugin-angular` |
| `@nexxo/plugin-preact` | Preact with Fast Refresh | `nexxo plugin install @nexxo/plugin-preact` |

### CSS & Styling

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-tailwind` | Tailwind CSS v3+ | `nexxo plugin install @nexxo/plugin-tailwind` |
| `@nexxo/plugin-sass` | Sass/SCSS compiler | `nexxo plugin install @nexxo/plugin-sass` |
| `@nexxo/plugin-less` | Less compiler | `nexxo plugin install @nexxo/plugin-less` |
| `@nexxo/plugin-postcss` | PostCSS processor | `nexxo plugin install @nexxo/plugin-postcss` |
| `@nexxo/plugin-styled-components` | CSS-in-JS support | `nexxo plugin install @nexxo/plugin-styled-components` |
| `@nexxo/plugin-emotion` | Emotion CSS-in-JS | `nexxo plugin install @nexxo/plugin-emotion` |

### Assets & Media

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-svgr` | SVG to React components | `nexxo plugin install @nexxo/plugin-svgr` |
| `@nexxo/plugin-image-optimizer` | Image compression | `nexxo plugin install @nexxo/plugin-image-optimizer` |
| `@nexxo/plugin-webp` | WebP conversion | `nexxo plugin install @nexxo/plugin-webp` |
| `@nexxo/plugin-fonts` | Font optimization | `nexxo plugin install @nexxo/plugin-fonts` |

### Performance

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-compression` | Gzip/Brotli compression | `nexxo plugin install @nexxo/plugin-compression` |
| `@nexxo/plugin-preload` | Resource preloading | `nexxo plugin install @nexxo/plugin-preload` |
| `@nexxo/plugin-lazy-load` | Code splitting helpers | `nexxo plugin install @nexxo/plugin-lazy-load` |
| `@nexxo/plugin-bundle-analyzer` | Bundle size analysis | `nexxo plugin install @nexxo/plugin-bundle-analyzer` |

### Security

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-csp` | Content Security Policy | `nexxo plugin install @nexxo/plugin-csp` |
| `@nexxo/plugin-sri` | Subresource Integrity | `nexxo plugin install @nexxo/plugin-sri` |
| `@nexxo/plugin-security-headers` | HTTP security headers | `nexxo plugin install @nexxo/plugin-security-headers` |

### Testing

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-vitest` | Vitest integration | `nexxo plugin install @nexxo/plugin-vitest` |
| `@nexxo/plugin-jest` | Jest integration | `nexxo plugin install @nexxo/plugin-jest` |
| `@nexxo/plugin-playwright` | E2E testing | `nexxo plugin install @nexxo/plugin-playwright` |

### i18n

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-i18next` | i18next integration | `nexxo plugin install @nexxo/plugin-i18next` |
| `@nexxo/plugin-react-intl` | React Intl | `nexxo plugin install @nexxo/plugin-react-intl` |
| `@nexxo/plugin-vue-i18n` | Vue I18n | `nexxo plugin install @nexxo/plugin-vue-i18n` |

### State Management

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-redux` | Redux DevTools | `nexxo plugin install @nexxo/plugin-redux` |
| `@nexxo/plugin-zustand` | Zustand integration | `nexxo plugin install @nexxo/plugin-zustand` |
| `@nexxo/plugin-jotai` | Jotai atoms | `nexxo plugin install @nexxo/plugin-jotai` |

### Deployment

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-vercel` | Vercel deployment | `nexxo plugin install @nexxo/plugin-vercel` |
| `@nexxo/plugin-netlify` | Netlify deployment | `nexxo plugin install @nexxo/plugin-netlify` |
| `@nexxo/plugin-cloudflare` | Cloudflare Workers | `nexxo plugin install @nexxo/plugin-cloudflare` |
| `@nexxo/plugin-docker` | Docker containerization | `nexxo plugin install @nexxo/plugin-docker` |

### Analytics

| Plugin | Description | Install |
|--------|-------------|---------|
| `@nexxo/plugin-google-analytics` | GA4 integration | `nexxo plugin install @nexxo/plugin-google-analytics` |
| `@nexxo/plugin-plausible` | Plausible Analytics | `nexxo plugin install @nexxo/plugin-plausible` |
| `@nexxo/plugin-sentry` | Error tracking | `nexxo plugin install @nexxo/plugin-sentry` |

---

## Plugin Security

### WASM Sandboxing

All plugins run in **WASM-isolated environments**:

```typescript
// Plugins CANNOT:
❌ Access filesystem directly
❌ Make network requests
❌ Execute arbitrary code
❌ Access environment variables

// Plugins CAN:
✅ Transform code
✅ Generate assets
✅ Emit warnings/errors
✅ Use approved APIs
```

### Signature Verification

Every plugin is **cryptographically signed**:

```bash
# Verify plugin signature
nexxo plugin verify @nexxo/plugin-react

# Output:
✅ Signature valid
✅ Publisher: Nexxo Team
✅ Published: 2026-01-15
✅ SHA-256: a3f2...
```

### Plugin Manifest

```json
{
  "name": "@nexxo/plugin-react",
  "version": "2.0.0",
  "author": "Nexxo Team",
  "signature": "...",
  "permissions": [
    "transform:jsx",
    "emit:assets"
  ],
  "sandbox": "wasm",
  "verified": true
}
```

---

## Writing Custom Plugins

### Basic Plugin Structure

```typescript
// my-plugin.ts
import { NexxoPlugin } from 'nexxo';

export default function myPlugin(options = {}): NexxoPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    // Transform hook
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCode(code),
          map: generateSourceMap()
        };
      }
    },
    
    // Build start hook
    buildStart() {
      console.log('Build starting...');
    },
    
    // Build end hook
    buildEnd() {
      console.log('Build complete!');
    }
  };
}
```

### Plugin Hooks

```typescript
export interface NexxoPlugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  buildStart?(): void;
  buildEnd?(): void;
  
  // Transform hooks
  transform?(code: string, id: string): TransformResult;
  load?(id: string): string | null;
  resolveId?(source: string, importer: string): string | null;
  
  // Asset hooks
  generateBundle?(bundle: Bundle): void;
  writeBundle?(bundle: Bundle): void;
  
  // Dev server hooks
  configureServer?(server: DevServer): void;
  handleHotUpdate?(ctx: HmrContext): void;
}
```

### Example: Custom Markdown Plugin

```typescript
import { NexxoPlugin } from 'nexxo';
import { marked } from 'marked';

export default function markdownPlugin(): NexxoPlugin {
  return {
    name: 'nexxo-plugin-markdown',
    version: '1.0.0',
    
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      
      const html = marked(code);
      
      return {
        code: `export default ${JSON.stringify(html)}`,
        map: null
      };
    }
  };
}
```

**Usage**:
```typescript
// nexxo.config.ts
import markdown from './my-plugin';

export default defineConfig({
  plugins: [markdown()]
});
```

```typescript
// app.tsx
import content from './README.md';

function App() {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

---

## Plugin Compatibility

### Vite Plugin Adapter

```typescript
import { defineConfig } from 'nexxo';
import { vitePluginAdapter } from '@nexxo/plugin-compat';
import viteReactSvgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    // Wrap Vite plugin
    vitePluginAdapter(viteReactSvgr())
  ]
});
```

**Compatibility**: ~80% of Vite plugins work with adapter

### Webpack Loader Adapter

```typescript
import { webpackLoaderAdapter } from '@nexxo/plugin-compat';

export default defineConfig({
  plugins: [
    webpackLoaderAdapter({
      test: /\.custom$/,
      loader: 'custom-loader',
      options: {}
    })
  ]
});
```

**Compatibility**: ~70% of Webpack loaders work with adapter

---

## Plugin Marketplace

### Browse Plugins

```bash
# List all plugins
nexxo plugin list --all

# Search by category
nexxo plugin search --category framework

# Filter by verified
nexxo plugin search --verified
```

### Plugin Ratings

```bash
# View plugin details
nexxo plugin info @nexxo/plugin-react

# Output:
📦 @nexxo/plugin-react v2.0.0
⭐ 4.8/5.0 (1,234 reviews)
📥 50,000 downloads/week
✅ Verified by Nexxo Team
🔒 WASM sandboxed
📝 React Fast Refresh + JSX transform
```

---

## Troubleshooting

### Plugin Not Loading

**Issue**: Plugin installed but not working

**Solution**:
```typescript
// Check plugin is in config
export default defineConfig({
  plugins: [
    myPlugin() // ← Make sure it's called as function
  ]
});
```

### Signature Verification Failed

**Issue**: `⚠️ Signature verification failed`

**Solution**:
```bash
# Re-install plugin
npm uninstall @nexxo/plugin-name
nexxo plugin install @nexxo/plugin-name

# Or skip verification (not recommended)
nexxo plugin install @nexxo/plugin-name --skip-verify
```

### Plugin Conflicts

**Issue**: Two plugins transforming same files

**Solution**: Use `enforce` option
```typescript
export default defineConfig({
  plugins: [
    pluginA({ enforce: 'pre' }),  // Runs first
    pluginB({ enforce: 'post' })  // Runs last
  ]
});
```

---

## Best Practices

### 1. Use Official Plugins First

✅ **Good**:
```typescript
import react from '@nexxo/plugin-react';
```

⚠️ **Avoid** (unless necessary):
```typescript
import react from 'some-unofficial-plugin';
```

### 2. Verify Plugin Signatures

```bash
# Always verify before using
nexxo plugin verify @nexxo/plugin-name
```

### 3. Minimal Plugin Configuration

✅ **Good**:
```typescript
plugins: [
  react() // Use defaults
]
```

⚠️ **Avoid**:
```typescript
plugins: [
  react({
    // Too many custom options = harder to maintain
  })
]
```

### 4. Check Plugin Performance

```bash
# Profile plugin impact
nexxo build --profile

# Output shows plugin timings
```

---

## Plugin Development

### Publishing a Plugin

```bash
# 1. Build plugin
npm run build

# 2. Sign plugin
nexxo plugin sign ./dist

# 3. Publish to marketplace
nexxo plugin publish

# 4. Verify published
nexxo plugin verify @your-org/your-plugin
```

### Plugin Testing

```typescript
// plugin.test.ts
import { describe, it, expect } from '@nexxo/test';
import myPlugin from './plugin';

describe('My Plugin', () => {
  it('should transform code', () => {
    const plugin = myPlugin();
    const result = plugin.transform('input', 'file.custom');
    
    expect(result.code).toContain('transformed');
  });
});
```

---

## Next Steps

- 📚 [Migration Guide](./migration.md) - Migrate existing projects
- 🚀 [Starter Templates](./starters.md) - Start with templates
- 📊 [Benchmarks](./benchmarks.md) - Performance comparisons
- 🔒 [Security Guide](./security.md) - Security best practices
