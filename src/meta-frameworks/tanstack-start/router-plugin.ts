import type { Plugin } from '@lunx/adapter-core';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:lunx/tanstack-routes';

export function tsRouterPlugin(): Plugin {
  return {
    name: 'lunx:tanstack-router',

    // Intercept Route configs mapped directly for Tanstack
    resolveId(source: string) {
      if (source === VIRTUAL_MODULE_ID) {
        return source;
      }
      return null;
    },

    load(id: string) {
      if (id !== VIRTUAL_MODULE_ID) return null;

      const appDir = path.join(process.cwd(), 'app/routes');
      if (!fs.existsSync(appDir)) {
         return `export const routes = [];`;
      }

      const routes: string[] = [];
      
      function scan(dir: string, routePath: string) {
         for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const isDir = fs.statSync(fullPath).isDirectory();
            
            if (isDir) {
               scan(fullPath, path.join(routePath, file));
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
               const basename = path.basename(file, path.extname(file));
               
               let uri = routePath;
               if (basename !== 'index') {
                   // Translate $id into dynamic parameter
                   const segment = basename.replace(/\\$([a-zA-Z0-9_]+)/g, ':$1');
                   uri = uri ? path.join(uri, segment) : segment;
               }

               const absUri = uri === '' ? '/' : `/${uri}`;

               routes.push(`{ 
                  file: '${file}', 
                  uri: '${absUri}', 
                  loader: () => import(${JSON.stringify(fullPath)}) 
               }`);
            }
         }
      }
      scan(appDir, '');

      return `
        // Auto-generated Tanstack Route proxy for Lunx native SSR engine
        export const routes = [
          ${routes.join(',\n')}
        ];
      `;
    }
  };
}
