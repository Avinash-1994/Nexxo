import type { Plugin } from '@lunx/adapter-core';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:lunx/solidstart-routes';

export function solidStartRouterPlugin(): Plugin {
  return {
    name: 'lunx:solidstart-router',

    // Intercept SolidStart component routes
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

      // Scanner for SolidStart file conventions (page.tsx, [param].tsx, api/)
      const routes: string[] = [];
      
      function scan(dir: string, routePath: string) {
         for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const isDir = fs.statSync(fullPath).isDirectory();
            
            // Layout groups e.g., (group)
            if (isDir && file.startsWith('(') && file.endsWith(')')) {
               scan(fullPath, routePath);
               continue;
            }

            if (isDir) {
               // Normal directory routing
               scan(fullPath, path.join(routePath, file));
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
               const basename = path.basename(file, path.extname(file));
               
               let uri = routePath;
               if (basename !== 'page' && basename !== 'index') {
                  // Map [param] to /:param
                  const segment = basename.replace(/\\[(.*?)\\]/g, ':$1');
                  uri = uri ? path.join(uri, segment) : segment;
               }

               const absUri = uri === '' ? '/' : `/${uri}`;
               const isApi = fullPath.includes(path.sep + 'api' + path.sep) || absUri.startsWith('/api/');

               routes.push(`{ 
                  file: '${file}', 
                  uri: '${absUri}', 
                  isApiRoute: ${isApi},
                  loader: () => import(${JSON.stringify(fullPath)}) 
               }`);
            }
         }
      }
      scan(routesDir, '');

      return `
        // Auto-generated SolidStart route manifest mapped dynamically
        export const routes = [
          ${routes.join(',\n')}
        ];
      `;
    }
  };
}
