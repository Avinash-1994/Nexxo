import type { Plugin } from '@lunx/adapter-core';
import { createHash } from 'crypto';

let qwikOptimizer: any;

export function qwikOptimizerPlugin(): Plugin {
  return {
    name: 'lunx:qwik-optimizer',
    
    async buildStart() {
      try {
        // @ts-ignore - Optional dependency
        qwikOptimizer = await import('@builder.io/qwik/optimizer');
      } catch (e) {
        // Gracefully ignore, let user know if missing upon usage
      }
    },

    async transform(code: string, id: string) {
      if (!id.endsWith('.tsx') && !id.endsWith('.ts')) return null;
      if (!qwikOptimizer) return null;

      // Access Lunx's SQLite/RocksDB cache wrapper
      const { getLazyCacheDatabase } = await import('../../core/cache/lazy-init.js');
      const db = await getLazyCacheDatabase();

      // Ensure cache uniqueness via version and code payload
      const version = qwikOptimizer.versions?.qwik || 'unknown';
      const keyStr = `${id}:${code}:${version}`;
      const hash = createHash('sha256').update(keyStr).digest('hex');
      const cacheKey = `qwik_opt_${hash}`;

      const cached = db.get(cacheKey);
      if (cached) {
        return { code: cached, map: null };
      }

      let transformedCode = code;
      try {
         // Qwik's compiler physically breaks apart the JS into segmented q-XXXX.js modules
         const result = await qwikOptimizer.transformModules({
            input: [
               { code, path: id }
            ],
            // Ensure Optimizer operates asynchronously targeting Node/ES mapping
            target: 'client',
            sourcemap: false
         });
         
         const mainOut = result.modules.find((m: any) => !m.isEntry);
         if (mainOut) transformedCode = mainOut.code;

         // For other segmented files, we would dynamically register them to the `chunker` 
         // manifest using Rollup's emitFile pattern or Lunx equivalent natively
         // Example: 
         // result.modules.forEach(m => { if(m.isEntry) emitChunk(m) })

      } catch (e) {
         // Fallback to naive translation
      }

      db.set(cacheKey, transformedCode);

      return {
        code: transformedCode,
        map: null
      };
    }
  };
}
