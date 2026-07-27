import type { LunxAdapter, Plugin, LunxConfig, PackageJson } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { rr7RoutesPlugin } from './routes-plugin.js';

export interface ReactRouterConfig {
  appDirectory?: string; // default "app"
  ssr?: boolean;         // default true
}

export class ReactRouterAdapter implements LunxAdapter {
  name = 'react-router';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['@react-router/dev']) ||
      (detectDependencies(pkg, ['react-router']) && this._hasConfig(projectRoot));
  }

  private _hasConfig(root: string): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      return fs.existsSync(path.join(root, 'react-router.config.ts')) ||
             fs.existsSync(path.join(root, 'react-router.config.js'));
    } catch { return false; }
  }

  plugins(): Plugin[] {
    return [
      rr7RoutesPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.reactRouter) config.reactRouter = {};
    config.reactRouter = {
      appDirectory: 'app',
      ssr: true,
      ...(config.reactRouter || {})
    };
    return config;
  }

  // BUG-004: use getDevHandler not serverMiddleware
  // BUG-002: null guard on req/res
  // Reuses same Fetch Request/Response ↔ uWS shim pattern as Remix (Phase 2.7)
  getDevHandler(): any {
    return async (req: any, res: any, next: any) => {
      if (!req || !res) return next?.();

      try {
        const path = await import('path');
        const { pathToFileURL } = await import('url');
        const fs = await import('fs');

        const entryPath = path.join(process.cwd(), 'src', 'entry-server.cjs');
        if (!fs.existsSync(entryPath)) return next();

        const entry = await import(pathToFileURL(entryPath).href);
        const adapter = entry.default || entry;

        const url = req.url || '/';

        if (url.startsWith('/api/')) {
          const result = await adapter.handleApi(url, { req });
          if (result) {
            res.setHeader('Content-Type', 'application/json');
            res.end(typeof result === 'string' ? result : JSON.stringify(result));
            return;
          }
        } else {
          const result = adapter.renderRoute(url, { root: process.cwd() });
          if (result && result.html) {
            res.setHeader('Content-Type', 'text/html');
            res.end(result.html);
            return;
          }
          if (result && result.spa) {
            res.setHeader('Content-Type', 'text/html');
            res.end(result.indexHtml);
            return;
          }
        }
      } catch (e) {
        console.error('[LUNX ReactRouter] Dev handler error:', e);
      }
      next();
    };
  }

  ssrEntry(): string {
    return 'src/entry-server.cjs';
  }
}

registry.register(new ReactRouterAdapter());
