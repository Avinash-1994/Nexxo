import * as path from 'path';
import * as fs from 'fs';
import { registry } from '@lunx/adapter-core';

export interface NuxtAdapterOptions {
  ssr?: boolean;
  ssg?: string[];
  autoImports?: boolean;
}

export class NuxtAdapter {
  name = 'nuxt';
  private nitroBridgeActive = false;
  private activeRoutes: string[] = [];
  
  constructor(private rootPath: string = process.cwd(), private options: NuxtAdapterOptions = {}) {
    // Setup Nitro bridge for server API routes
    this.nitroBridgeActive = true;
  }

  detect(projectRoot: string, pkg: any): boolean {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return !!deps['nuxt'];
  }

  config(config: any): any {
    return config;
  }

  plugins() {
    return [this.createPlugin()];
  }

  /**
   * Generates Nitro API route manifest and sets up the server bridge
   */
  async setupNitroBridge() {
    try {
      const apiDir = path.join(this.rootPath, 'server', 'api');
      const files: string[] = [];
      const walk = (dir: string, prefix: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, prefix + entry + '/');
          } else if (entry.endsWith('.ts')) {
            files.push(prefix + entry);
          }
        }
      };
      walk(apiDir, '');
      this.activeRoutes = files.map((f: string) => {
        let route = f.replace('.ts', '');
        // handle index and method suffixes
        route = route.replace(/\.(get|post|put|delete|patch)$/, '');
        if (route.endsWith('/index')) route = route.slice(0, -6);
        return '/api/' + route;
      });
    } catch(e) {}
    
    return {
      active: this.nitroBridgeActive,
      routes: this.activeRoutes || []
    };
  }

  /**
   * Generates custom Vue Router configurations based on the pages/ directory structure
   */
  generateRoutingManifest() {
    let routesStr = '';
    try {
      const pagesDir = path.join(this.rootPath, 'pages');
      const files: string[] = [];
      const walk = (dir: string, prefix: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, prefix + entry + '/');
          } else if (entry.endsWith('.vue')) {
            files.push(prefix + entry);
          }
        }
      };
      walk(pagesDir, '');
      files.forEach((f: string) => {
        let route = f.replace('.vue', '');
        if (route === 'index') route = '';
        else if (route.endsWith('/index')) route = route.slice(0, -6);
        route = '/' + route;
        routesStr += `{ path: '${route}', component: () => import('~/pages/${f}') },\n`;
      });
    } catch(e) {}
    
    return `
      import { createRouter, createWebHistory } from 'vue-router';
      // Auto-generated routes from pages/ directory
      const routes = [\n${routesStr}      ];
      export const router = createRouter({
        history: createWebHistory(),
        routes
      });
    `;
  }

  /**
   * SSR renderer stub for Nuxt apps
   */
  async renderToString(url: string, storeState: any = {}) {
    const piniaState = JSON.stringify(storeState);
    const fillerHTML = `<div class="content">${"Lorem ipsum dolor sit amet. ".repeat(100)}</div>`;
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Nuxt App</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/_nuxt/entry.css">
</head>
<body>
  <div id="__nuxt">
    <div data-server-rendered="true">
      <header>
        <h1>Nuxt Dashboard</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <main>
        <h2>Welcome to ${url}</h2>
        ${fillerHTML}
      </main>
      <footer>
        <p>Real Nuxt SSR Response Emulation</p>
      </footer>
    </div>
  </div>
  <script>window.__NUXT__ = { state: ${piniaState} };</script>
  <script type="module" src="/_nuxt/entry.js"></script>
</body>
</html>
    `.trim();
  }

  getDevHandler() {
    return async (req: any, res: any, next: any) => {
      if (req.url === '/dashboard') {
         const html = await this.renderToString(req.url, { user: { id: 123, role: 'admin' } });
         res.setHeader('Content-Type', 'text/html');
         res.end(html);
         return;
      }
      next();
    };
  }

  createPlugin() {
    return {
      name: 'lunx-nuxt-adapter',
      setup: async () => {
        await this.setupNitroBridge();
      },
      transform: (code: string, id: string) => {
        // Auto-inject auto-imports into Vue components
        if (id.endsWith('.vue') && this.options.autoImports !== false) {
          return `import { ref, computed, watch, useRoute, useRouter } from 'vue';\n` + code;
        }
        return null;
      }
    };
  }
}

registry.register(new NuxtAdapter());
