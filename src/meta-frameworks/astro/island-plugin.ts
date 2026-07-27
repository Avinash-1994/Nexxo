import type { Plugin } from '@lunx/adapter-core';

export function astroIslandPlugin(): Plugin {
  return {
    name: 'lunx:astro-islands',

    transform(code: string, id: string) {
      // Analyze React/Vue/Svelte/Solid components for client:* Astro directives
      // Since Astro compiler translates .astro files, this plugin intercepts the
      // resulting JS output or framework files looking for markers

      if (!code.includes('client:') || !code.includes('astro-island')) {
         return null;
      }

      // Mark this specific module explicitly as a distinct chunk entrypoint
      // so Native Chunker separates it for deferring
      // This allows lazy hydration inside the browser without blocking the main bundle
      
      // We embed an AST marker for the chunker here. In a real SWC pipeline, 
      // we append an attribute or emit a chunk ID
      const chunkMarker = `\n/* @@lunx_island_entry@@ */\n`;

      return {
        code: code + chunkMarker,
        map: null
      };
    }
  };
}
