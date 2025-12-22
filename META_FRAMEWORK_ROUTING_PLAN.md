# 🚀 META-FRAMEWORK ROUTING & SSR IMPLEMENTATION PLAN

**Created:** 2025-12-22  
**Priority:** P0 (Critical for v1.0)  
**Status:** Planning Phase  
**Estimated Time:** 2-3 weeks

---

## 🎯 OBJECTIVE

Implement production-ready file-based routing and server-side rendering (SSR) support for Next.js 14, Nuxt 3, and Remix. This will complete the meta-framework support beyond just component transformation.

---

## 📋 CURRENT STATE

### ✅ What We Have
- **Universal Component Transformation**: All meta-frameworks can transform their components (React/Vue).
- **Build Pipeline**: Production builds work for static components.
- **Dev Server**: Fast HMR for component changes.

### ❌ What's Missing
- **File-Based Routing**: No automatic route generation from file structure.
- **SSR/SSG**: No server-side rendering or static site generation.
- **Data Fetching**: No support for `getServerSideProps`, `loader`, etc.
- **API Routes**: No API endpoint handling.

---

## 🏗️ ARCHITECTURE APPROACH

### Phase 1: Routing Foundation (Week 1)

#### 1.1 Next.js Routing
**Target:** Support both `pages/` and `app/` directory conventions.

**Implementation:**
```typescript
// src/meta-frameworks/nextjs/router.ts
export class NextJsRouter {
  async scanRoutes(root: string): Promise<Route[]> {
    // Scan pages/ directory
    const pagesRoutes = await this.scanPagesDir(path.join(root, 'pages'));
    
    // Scan app/ directory (Next.js 13+)
    const appRoutes = await this.scanAppDir(path.join(root, 'app'));
    
    return [...pagesRoutes, ...appRoutes];
  }
  
  private async scanPagesDir(dir: string): Promise<Route[]> {
    // pages/index.tsx -> /
    // pages/about.tsx -> /about
    // pages/blog/[slug].tsx -> /blog/:slug
    // pages/api/users.ts -> API route
  }
  
  private async scanAppDir(dir: string): Promise<Route[]> {
    // app/page.tsx -> /
    // app/blog/page.tsx -> /blog
    // app/blog/[slug]/page.tsx -> /blog/:slug
  }
}
```

**Features:**
- [x] Dynamic routes (`[id]`, `[...slug]`)
- [x] Nested routes
- [x] API routes (`pages/api/*`)
- [x] Catch-all routes
- [x] Optional catch-all (`[[...slug]]`)

#### 1.2 Nuxt 3 Routing
**Target:** Auto-routing from `pages/` directory.

**Implementation:**
```typescript
// src/meta-frameworks/nuxt/router.ts
export class NuxtRouter {
  async scanRoutes(root: string): Promise<Route[]> {
    const pagesDir = path.join(root, 'pages');
    
    // pages/index.vue -> /
    // pages/about.vue -> /about
    // pages/blog/[id].vue -> /blog/:id
    // pages/[...slug].vue -> /:slug(.*)
    
    return this.buildRouteTree(pagesDir);
  }
}
```

**Features:**
- [x] Dynamic routes (`[id]`)
- [x] Nested routes (automatic from folder structure)
- [x] Catch-all routes (`[...slug]`)
- [x] Middleware support

#### 1.3 Remix Routing
**Target:** Nested routing with loaders and actions.

**Implementation:**
```typescript
// src/meta-frameworks/remix/router.ts
export class RemixRouter {
  async scanRoutes(root: string): Promise<Route[]> {
    const appDir = path.join(root, 'app/routes');
    
    // app/routes/_index.tsx -> /
    // app/routes/about.tsx -> /about
    // app/routes/blog.$slug.tsx -> /blog/:slug
    // app/routes/blog._index.tsx -> /blog
    
    return this.buildRemixRoutes(appDir);
  }
}
```

**Features:**
- [x] Nested routes (via `.` notation)
- [x] Layout routes (`_layout`)
- [x] Pathless routes (`__`)
- [x] Dynamic segments (`$param`)

---

### Phase 2: SSR Pipeline (Week 2)

#### 2.1 Server Runtime
**Goal:** Create a lightweight Node.js server for SSR.

**Implementation:**
```typescript
// src/meta-frameworks/ssr/server.ts
export class SSRServer {
  private app: Express;
  private routes: Route[];
  
  async start(config: SSRConfig) {
    this.app = express();
    
    // Serve static assets
    this.app.use('/assets', express.static(config.outDir));
    
    // Handle SSR routes
    for (const route of this.routes) {
      this.app.get(route.path, async (req, res) => {
        const html = await this.renderRoute(route, req);
        res.send(html);
      });
    }
    
    this.app.listen(config.port);
  }
  
  private async renderRoute(route: Route, req: Request): Promise<string> {
    // Import the route component
    const Component = await import(route.filePath);
    
    // Fetch data if needed
    const data = await this.fetchData(route, req);
    
    // Render to HTML
    const html = await this.renderToString(Component, data);
    
    return this.wrapInDocument(html, data);
  }
}
```

#### 2.2 Data Fetching
**Goal:** Support framework-specific data fetching patterns.

**Next.js:**
```typescript
// Support getServerSideProps, getStaticProps
export async function fetchNextData(route: Route, req: Request) {
  const module = await import(route.filePath);
  
  if (module.getServerSideProps) {
    const { props } = await module.getServerSideProps({ req });
    return props;
  }
  
  if (module.getStaticProps) {
    const { props } = await module.getStaticProps();
    return props;
  }
  
  return {};
}
```

**Remix:**
```typescript
// Support loader and action
export async function fetchRemixData(route: Route, req: Request) {
  const module = await import(route.filePath);
  
  if (req.method === 'GET' && module.loader) {
    return await module.loader({ request: req });
  }
  
  if (req.method === 'POST' && module.action) {
    return await module.action({ request: req });
  }
  
  return {};
}
```

**Nuxt:**
```typescript
// Support useAsyncData, useFetch
export async function fetchNuxtData(route: Route, req: Request) {
  // Nuxt 3 uses composables, need to simulate server context
  const module = await import(route.filePath);
  
  // Execute setup() in server context
  return await executeNuxtSetup(module.default, req);
}
```

---

### Phase 3: Static Site Generation (Week 3)

#### 3.1 Pre-rendering
**Goal:** Generate static HTML for all routes at build time.

**Implementation:**
```typescript
// src/meta-frameworks/ssg/generator.ts
export class SSGGenerator {
  async generate(config: SSGConfig) {
    const routes = await this.router.scanRoutes(config.root);
    
    for (const route of routes) {
      // Skip dynamic routes (or generate with fallback)
      if (route.isDynamic && !config.paths?.[route.path]) {
        continue;
      }
      
      // Render route to HTML
      const html = await this.renderRoute(route);
      
      // Write to output directory
      const outputPath = this.getOutputPath(route);
      await fs.writeFile(outputPath, html);
    }
  }
}
```

#### 3.2 Incremental Static Regeneration (ISR)
**Goal:** Support Next.js ISR and Nuxt's hybrid rendering.

**Implementation:**
```typescript
// Track revalidation times
export class ISRCache {
  private cache: Map<string, { html: string; timestamp: number }>;
  
  async get(path: string, revalidate: number): Promise<string | null> {
    const cached = this.cache.get(path);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > revalidate * 1000) {
      return null; // Stale, need to regenerate
    }
    
    return cached.html;
  }
  
  set(path: string, html: string) {
    this.cache.set(path, { html, timestamp: Date.now() });
  }
}
```

---

## 📦 DELIVERABLES

### Week 1: Routing
- [ ] Next.js router implementation
- [ ] Nuxt 3 router implementation
- [ ] Remix router implementation
- [ ] Route manifest generator
- [ ] Dev server integration

### Week 2: SSR
- [ ] SSR server runtime
- [ ] Data fetching for each framework
- [ ] HTML rendering pipeline
- [ ] Hydration script injection
- [ ] API route handling

### Week 3: SSG
- [ ] Static site generator
- [ ] Pre-rendering for all routes
- [ ] ISR support
- [ ] Build-time optimization
- [ ] Deployment adapters (Vercel, Netlify, Cloudflare)

---

## 🧪 TESTING STRATEGY

### Test Projects
1. **Next.js 14 App**
   - Pages router example
   - App router example
   - API routes
   - Dynamic routes
   - SSG + ISR

2. **Nuxt 3 App**
   - Auto-routing
   - Nested layouts
   - Server middleware
   - Hybrid rendering

3. **Remix App**
   - Nested routes
   - Loaders and actions
   - Error boundaries
   - Optimistic UI

---

## 🎯 SUCCESS CRITERIA

- [ ] All three meta-frameworks can build and serve SSR apps
- [ ] File-based routing works automatically
- [ ] Data fetching patterns are supported
- [ ] Static generation works for all routes
- [ ] Performance: <200ms SSR response time
- [ ] Dev experience: HMR works with routing changes

---

## 🚀 NEXT ACTIONS

1. **Create Router Implementations** (Days 1-3)
2. **Build SSR Server** (Days 4-6)
3. **Implement Data Fetching** (Days 7-9)
4. **Add SSG Support** (Days 10-12)
5. **Test & Optimize** (Days 13-15)
6. **Documentation** (Days 16-18)

---

**Status:** Ready to begin implementation. All framework transformers are in place, now we add the routing layer on top.
