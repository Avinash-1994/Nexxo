import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { analogCompilerPlugin } from './analog-plugin.js';
// @ts-ignore
import * as ts from 'typescript';
// @ts-ignore
import * as ng from '@angular/compiler-cli';

export async function compileAnalog(
  rootNames: string[],
  options: ng.CompilerOptions
): Promise<ts.Diagnostic[]> {
  const host = ng.createCompilerHost({ options });
  const program = ng.createProgram({
    rootNames,
    options,
    host
  });

  const allDiagnostics = [
    ...program.getTsOptionDiagnostics(),
    ...program.getNgOptionDiagnostics(),
    ...program.getTsSyntacticDiagnostics(),
    ...program.getNgStructuralDiagnostics(),
    ...program.getTsSemanticDiagnostics(),
    ...program.getNgSemanticDiagnostics(),
  ];

  if (allDiagnostics.length === 0) {
    program.emit();
  }

  return allDiagnostics as ts.Diagnostic[];
}
export interface AnalogConfig {
  ssr?: boolean;           // default: true
  prerender?: string[];    // default: ['/']
}

export class AnalogAdapter implements LunxAdapter {
  name = 'analog';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['@analogjs/router', '@analogjs/vite-plugin-angular']);
  }

  plugins(): Plugin[] {
    return [
      analogCompilerPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.analog) config.analog = {};
    config.analog = {
      ssr: true,
      prerender: ['/'],
      ...(config.analog || {})
    };
    return config;
  }

  getDevHandler(): any {
    return async (req: any, res: any, next: any) => {
      // BUG-002: Check for null req/res
      if (!req || !res) return next?.();

      try {
        const path = await import('path');
        const { pathToFileURL } = await import('url');
        const fs = await import('fs');
        
        const entryPath = path.join(process.cwd(), 'src/entry-server.cjs');
        if (fs.existsSync(entryPath)) {
          const entry = await import(pathToFileURL(entryPath).href);
          const adapter = entry.default || entry;
          
          if (req.url?.startsWith('/api/')) {
             const apiResult = await adapter.executeApi(req.url, { req });
             if (apiResult && apiResult.status) {
                res.setHeader('Content-Type', 'application/json');
                res.end(apiResult.body || '{}');
                return;
             }
          } else {
             const result = adapter.renderApplication(req.url, { root: process.cwd() });
             if (result && result.html) {
                res.setHeader('Content-Type', 'text/html');
                res.end(result.html);
                return;
             }
          }
        }
      } catch (e) {
        console.error('[LUNX Analog] Dev handler error:', e);
      }
      next();
    };
  }

  ssrEntry(): string {
     return 'src/main.server.ts';
  }
}

registry.register(new AnalogAdapter());
