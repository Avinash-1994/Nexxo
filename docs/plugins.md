# Lunx Plugins Guide

> **Plugin ecosystem with sandboxing support and WebCrypto signing support.**

---

## Quick Start

```bash
# Search for plugins
lunx plugin search react

# Install a plugin
lunx plugin install @lunx/plugin-react

# List installed plugins
lunx plugin list

# Verify plugin signatures
lunx plugin verify @lunx/plugin-react
```

---

## Using Plugins

### In `lunx.config.ts`

```typescript
import { defineConfig } from 'lunx';
import react from '@lunx/plugin-react';
import tailwind from '@lunx/plugin-tailwind';
import pwa from '@lunx/plugin-pwa';

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
| `@lunx/plugin-react` | React Fast Refresh + JSX | `lunx plugin install @lunx/plugin-react` |
| `@lunx/plugin-vue` | Vue 3 SFC support | `lunx plugin install @lunx/plugin-vue` |
| `@lunx/plugin-svelte` | Svelte compiler | `lunx plugin install @lunx/plugin-svelte` |
| `@lunx/plugin-solid` | Solid.js JSX | `lunx plugin install @lunx/plugin-solid` |
| `@lunx/plugin-angular` | Angular AOT compiler | `lunx plugin install @lunx/plugin-angular` |
| `@lunx/plugin-preact` | Preact with Fast Refresh | `lunx plugin install @lunx/plugin-preact` |

### CSS & Styling

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-tailwind` | Tailwind CSS v3+ | `lunx plugin install @lunx/plugin-tailwind` |
| `@lunx/plugin-sass` | Sass/SCSS compiler | `lunx plugin install @lunx/plugin-sass` |
| `@lunx/plugin-less` | Less compiler | `lunx plugin install @lunx/plugin-less` |
| `@lunx/plugin-postcss` | PostCSS processor | `lunx plugin install @lunx/plugin-postcss` |
| `@lunx/plugin-styled-components` | CSS-in-JS support | `lunx plugin install @lunx/plugin-styled-components` |
| `@lunx/plugin-emotion` | Emotion CSS-in-JS | `lunx plugin install @lunx/plugin-emotion` |

### Assets & Media

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-svgr` | SVG to React components | `lunx plugin install @lunx/plugin-svgr` |
| `@lunx/plugin-image-optimizer` | Image compression | `lunx plugin install @lunx/plugin-image-optimizer` |
| `@lunx/plugin-webp` | WebP conversion | `lunx plugin install @lunx/plugin-webp` |
| `@lunx/plugin-fonts` | Font optimization | `lunx plugin install @lunx/plugin-fonts` |

### Performance

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-compression` | Gzip/Brotli compression | `lunx plugin install @lunx/plugin-compression` |
| `@lunx/plugin-preload` | Resource preloading | `lunx plugin install @lunx/plugin-preload` |
| `@lunx/plugin-lazy-load` | Code splitting helpers | `lunx plugin install @lunx/plugin-lazy-load` |
| `@lunx/plugin-bundle-analyzer` | Bundle size analysis | `lunx plugin install @lunx/plugin-bundle-analyzer` |

### Security

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-csp` | Content Security Policy | `lunx plugin install @lunx/plugin-csp` |
| `@lunx/plugin-sri` | Subresource Integrity | `lunx plugin install @lunx/plugin-sri` |
| `@lunx/plugin-security-headers` | HTTP security headers | `lunx plugin install @lunx/plugin-security-headers` |

### Testing

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-vitest` | Vitest integration | `lunx plugin install @lunx/plugin-vitest` |
| `@lunx/plugin-jest` | Jest integration | `lunx plugin install @lunx/plugin-jest` |
| `@lunx/plugin-playwright` | E2E testing | `lunx plugin install @lunx/plugin-playwright` |

### i18n

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-i18next` | i18next integration | `lunx plugin install @lunx/plugin-i18next` |
| `@lunx/plugin-react-intl` | React Intl | `lunx plugin install @lunx/plugin-react-intl` |
| `@lunx/plugin-vue-i18n` | Vue I18n | `lunx plugin install @lunx/plugin-vue-i18n` |

### State Management

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-redux` | Redux DevTools | `lunx plugin install @lunx/plugin-redux` |
| `@lunx/plugin-zustand` | Zustand integration | `lunx plugin install @lunx/plugin-zustand` |
| `@lunx/plugin-jotai` | Jotai atoms | `lunx plugin install @lunx/plugin-jotai` |

### Deployment

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-vercel` | Vercel deployment | `lunx plugin install @lunx/plugin-vercel` |
| `@lunx/plugin-netlify` | Netlify deployment | `lunx plugin install @lunx/plugin-netlify` |
| `@lunx/plugin-cloudflare` | Cloudflare Workers | `lunx plugin install @lunx/plugin-cloudflare` |
| `@lunx/plugin-docker` | Docker containerization | `lunx plugin install @lunx/plugin-docker` |

### Analytics

| Plugin | Description | Install |
|--------|-------------|---------|
| `@lunx/plugin-google-analytics` | GA4 integration | `lunx plugin install @lunx/plugin-google-analytics` |
| `@lunx/plugin-plausible` | Plausible Analytics | `lunx plugin install @lunx/plugin-plausible` |
| `@lunx/plugin-sentry` | Error tracking | `lunx plugin install @lunx/plugin-sentry` |

---

## Plugin Security

### Plugin Security Model

Lunx currently executes plugins in an isolated VM-based runtime with strict permission controls. A secure WASM runtime for plugin execution is planned, but the current model is based on runtime isolation and API safety checks.

Plugins are subject to explicit permissions:
- Filesystem access is denied by default and only granted for approved paths.
- Environment variables are only available when the plugin is loaded with an explicit env allowlist.
- `require()` is whitelisted to a small set of safe built-ins (`fs`, `path`) and all other module imports are blocked.
- Network access is blocked by default because no network globals are exposed in the sandbox (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` are removed).

```typescript
// Plugins SHOULD NOT:
❌ Access filesystem directly without permission
❌ Make network requests
❌ Execute arbitrary code
❌ Access environment variables unless explicitly allowed

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
lunx plugin verify @lunx/plugin-react

# Output:
✅ Signature valid
✅ Publisher: Lunx Team
✅ Published: 2026-01-15
✅ SHA-256: a3f2...
```

### Plugin Manifest

```json
{
  "name": "@lunx/plugin-react",
  "version": "2.0.0",
  "author": "Lunx Team",
  "signature": "...",
  "permissions": [
    "transform:jsx",
    "emit:assets"
  ],
  "sandbox": "isolated",
  "verified": true
}
```

---

## Writing Custom Plugins

### Basic Plugin Structure

```typescript
// my-plugin.ts
import { LunxPlugin } from 'lunx';

export default function myPlugin(options = {}): LunxPlugin {
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
export interface LunxPlugin {
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
import { LunxPlugin } from 'lunx';
import { marked } from 'marked';

export default function markdownPlugin(): LunxPlugin {
  return {
    name: 'lunx-plugin-markdown',
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
// lunx.config.ts
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
import { defineConfig } from 'lunx';
import { rollupAdapter } from '@lunx/plugin-compat';
import viteReactSvgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    // Wrap Vite plugin
    rollupAdapter(viteReactSvgr())
  ]
});
```

**Compatibility**: Experimental and plugin-dependent; many Vite plugins can work with adapter

### Webpack Loader Adapter

```typescript
import { webpackLoaderAdapter } from '@lunx/plugin-compat';

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

**Compatibility**: Experimental and plugin-dependent; many Webpack loaders can work with adapter

---

## Plugin Marketplace

### Browse Plugins

```bash
# List all plugins
lunx plugin list --all

# Search by category
lunx plugin search --category framework

# Filter by verified
lunx plugin search --verified
```

### Plugin Ratings

```bash
# View plugin details
lunx plugin info @lunx/plugin-react

# Output:
📦 @lunx/plugin-react v2.0.0
⭐ 4.8/5.0 (1,234 reviews)
📥 50,000 downloads/week
✅ Verified by Lunx Team
🔒 Secure isolated plugin runtime
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
npm uninstall @lunx/plugin-name
lunx plugin install @lunx/plugin-name

# Or skip verification (not recommended)
lunx plugin install @lunx/plugin-name --skip-verify
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
import react from '@lunx/plugin-react';
```

⚠️ **Avoid** (unless necessary):
```typescript
import react from 'some-unofficial-plugin';
```

### 2. Verify Plugin Signatures

```bash
# Always verify before using
lunx plugin verify @lunx/plugin-name
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
lunx build --profile

# Output shows plugin timings
```

---

## Plugin Development

### Publishing a Plugin

```bash
# 1. Build plugin
npm run build

# 2. Sign plugin
lunx plugin sign ./dist

# 3. Publish to marketplace
lunx plugin publish

# 4. Verify published
lunx plugin verify @your-org/your-plugin
```

### Plugin Testing

```typescript
// plugin.test.ts
import { describe, it, expect } from '@lunx/test';
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
