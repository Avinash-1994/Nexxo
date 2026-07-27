import type { Middleware } from '@lunx/adapter-core';

export function createSveltekitMiddleware(): Middleware {
  return async (req: any, res: any, next: any) => {
    // Determine target URL for routing
    const url = req.url || '/';

    try {
      // Lazy load the virtual route manifest that SvelteKit configures
      const virtualModuleId = 'virtual:lunx/sveltekit-routes';
      let manifest: any;
      try {
         // In production the bundle compiles it out statically. In Dev this intercepts native JS loader.
         manifest = await import(virtualModuleId);
      } catch (e) {
         // Fallback if virtual module resolution isn't active
         return next();
      }

      // Map SvelteKit standard fetch Request / Response pattern over Lunx's underlying uWS
      const simulatedRequest = new Request(`http://${req.headers.host || 'localhost'}${url}`, {
         method: req.method || 'GET',
         headers: req.headers
      });

      // Basic routing interception against generated routes
      const match = manifest.routes.find((r: any) => r.uri === url || r.uri.startsWith(url));
      
      if (match && match.file.includes('server.ts')) {
         const routeExports = await match.loader();
         
         // If a +server.ts API handler matches the method exactly (GET, POST etc.)
         const handler = routeExports[req.method] || routeExports.fallback;
         if (handler) {
            const simulatedResponse: Response = await handler({ request: simulatedRequest });
            
            // Re-map back natively to uWS buffer array response
            res.writeStatus(`${simulatedResponse.status}`);
            simulatedResponse.headers.forEach((value, key) => {
               res.writeHeader(key, value);
            });
            const text = await simulatedResponse.text();
            res.end(text);
            return; // Handled
         }
      }

      // Defer all other physical file requests like .svelte assets and images downward to core router
      next();
    } catch (e) {
      console.error('[Lunx:SvelteKit] SSR Middleware Error', e);
      next();
    }
  };
}
