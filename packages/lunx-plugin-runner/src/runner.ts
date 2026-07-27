/**
 * Phase 1.14 — Rollup/Vite Plugin Compatibility Runner
 *
 * This runner executes standard Rollup and Vite plugins within the Lunx build pipeline.
 * It simulates the Rollup Plugin Context (e.g. `this.emitFile`, `this.getModuleInfo`).
 */

export interface RollupPlugin {
  name: string;
  enforce?: 'pre' | 'post';
  // Standard Rollup Hooks
  options?: (this: PluginContext, options: any) => any | Promise<any>;
  buildStart?: (this: PluginContext, options: any) => void | Promise<void>;
  resolveId?: (this: PluginContext, source: string, importer?: string, options?: any) => Promise<string | { id: string; external?: boolean } | null | void> | string | { id: string; external?: boolean } | null | void;
  load?: (this: PluginContext, id: string) => Promise<string | { code: string; map?: any } | null | void> | string | { code: string; map?: any } | null | void;
  transform?: (this: PluginContext, code: string, id: string) => Promise<string | { code: string; map?: any } | null | void> | string | { code: string; map?: any } | null | void;
  moduleParsed?: (this: PluginContext, info: any) => void | Promise<void>;
  buildEnd?: (this: PluginContext, error?: Error) => void | Promise<void>;
  generateBundle?: (this: PluginContext, options: any, bundle: any, isWrite: boolean) => void | Promise<void>;
  writeBundle?: (this: PluginContext, options: any, bundle: any) => void | Promise<void>;
  closeBundle?: (this: PluginContext) => void | Promise<void>;
  renderChunk?: (this: PluginContext, code: string, chunk: any, options: any) => Promise<{ code: string; map?: any } | null> | { code: string; map?: any } | null;
  banner?: (this: PluginContext) => string | Promise<string>;
  footer?: (this: PluginContext) => string | Promise<string>;
  intro?: (this: PluginContext) => string | Promise<string>;
  outro?: (this: PluginContext) => string | Promise<string>;
  
  // Vite Specific Hooks
  configResolved?: (config: any) => void | Promise<void>;
  configureServer?: (server: any) => (() => void) | void | Promise<(() => void) | void>;
  configurePreviewServer?: (server: any) => (() => void) | void | Promise<(() => void) | void>;
  handleHotUpdate?: (ctx: any) => Array<any> | void | Promise<Array<any> | void>;
  transformIndexHtml?: (html: string, ctx: any) => string | any[] | Promise<string | any[]>;
  resolveFileUrl?: (options: any) => string | null | undefined;
  renderBuiltUrl?: (filename: string, type: string) => string | { relative?: boolean, runtime?: string } | null | undefined;
}

export interface EmittedFile {
  type: 'chunk' | 'asset';
  fileName?: string;
  name?: string;
  source?: string | Uint8Array;
}

export interface PluginContext {
  meta: {
    rollupVersion: string;
    watchMode: boolean;
  };
  emitFile: (emittedFile: EmittedFile) => string;
  getFileName: (referenceId: string) => string;
  getModuleInfo: (moduleId: string) => any;
  warn: (warning: string | Error | any) => void;
  error: (error: string | Error | any) => never;
  resolve: (source: string, importer?: string, options?: { skipSelf?: boolean }) => Promise<{ id: string; external: boolean } | null>;
  addWatchFile: (id: string) => void;
}

export class PluginRunner {
  private plugins: RollupPlugin[];
  private emittedFiles = new Map<string, EmittedFile>();
  private watchFiles = new Set<string>();
  private refCounter = 0;

  constructor(plugins: (RollupPlugin | null | undefined | false)[]) {
    // Flatten and filter falsy plugins
    this.plugins = plugins.filter((p): p is RollupPlugin => !!p);
    
    // Sort by enforce: 'pre' first, then normal, then 'post'
    this.plugins.sort((a, b) => {
      const weight = (p: RollupPlugin) => p.enforce === 'pre' ? -1 : p.enforce === 'post' ? 1 : 0;
      return weight(a) - weight(b);
    });
  }

  private createContext(pluginName: string): PluginContext {
    return {
      meta: {
        rollupVersion: '3.0.0', // mock rollup version
        watchMode: false,
      },
      emitFile: (emittedFile: EmittedFile): string => {
        const refId = `ref_${this.refCounter++}_${emittedFile.name || 'asset'}`;
        this.emittedFiles.set(refId, emittedFile);
        return refId;
      },
      getFileName: (referenceId: string): string => {
        const file = this.emittedFiles.get(referenceId);
        if (!file) throw new Error(`[${pluginName}] getFileName: unknown referenceId ${referenceId}`);
        return file.fileName || `${referenceId}.ext`; // Simplified mock
      },
      getModuleInfo: (moduleId: string): any => {
        // Simplified mock: return an empty info object
        return {
          id: moduleId,
          isEntry: false,
          isExternal: false,
          importedIds: [],
          importers: [],
        };
      },
      warn: (warning: any) => {
        console.warn(`[${pluginName} WARN]:`, warning.message || warning);
      },
      error: (err: any): never => {
        throw new Error(`[${pluginName} ERROR]: ${err.message || err}`);
      },
      resolve: async (source: string, importer?: string, options?: { skipSelf?: boolean }) => {
        // Simple internal resolve calling out to our own resolve pipeline
        return await this.resolveId(source, importer, { skipSelfPlugin: options?.skipSelf ? pluginName : undefined });
      },
      addWatchFile: (id: string) => {
        this.watchFiles.add(id);
      }
    };
  }

  public async runOptions(initialOptions: any): Promise<any> {
    let currentOptions = { ...initialOptions };
    for (const plugin of this.plugins) {
      if (plugin.options) {
        const ctx = this.createContext(plugin.name);
        const result = await plugin.options.call(ctx, currentOptions);
        if (result !== undefined && result !== null) {
          currentOptions = result;
        }
      }
    }
    return currentOptions;
  }

  public async runBuildStart(options: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.buildStart) {
        const ctx = this.createContext(plugin.name);
        await plugin.buildStart.call(ctx, options);
      }
    }
  }

  public async resolveId(source: string, importer?: string, customOpts?: { skipSelfPlugin?: string }): Promise<{ id: string; external: boolean } | null> {
    for (const plugin of this.plugins) {
      if (customOpts?.skipSelfPlugin === plugin.name) continue;
      
      if (plugin.resolveId) {
        const ctx = this.createContext(plugin.name);
        // Note: plugin.resolveId can be an object with handler in rollup 3, but we stick to function here for brevity in our mock
        let resolveHandler = plugin.resolveId;
        if (typeof resolveHandler === 'object' && resolveHandler !== null) {
          resolveHandler = (resolveHandler as any).handler;
        }

        if (typeof resolveHandler === 'function') {
           const result = await resolveHandler.call(ctx, source, importer, { isEntry: !importer });
           if (result) {
             if (typeof result === 'string') {
               return { id: result, external: false };
             } else if (typeof result === 'object' && result.id) {
               return { id: result.id, external: !!result.external };
             }
           }
        }
      }
    }
    return null;
  }

  public async load(id: string): Promise<{ code: string; map?: any } | null> {
    for (const plugin of this.plugins) {
      if (plugin.load) {
        const ctx = this.createContext(plugin.name);
        let loadHandler = plugin.load;
        if (typeof loadHandler === 'object' && loadHandler !== null) {
          loadHandler = (loadHandler as any).handler;
        }

        if (typeof loadHandler === 'function') {
          const result = await loadHandler.call(ctx, id);
          if (result) {
            if (typeof result === 'string') {
              return { code: result };
            } else if (typeof result === 'object' && result.code) {
              return { code: result.code, map: result.map };
            }
          }
        }
      }
    }
    return null;
  }

  public async transform(initialCode: string, id: string): Promise<{ code: string; map?: any }> {
    let currentCode = initialCode;
    let currentMap: any = null; // Map merging is complex, skipping for basic mock

    for (const plugin of this.plugins) {
      if (plugin.transform) {
        const ctx = this.createContext(plugin.name);
        let transformHandler = plugin.transform;
        if (typeof transformHandler === 'object' && transformHandler !== null) {
          transformHandler = (transformHandler as any).handler;
        }

        if (typeof transformHandler === 'function') {
          const result = await transformHandler.call(ctx, currentCode, id);
          if (result) {
            if (typeof result === 'string') {
              currentCode = result;
            } else if (typeof result === 'object' && result.code) {
              currentCode = result.code;
              if (result.map) currentMap = result.map;
            }
          }
        }
      }
    }
    return { code: currentCode, map: currentMap };
  }

  // --- Extended Rollup Lifecycle Runners ---

  public async runModuleParsed(info: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.moduleParsed) await plugin.moduleParsed.call(this.createContext(plugin.name), info);
    }
  }

  public async runBuildEnd(error?: Error): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.buildEnd) await plugin.buildEnd.call(this.createContext(plugin.name), error);
    }
  }

  public async runGenerateBundle(options: any, bundle: any, isWrite: boolean): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.generateBundle) await plugin.generateBundle.call(this.createContext(plugin.name), options, bundle, isWrite);
    }
  }

  public async runWriteBundle(options: any, bundle: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.writeBundle) await plugin.writeBundle.call(this.createContext(plugin.name), options, bundle);
    }
  }

  public async runCloseBundle(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.closeBundle) await plugin.closeBundle.call(this.createContext(plugin.name));
    }
  }

  public async runRenderChunk(code: string, chunk: any, options: any): Promise<{ code: string; map?: any }> {
    let currentCode = code;
    for (const plugin of this.plugins) {
      if (plugin.renderChunk) {
        const result = await plugin.renderChunk.call(this.createContext(plugin.name), currentCode, chunk, options);
        if (result) {
          currentCode = typeof result === 'string' ? result : result.code;
        }
      }
    }
    return { code: currentCode };
  }

  public async runChunkAdditions(method: 'banner' | 'footer' | 'intro' | 'outro'): Promise<string> {
    let result = '';
    for (const plugin of this.plugins) {
      if (plugin[method]) {
        const output = await (plugin[method] as any).call(this.createContext(plugin.name));
        if (output) result += output + '\n';
      }
    }
    return result;
  }

  // --- Vite Lifecycle Runners ---

  public async runConfigResolved(config: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.configResolved) await plugin.configResolved(config);
    }
  }

  public async runConfigureServer(server: any): Promise<Array<() => void>> {
    const postHooks: Array<() => void> = [];
    for (const plugin of this.plugins) {
      if (plugin.configureServer) {
        const post = await plugin.configureServer(server);
        if (typeof post === 'function') postHooks.push(post);
      }
    }
    return postHooks;
  }

  public async runTransformIndexHtml(html: string, ctx: any): Promise<string> {
    let currentHtml = html;
    for (const plugin of this.plugins) {
      if (plugin.transformIndexHtml) {
        let handler = plugin.transformIndexHtml;
        if (typeof handler === 'object' && handler !== null) handler = (handler as any).transform;
        
        if (typeof handler === 'function') {
           const result = await handler(currentHtml, ctx);
           if (typeof result === 'string') {
             currentHtml = result;
           } else if (Array.isArray(result)) {
             // Basic array injection mock
             for (const tag of result) {
                if (tag.injectTo === 'body') currentHtml = currentHtml.replace('</body>', `<${tag.tag}></${tag.tag}></body>`);
                else currentHtml = currentHtml.replace('</head>', `<${tag.tag}></${tag.tag}></head>`);
             }
           }
        }
      }
    }
    return currentHtml;
  }

  public getEmittedFiles(): Map<string, EmittedFile> {
    return this.emittedFiles;
  }

  public getWatchFiles(): Set<string> {
    return this.watchFiles;
  }
}
