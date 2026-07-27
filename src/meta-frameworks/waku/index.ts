import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { wakuRscPlugin } from './rsc-plugin.js';

export interface WakuConfig {
  rscPath?: string; // default '/RSC'
}

export class WakuAdapter implements LunxAdapter {
  name = 'waku';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['waku']);
  }

  plugins(): Plugin[] {
    return [
      wakuRscPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.waku) config.waku = {};
    config.waku = {
      rscPath: '/RSC',
      ...(config.waku || {})
    };
    return config;
  }

  // BUG-004: use getDevHandler not serverMiddleware
  // BUG-002: null guard on req/res
  getDevHandler(): any {
    return async (req: any, res: any, next: any) => {
      if (!req || !res) return next?.();

      try {
         const virtualEntry = 'virtual:lunx/waku-rsc-router';
         let router: any;
         try {
            router = await import(virtualEntry);
         } catch(e) {
            // If virtual module isn't loaded/ready, load from entry-server.cjs
            const path = await import('path');
            const { pathToFileURL } = await import('url');
            const fs = await import('fs');
            const entryPath = path.join(process.cwd(), 'src', 'entry-server.cjs');
            if (fs.existsSync(entryPath)) {
                const entryModule = await import(pathToFileURL(entryPath).href);
                router = entryModule.default || entryModule;
            } else {
                return next();
            }
         }

         const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

         if (url.pathname.startsWith('/RSC/')) {
            // Return explicitly the serialized RSC Payload format directly to the client
            const flightData = await router.renderRSC(url.href);
            if (flightData) {
               res.setHeader('Content-Type', 'text/x-component');
               
               // Assuming flightData is a ReadableStream or byte array Buffer
               if (flightData.getReader) {
                  const reader = flightData.getReader();
                  while (true) {
                     const { done, value } = await reader.read();
                     if (done) break;
                     res.write(value);
                  }
                  res.end();
                  return;
               } else {
                  res.end(flightData);
                  return;
               }
            }
         } else {
            // Otherwise SSR the React Shell
            const html = await router.renderSSR(url.href);
            if (html) {
               res.setHeader('Content-Type', 'text/html');
               res.end(html);
               return;
            }
         }

         next();
      } catch(e) {
         console.error('[Lunx:Waku] Error rendering RSC', e);
         next();
      }
    };
  }

  ssrEntry(): string {
     return 'src/entry-server.cjs';
  }
}

registry.register(new WakuAdapter());
