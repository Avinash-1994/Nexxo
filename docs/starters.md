# Nexxo Starter Templates

> **Get from zero to running app in under 5 minutes** with production-ready templates.

---

## Quick Start

```bash
# Create new project with interactive CLI
npm create nexxo@latest

# Or specify template directly
npm create nexxo@latest my-app --template react-spa

# Start development
cd my-app
npm install
npm run dev
```

---

## Available Templates

### SPA Templates

#### React SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template react-spa
```

**Includes**:
- ✅ React 18 + TypeScript
- ✅ React Router v6
- ✅ Tailwind CSS v3
- ✅ Fast Refresh HMR
- ✅ ESLint + Prettier
- ✅ Production build config

**Use Case**: Single-page applications, dashboards, admin panels

---

#### Vue SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template vue-spa
```

**Includes**:
- ✅ Vue 3 + TypeScript
- ✅ Vue Router
- ✅ Pinia (state management)
- ✅ Volar support
- ✅ Composition API

**Use Case**: Vue-based SPAs, enterprise apps

---

#### Svelte SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template svelte-spa
```

**Includes**:
- ✅ Svelte 4 + TypeScript
- ✅ SvelteKit routing
- ✅ Svelte stores
- ✅ Fast HMR

**Use Case**: Lightweight SPAs, interactive UIs

---

#### Solid SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template solid-spa
```

**Includes**:
- ✅ Solid.js + TypeScript
- ✅ Solid Router
- ✅ Fine-grained reactivity
- ✅ Minimal bundle size

**Use Case**: Performance-critical apps

---

#### Angular SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template angular-spa
```

**Includes**:
- ✅ Angular 17+
- ✅ Angular Router
- ✅ RxJS
- ✅ Standalone components
- ✅ Signals

**Use Case**: Enterprise Angular applications

---

#### Preact SPA (TypeScript)
```bash
npm create nexxo@latest my-app --template preact-spa
```

**Includes**:
- ✅ Preact + TypeScript
- ✅ Preact Router
- ✅ 3KB runtime
- ✅ React compatibility

**Use Case**: Lightweight React alternative

---

### SSR Templates

#### React SSR (Node.js)
```bash
npm create nexxo@latest my-app --template react-ssr
```

**Includes**:
- ✅ React 18 SSR
- ✅ Express server
- ✅ Streaming SSR
- ✅ Hydration
- ✅ SEO optimized

**File Structure**:
```
my-app/
├── src/
│   ├── entry-client.tsx    # Client entry
│   ├── entry-server.tsx    # Server entry
│   ├── App.tsx
│   └── server.ts           # Express server
├── nexxo.config.ts
└── package.json
```

**Use Case**: SEO-critical apps, blogs, e-commerce

**Example** (`src/entry-server.tsx`):
```typescript
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(url: string) {
  const html = renderToString(<App url={url} />);
  return { html };
}
```

---

### Edge Templates

#### Edge Function (Universal)
```bash
npm create nexxo@latest my-app --template edge-function
```

**Includes**:
- ✅ Cloudflare Workers compatible
- ✅ Vercel Edge Functions
- ✅ Netlify Edge
- ✅ Minimal bundle
- ✅ TypeScript

**File Structure**:
```
my-app/
├── src/
│   └── index.ts           # Edge function
├── nexxo.config.ts
└── wrangler.toml          # Cloudflare config
```

**Example** (`src/index.ts`):
```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('Hello from Edge!', {
      headers: { 'content-type': 'text/plain' }
    });
  }
};
```

**Use Case**: API endpoints, serverless functions, edge computing

---

### Specialized Templates

#### Fintech App (India-focused)
```bash
npm create nexxo@latest my-app --template fintech-app
```

**Includes**:
- ✅ UPI payment integration
- ✅ QR code generation
- ✅ Razorpay SDK
- ✅ Payment gateway UI
- ✅ Security best practices
- ✅ Compliance helpers

**Features**:
- UPI deep linking
- QR code scanner
- Payment status tracking
- Webhook handling
- Transaction history

**Use Case**: Payment apps, fintech startups, e-commerce (India)

**Example**:
```typescript
import { generateUPILink, createQRCode } from './utils/payment';

function PaymentPage() {
  const upiLink = generateUPILink({
    pa: 'merchant@upi',
    pn: 'Merchant Name',
    am: '100.00',
    cu: 'INR'
  });
  
  return (
    <div>
      <QRCode value={upiLink} />
      <a href={upiLink}>Pay with UPI</a>
    </div>
  );
}
```

---

#### Monorepo (PNPM)
```bash
npm create nexxo@latest my-monorepo --template monorepo
```

**Includes**:
- ✅ PNPM workspaces
- ✅ Shared packages
- ✅ Multiple apps
- ✅ Turborepo-style caching
- ✅ Parallel builds

**File Structure**:
```
my-monorepo/
├── apps/
│   ├── web/              # React app
│   └── api/              # Express API
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configs
├── nexxo.config.ts       # Root config
├── pnpm-workspace.yaml
└── package.json
```

**Use Case**: Large projects, microservices, design systems

**Example** (`nexxo.config.ts`):
```typescript
import { defineConfig } from 'nexxo';

export default defineConfig({
  preset: 'monorepo',
  
  workspaces: [
    'apps/*',
    'packages/*'
  ],
  
  build: {
    cache: true,
    parallel: 4
  }
});
```

---

## Template Features

### All Templates Include

✅ **TypeScript** - Full type safety
✅ **ESLint + Prettier** - Code quality
✅ **Git hooks** - Pre-commit linting
✅ **Production build** - Optimized output
✅ **Development server** - Fast HMR
✅ **Testing setup** - Nexxo test runner
✅ **CI/CD ready** - GitHub Actions config

### Production-Ready Configuration

Every template includes:

```typescript
// nexxo.config.ts
import { defineConfig } from 'nexxo';

export default defineConfig({
  // Optimized for production
  build: {
    minify: true,
    sourcemap: 'external',
    splitting: true,
    hashing: 'content'
  },
  
  // Security headers
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  
  // Performance
  rocksdb: {
    blockCacheSize: '1GB',
    lruCache: true
  }
});
```

---

## Customizing Templates

### Adding Features

```bash
# Add Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Add state management
npm install zustand

# Add routing
npm install react-router-dom
```

### Modifying Config

```typescript
// nexxo.config.ts
import { defineConfig } from 'nexxo';

export default defineConfig({
  // Change output directory
  outDir: 'build',
  
  // Add aliases
  resolve: {
    alias: {
      '@components': './src/components',
      '@utils': './src/utils'
    }
  },
  
  // Add plugins
  plugins: [
    // Your plugins here
  ]
});
```

---

## Template Comparison

| Template | Bundle Size | Build Time | Best For |
|----------|-------------|------------|----------|
| React SPA | ~150KB | 500ms | General SPAs |
| Vue SPA | ~120KB | 450ms | Vue apps |
| Svelte SPA | ~50KB | 400ms | Lightweight apps |
| Solid SPA | ~30KB | 350ms | Performance-critical |
| Preact SPA | ~40KB | 380ms | Size-constrained |
| React SSR | ~180KB | 600ms | SEO apps |
| Edge Function | ~10KB | 300ms | Serverless |
| Fintech App | ~200KB | 650ms | Payment apps |
| Monorepo | Varies | Parallel | Large projects |

---

## Example: Creating a Blog

```bash
# 1. Create project
npm create nexxo@latest my-blog --template react-ssr

# 2. Install dependencies
cd my-blog
npm install

# 3. Add markdown support
npm install marked gray-matter

# 4. Create blog structure
mkdir -p src/posts
```

**File**: `src/posts/hello-world.md`
```markdown
---
title: Hello World
date: 2026-01-16
---

# Hello World

This is my first blog post!
```

**File**: `src/Blog.tsx`
```typescript
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import matter from 'gray-matter';

export function Blog() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    // Load posts
    const postFiles = import.meta.glob('./posts/*.md', { as: 'raw' });
    
    Promise.all(
      Object.entries(postFiles).map(async ([path, loader]) => {
        const content = await loader();
        const { data, content: markdown } = matter(content);
        return {
          ...data,
          html: marked(markdown),
          slug: path.match(/\/([^/]+)\.md$/)[1]
        };
      })
    ).then(setPosts);
  }, []);
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <time>{post.date}</time>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      ))}
    </div>
  );
}
```

```bash
# 5. Run development server
npm run dev

# 6. Build for production
npm run build

# 7. Preview production build
npm run preview
```

---

## Example: E-commerce Store

```bash
# 1. Create project
npm create nexxo@latest my-store --template react-spa

# 2. Install dependencies
cd my-store
npm install
npm install @stripe/stripe-js zustand

# 3. Add Stripe integration
```

**File**: `src/store/cart.ts`
```typescript
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  total: () => get().items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )
}));
```

---

## Troubleshooting

### Template Not Found

**Issue**: `Error: Template 'xyz' not found`

**Solution**:
```bash
# List available templates
npm create nexxo@latest --list-templates

# Use exact template name
npm create nexxo@latest my-app --template react-spa
```

### Build Errors

**Issue**: Template builds locally but fails in CI

**Solution**: Check Node version
```json
// package.json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## Next Steps

- 📚 [Migration Guide](./migration.md) - Migrate existing projects
- 🔌 [Plugins Guide](./plugins.md) - Add functionality
- 📊 [Benchmarks](./benchmarks.md) - Performance data
- 🔒 [Security Guide](./security.md) - Security best practices

---

## Template Requests

Missing a template? [Request it on GitHub](https://github.com/your-org/nexxo/issues/new?template=template_request.md)

Popular requests:
- [ ] Next.js-style template
- [ ] Astro-style template
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Chrome extension
