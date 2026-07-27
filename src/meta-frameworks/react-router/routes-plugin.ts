import type { Plugin } from '@lunx/adapter-core';

let rr7VitePluginBuilder: any;

export function rr7RoutesPlugin(): Plugin {
  return {
    name: 'lunx:rr7-routes',

    async buildStart() {
      try {
         // @ts-ignore
         const viteOpts = await import('@react-router/dev/vite');
         rr7VitePluginBuilder = viteOpts.reactRouter;
      } catch (e) {
         // Missing dependency
      }
    },

    async resolveId(source: string) {
       // Support virtual build imports
       if (source === 'virtual:lunx/rr7-server-build') {
          return source;
       }
       return null;
    },

    async load(id: string) {
       if (id === 'virtual:lunx/rr7-server-build') {
          // Output stub for React Router SSR Manifests
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
