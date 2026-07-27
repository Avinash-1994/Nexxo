import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { tsRouterPlugin } from './router-plugin.js';

export interface TanStackConfig {
  ssr?: boolean;           // default: true
  serverOnly?: boolean;    // default: false
}

export class TanStackAdapter implements LunxAdapter {
  name = 'tanstack-start';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['@tanstack/start', '@tanstack/react-start']);
  }

  plugins(): Plugin[] {
    return [
      tsRouterPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.tanstack) config.tanstack = {};
    config.tanstack = {
      ssr: true,
      ...(config.tanstack || {})
    };
    return config;
  }

  // BUG-004: use getDevHandler not serverMiddleware
  // BUG-002: null guard on req/res
  getDevHandler(): any {
    return async (req: any, res: any, next: any) => {
      if (!req || !res) return next?.();

      try {
         const virtualEntry = 'virtual:lunx/tanstack-routes';
         let manifest: any;
         try {
            manifest = await import(virtualEntry);
         } catch(e) {
            // If virtual module isn't loaded/ready, pass it down or load from entry-server.cjs
            const path = await import('path');
            const { pathToFileURL } = await import('url');
            const fs = await import('fs');
            const entryPath = path.join(process.cwd(), 'src', 'entry-server.cjs');
            if (fs.existsSync(entryPath)) {
                manifest = await import(pathToFileURL(entryPath).href);
                manifest = manifest.default || manifest;
            } else {
                return next();
            }
         }

         const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
         
         // API mapping
         if (url.pathname.startsWith('/api/') || url.pathname.includes('_serverFn')) {
             if (manifest.handleApi) {
                const result = await manifest.handleApi(url.href, { req });
                if (result) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(typeof result === 'string' ? result : JSON.stringify(result));
                    return;
                }
             }
         } else {
             if (manifest.renderRoute) {
                 const result = await manifest.renderRoute(url.href, { root: process.cwd() });
                 if (result && result.html) {
                     res.setHeader('Content-Type', 'text/html');
                     res.end(result.html);
                     return;
                 }
             }
         }

         next();
      } catch(e) {
         console.error('[Lunx:TanStack] Dev Middleware SSR Error', e);
         next();
      }
    };
  }

  ssrEntry(): string {
     return 'src/entry-server.cjs';
  }
}

registry.register(new TanStackAdapter());
