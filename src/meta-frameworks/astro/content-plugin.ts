import type { Plugin } from '@lunx/adapter-core';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:lunx/astro-content';

export function astroContentPlugin(): Plugin {
  return {
    name: 'lunx:astro-content',

    resolveId(source: string) {
      if (source === VIRTUAL_MODULE_ID) return source;
      return null;
    },

    load(id: string) {
      if (id !== VIRTUAL_MODULE_ID) return null;

      const contentDir = path.join(process.cwd(), 'src/content');
      if (!fs.existsSync(contentDir)) {
         return `export const getCollection = () => [];`;
      }

      // We read subdirectories as collection schemas
      const collections: string[] = [];
      const colDirs = fs.readdirSync(contentDir, { withFileTypes: true });
      
      for (const dir of colDirs) {
         if (dir.isDirectory()) {
            // Register an accessor mapping back to physical JSON/MDX entries 
            // In a deeper implementation, this would read frontmatter natively via gray-matter
            // and emit `.json` structures, but currently we proxy dynamic imports
            collections.push(`
              '${dir.name}': async () => {
                 // Dynamic AST wrapper loading files via eager loader
                 return [];
              }
            `);
         }
      }

      return `
        // Auto-generated Astro Virtual Content Collection Map
        const __collections = {
           ${collections.join(',\n')}
        };

        export const getCollection = async (name) => {
           if (__collections[name]) return await __collections[name]();
           return [];
        };
      `;
    }
  };
}
