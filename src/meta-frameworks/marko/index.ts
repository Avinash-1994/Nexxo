import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { createHash } from 'crypto';

let markoCompiler: any;

export class MarkoAdapter implements LunxAdapter {
  name = 'marko';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['marko', '@marko/run']);
  }

  plugins(): Plugin[] {
    return [
      {
        name: 'lunx:marko-compiler',

        async buildStart() {
          try {
            // @ts-ignore
            markoCompiler = await import('@marko/compiler');
          } catch (e) {
            // Optional dependency
          }
        },

        async transform(code: string, id: string) {
          if (!id.endsWith('.marko')) return null;
          if (!markoCompiler) return null;

          const { getLazyCacheDatabase } = await import('../../core/cache/lazy-init.js');
          const db = await getLazyCacheDatabase();

          const hash = createHash('sha256').update(`${id}:${code}`).digest('hex');
          const cacheKey = `marko_${hash}`;

          const cached = db.get(cacheKey);
          if (cached) return { code: cached, map: null };

          let transformedCode = code;
          try {
            const result = await markoCompiler.compile(code, id, {
              output: 'dom',
              sourceMaps: false,
            });
            transformedCode = result.code;
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
    if (!config.marko) config.marko = {};
    config.marko = {
      output: 'dom',
      ...(config.marko || {})
    };
    return config;
  }

  serverMiddleware(): Middleware[] {
    return [
      async (req: any, res: any, next: any) => {
        next();
      }
    ];
  }
}

registry.register(new MarkoAdapter());
