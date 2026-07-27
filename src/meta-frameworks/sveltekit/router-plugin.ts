import type { Plugin } from '@lunx/adapter-core';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:lunx/sveltekit-routes';

export function sveltekitRouterPlugin(): Plugin {
  return {
    name: 'lunx:sveltekit-router',

    // Intercept Svelte route requests to build the dynamic manifest
    resolveId(source: string) {
      if (source === VIRTUAL_MODULE_ID) {
        return source;
      }
      return null;
    },

    load(id: string) {
      if (id !== VIRTUAL_MODULE_ID) return null;

      const routesDir = path.join(process.cwd(), 'src/routes');
      if (!fs.existsSync(routesDir)) {
         return `export const routes = [];`;
      }

      // Very rudimentary static scanner mapping the backend routing definitions
      const routes: string[] = [];
      
      function scan(dir: string, routePath: string) {
         for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(routePath, file);
            
            if (fs.statSync(fullPath).isDirectory()) {
               scan(fullPath, relativePath);
            } else if (file.startsWith('+')) {
               // +page.svelte, +server.ts, +layout.svelte
               routes.push(`{ 
                  file: '${file}', 
                  uri: '${routePath === '' ? '/' : `/${routePath}`}', 
                  loader: () => import(${JSON.stringify(fullPath)}) 
               }`);
            }
         }
      }
      scan(routesDir, '');

      return `
        // Auto-generated SvelteKit route manifest
        export const routes = [
          ${routes.join(',\n')}
        ];
      `;
    }
  };
}
