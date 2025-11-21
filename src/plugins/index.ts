export type PluginHook = 'resolve' | 'load' | 'transform' | 'buildStart' | 'buildEnd';

export class PluginManager {
  plugins: Plugin[] = [];

  register(p: Plugin) {
    this.plugins.push(p);
  }

  async transform(code: string, id: string): Promise<string> {
    let result = code;
    for (const p of this.plugins) {
      if (p.transform) {
        const res = await p.transform(result, id);
        if (res) result = res;
      }
    }
    return result;
  }
}

export interface Plugin {
  name: string;
  setup?: (api: any) => void;
  transform?: (code: string, id: string) => Promise<string | void> | string | void;
}

export class SandboxedPlugin implements Plugin {
  name = 'sandboxed-plugin';

  constructor(private sandbox: any) { }

  async transform(code: string, id: string) {
    return this.sandbox.runTransform(code, id);
  }
}

export const marketplace = {
  async list() {
    return [{ name: 'vite-like-react-refresh', description: 'React HMR helper' }];
  },
};
