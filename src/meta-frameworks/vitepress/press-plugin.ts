import type { Plugin } from '@lunx/adapter-core';
import { createHash } from 'crypto';

let mdCompiler: any;

export function vitepressMarkdownPlugin(): Plugin {
  return {
    name: 'lunx:vitepress-markdown',

    async buildStart() {
      try {
         // Load vitepress markdown-it abstractions natively
         // @ts-ignore
         const vpCompiler = await import('vitepress/dist/node/markdown/markdown.js');
         mdCompiler = await vpCompiler.createMarkdownRenderer('src', { /* standard configs */ }, '/');
      } catch (e) {
         // Silently bypass
      }
    },

    async transform(code: string, id: string) {
       if (!id.endsWith('.md')) return null;
       if (!mdCompiler) return null;

       const { getLazyCacheDatabase } = await import('../../core/cache/lazy-init.js');
       const db = await getLazyCacheDatabase();

       const hash = createHash('sha256').update(`${id}:${code}`).digest('hex');
       const cacheKey = `vitepress_md_${hash}`;

       const cached = db.get(cacheKey);
       if (cached) return { code: cached, map: null };

       let transformedCode = code;
       try {
          // Vitepress transforms raw markdown directly into a Vue SFC Component string
          const env: any = { id };
          const html = mdCompiler.render(code, env);
          
          // Construct SFC payload
          transformedCode = `
            <template><div>${html}</div></template>
            <script setup>
              const frontmatter = ${JSON.stringify(env.frontmatter || {})};
            </script>
          `;
       } catch (e) {
          console.error('[Lunx:VitePress] Markdown transformation failed', e);
       }

       db.set(cacheKey, transformedCode);

       // The Vue Plugin inside Nuclear will catch this downstream and compile the SFC
       return {
          code: transformedCode,
          map: null
       };
    }
  };
}
