import type { Plugin } from '@lunx/adapter-core';
import { createHash } from 'crypto';

let astroCompiler: any;

export function astroCompilerPlugin(): Plugin {
  return {
    name: 'lunx:astro-compiler',

    async buildStart() {
      try {
        // @ts-ignore
        astroCompiler = await import('@astrojs/compiler');
      } catch (e) {
        // Handled silently
      }
    },

    async transform(code: string, id: string) {
      if (!id.endsWith('.astro')) return null;
      if (!astroCompiler) return null;

      const { getLazyCacheDatabase } = await import('../../core/cache/lazy-init.js');
      const db = await getLazyCacheDatabase();

      const version = 'detect';
      const keyStr = `${id}:${code}:${version}`;
      const hash = createHash('sha256').update(keyStr).digest('hex');
      const cacheKey = `astro_cmp_${hash}`;

      const cached = db.get(cacheKey);
      if (cached) return { code: cached, map: null };

      let transformedCode = code;
      try {
         // Process WASM compiler hook
         const result = await astroCompiler.transform(code, {
            internalURL: 'astro/internal',
            sourcemap: false,
         });
         
         transformedCode = result.code;
      } catch (e) {
         // Graceful fallback
      }

      db.set(cacheKey, transformedCode);

      // Return processed WASM JS to SWC down-leveler framework
      return {
        code: transformedCode,
        map: null
      };
    }
  };
}
