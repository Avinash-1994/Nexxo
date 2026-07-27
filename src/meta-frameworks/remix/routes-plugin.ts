import type { Plugin } from '@lunx/adapter-core';
import path from 'path';

let remixVitePluginBuilder: any;

export function remixRoutesPlugin(): Plugin {
  return {
    name: 'lunx:remix-routes',

    async buildStart() {
      try {
         // @ts-ignore
         const viteOpts = await import('@remix-run/dev/vite');
         remixVitePluginBuilder = viteOpts.vitePlugin;
      } catch (e) {
         // Missing dependency
      }
    },

    async resolveId(source: string) {
       // Support virtual Remix build imports
       if (source === 'virtual:lunx/remix-server-build') {
          return source;
       }
       return null;
    },

    async load(id: string) {
       if (id === 'virtual:lunx/remix-server-build') {
          // Expose standard Route tree mappings natively mirroring Remix's output
          // In a real pipeline, we bridge this directly into the Vite manifest structure provided
          // by \`@remix-run/dev/vitePlugin\`
          return `
             export const routes = {};
             export const entry = { module: {} };
             export const future = {};
             export const isSpaMode = false;
             export const publicPath = '/build/';
             export const assetsBuildDirectory = 'public/build';
          `;
       }
       return null;
    }
  };
}
