import type { Plugin } from '@lunx/adapter-core';
import path from 'path';

let analogVitePlugin: any;

export function analogCompilerPlugin(): Plugin {
  return {
    name: 'lunx:analog-compiler',

    async buildStart() {
      try {
         // @ts-ignore
         const mod = await import('@analogjs/vite-plugin-angular');
         analogVitePlugin = mod.default || mod;
      } catch (e) {
         // Silent fail, handled gracefully dynamically
      }
    },

    async resolveId(source: string) {
       // Support virtual entry for SSR mappings
       if (source === 'virtual:lunx/analog-ssr-entry') {
          return source;
       }
       return null;
    },

    async load(id: string) {
       if (id === 'virtual:lunx/analog-ssr-entry') {
          // This bridges the SSR compilation entry to Analog's \`render()\` runtime
          return `
             import { renderModule } from '@angular/platform-server';
             import bootstrap from '${path.join(process.cwd(), 'src/main.server.ts').replace(/\\/g, '/')}';
             
             export async function render(url, { req, res }) {
                // Analog/Angular SSR invocation over uWS
                const html = await renderModule(bootstrap, {
                   document: '<app-root></app-root>',
                   url: url
                });
                return html;
             }
          `;
       }
       return null;
    }
  };
}
