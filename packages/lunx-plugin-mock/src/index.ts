/**
 * @lunx/plugin-mock — Mock API responses in dev, zero backend needed
 * Replaces: vite-plugin-mock, webpack-dev-server proxy + mock
 * Permissions: net:fetch, fs:read
 *
 * Convention: mock/api/users.ts exports GET, POST, etc.
 * Each handler receives a Request, returns a Response.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface MockPluginOptions {
  /** Directory containing mock definitions (default: 'mock') */
  dir?: string;
  /** Simulated network delay in ms (default: 0) */
  delay?: number;
  /** Enable mock plugin (default: !isProduction) */
  enable?: boolean;
  /** Proxy target for passthrough requests (when handler returns null) */
  proxy?: string;
}

interface MockHandler {
  [method: string]: (req: Request) => Response | null | Promise<Response | null>;
}

/** Load all mock files from the mock directory */
function loadMockHandlers(mockDir: string): Map<string, MockHandler> {
  const handlers = new Map<string, MockHandler>();

  if (!fs.existsSync(mockDir)) return handlers;

  function walk(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, `${prefix}/${entry.name}`);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        const routePath = `${prefix}/${entry.name.replace(/\.(ts|js)$/, '')}`;
        // In dev mode, mock handlers are imported dynamically
        handlers.set(routePath, { _SOURCE: full } as any);
      }
    }
  }

  const apiDir = path.join(mockDir, 'api');
  if (fs.existsSync(apiDir)) walk(apiDir, '/api');

  return handlers;
}

export function mock(options: MockPluginOptions = {}) {
  const {
    dir = 'mock',
    delay = 0,
    enable = process.env['NODE_ENV'] !== 'production',
    proxy,
  } = options;

  if (!enable) {
    return { name: '@lunx/plugin-mock', configureServer() {} };
  }

  let mockDir = '';
  let handlers = new Map<string, MockHandler>();

  return {
    name: '@lunx/plugin-mock',
    enforce: 'pre' as const,

    configResolved(config: any) {
      mockDir = path.resolve(config.root ?? process.cwd(), dir);
      handlers = loadMockHandlers(mockDir);
      console.info(`[lunx:mock] Loaded ${handlers.size} mock route(s) from ${mockDir}/`);
    },

    configureServer(server: any) {
      // HMR: reload mock handlers when mock files change
      if (server.watcher) {
        server.watcher.add(mockDir);
        server.watcher.on('change', (file: string) => {
          if (file.startsWith(mockDir)) {
            handlers = loadMockHandlers(mockDir);
            console.info('[lunx:mock] Mock handlers reloaded.');
          }
        });
      }

      // Register middleware
      server.middlewares?.use(async (req: any, res: any, next: () => void) => {
        const url = req.url ?? '/';
        const method = (req.method ?? 'GET').toUpperCase();

        // Check if we have a mock for this route
        const routePath = url.split('?')[0];
        const handlerMeta = handlers.get(routePath);

        if (!handlerMeta) {
          next();
          return;
        }

        // Simulate delay
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));

        // Build a fetch-API-compatible Request object
        const fullUrl = `http://localhost${url}`;
        let body: Buffer[] = [];
        req.on('data', (c: Buffer) => body.push(c));
        req.on('end', async () => {
          const bodyBuffer = Buffer.concat(body);
          const request = new Request(fullUrl, {
            method,
            headers: req.headers as any,
            body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
          });

          try {
            // Dynamically load the handler (supports HMR)
            const sourcePath = (handlerMeta as any)['_SOURCE'];
            let handlerModule: any;
            try {
              handlerModule = await import(sourcePath + `?t=${Date.now()}`);
            } catch {
              next();
              return;
            }

            const handler = handlerModule[method] ?? handlerModule['default'];
            if (!handler) { next(); return; }

            const response: Response | null = await handler(request);
            if (!response) { next(); return; }

            res.statusCode = response.status;
            response.headers.forEach((val: string, key: string) => {
              res.setHeader(key, val);
            });
            if (!response.headers.has('Content-Type')) {
              res.setHeader('Content-Type', 'application/json');
            }
            const responseBody = await response.text();
            res.end(responseBody);
          } catch (err) {
            console.error('[lunx:mock] Handler error:', err);
            next();
          }
        });
      });
    },
  };
}

export default mock;
