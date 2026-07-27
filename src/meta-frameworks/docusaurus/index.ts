import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { createHash } from 'crypto';

let mdxCompiler: any;

export class DocusaurusAdapter implements LunxAdapter {
  name = 'docusaurus';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['@docusaurus/core']);
  }

  plugins(): Plugin[] {
    return [
      {
        name: 'lunx:docusaurus-mdx',

        async buildStart() {
          try {
            // @ts-ignore
            mdxCompiler = await import('@mdx-js/mdx');
          } catch (e) {
            // Optional dependency
          }
        },

        async transform(code: string, id: string) {
          if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null;
          if (!mdxCompiler) return null;

          const { getLazyCacheDatabase } = await import('../../core/cache/lazy-init.js');
          const db = await getLazyCacheDatabase();

          const hash = createHash('sha256').update(`${id}:${code}`).digest('hex');
          const cacheKey = `docusaurus_mdx_${hash}`;

          const cached = db.get(cacheKey);
          if (cached) return { code: cached, map: null };

          let transformedCode = code;
          try {
            const compiled = await mdxCompiler.compile(code, {
              remarkPlugins: [],
              rehypePlugins: [],
              providerImportSource: '@mdx-js/react',
            });
            transformedCode = String(compiled);
          } catch (e) {
            // Graceful passthrough
          }

          db.set(cacheKey, transformedCode);
          return { code: transformedCode, map: null };
        }
      }
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.docusaurus) config.docusaurus = {};
    config.docusaurus = {
      // Docusaurus outputs to build/ by default
      outDir: 'build',
      ...(config.docusaurus || {})
    };
    return config;
  }

  serverMiddleware(): Middleware[] {
    return [
      async (req: any, res: any, next: any) => {
        // Docusaurus runs its own dev server; Lunx scaffolds detection + MDX transform support
        next();
      }
    ];
  }
}

registry.register(new DocusaurusAdapter());
