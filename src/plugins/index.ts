import { PluginSandbox } from '../core/sandbox.js';
import { PermissionManager, PermissionSet } from '../core/permissions.js';

export type PluginHook = 'resolve' | 'load' | 'transform' | 'buildStart' | 'buildEnd';

export class PluginManager {
  plugins: Plugin[] = [];

  // Performance optimization: Cache plugins by hook type
  private pluginsByHook: Map<string, Plugin[]> = new Map();
  private hooksCached = false;

  register(p: Plugin) {
    this.plugins.push(p);
    this.hooksCached = false; // Invalidate cache
  }

  // Build hook cache for faster lookups
  private ensureHookCache() {
    if (this.hooksCached) return;

    this.pluginsByHook.clear();
    const hooks = ['resolveId', 'load', 'transform', 'renderChunk', 'buildStart', 'buildEnd'];

    for (const hook of hooks) {
      this.pluginsByHook.set(
        hook,
        this.plugins.filter(p => typeof (p as any)[hook] === 'function')
      );
    }

    this.hooksCached = true;
  }

  async resolveId(source: string, importer?: string): Promise<string | undefined> {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('resolveId') || [];

    for (const p of plugins) {
      const res = await p.resolveId!(source, importer);
      if (res) return res;
    }
    return undefined;
  }

  async load(id: string): Promise<string | undefined> {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('load') || [];

    for (const p of plugins) {
      const res = await p.load!(id);
      if (res) return res;
    }
    return undefined;
  }

  async transform(code: string, id: string): Promise<string> {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('transform') || [];

    let result = code;
    for (const p of plugins) {
      const res = await p.transform!(result, id);
      if (typeof res === 'string') result = res;
      else if (res && typeof res === 'object' && 'code' in res) result = res.code;
    }
    return result;
  }

  async renderChunk(code: string, chunk: any): Promise<string> {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('renderChunk') || [];

    let result = code;
    for (const p of plugins) {
      const res = await p.renderChunk!(result, chunk);
      if (typeof res === 'string') result = res;
      else if (res && typeof res === 'object' && 'code' in res) result = res.code;
    }
    return result;
  }

  // Parallel execution for buildStart (plugins don't depend on each other)
  async buildStart() {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('buildStart') || [];

    await Promise.all(plugins.map(p => p.buildStart!()));
  }

  // Parallel execution for buildEnd
  async buildEnd() {
    this.ensureHookCache();
    const plugins = this.pluginsByHook.get('buildEnd') || [];

    await Promise.all(plugins.map(p => p.buildEnd!()));
  }

  loadSandboxedPlugin(code: string, permissions: PermissionSet = {}): Plugin {
    const pm = new PermissionManager(permissions);
    const sandbox = new PluginSandbox(pm);
    const exports = sandbox.run(code);

    // Assuming the plugin exports a default object or named export 'plugin'
    const plugin = exports.default || exports.plugin || exports;

    if (!plugin.name) {
      throw new Error('Sandboxed plugin must export a "name" property.');
    }

    return plugin as Plugin;
  }
}

export interface Plugin {
  name: string;
  setup?: (api: any) => void;
  resolveId?: (source: string, importer?: string) => Promise<string | undefined | null | void> | string | undefined | null | void;
  load?: (id: string) => Promise<string | undefined | null | void> | string | undefined | null | void;
  transform?: (code: string, id: string) => Promise<string | { code: string, map?: any } | void> | string | { code: string, map?: any } | void;
  renderChunk?: (code: string, chunk: any) => Promise<string | { code: string, map?: any } | void> | string | { code: string, map?: any } | void;
  buildStart?: () => Promise<void> | void;
  buildEnd?: () => Promise<void> | void;
  permissions?: PermissionSet;
}


export const marketplace = {
  async list() {
    return [{ name: 'vite-like-react-refresh', description: 'React HMR helper' }];
  },
  async install(name: string) {
    // Mock installation
    console.log(`[Marketplace] Installing plugin: ${name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Marketplace] Successfully installed ${name}`);
    return true;
  }
};
