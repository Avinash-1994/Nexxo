import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { tauriIpcPlugin } from './tauri-plugin.js';

export interface TauriConfig {
  backendSrc?: string;       // default 'src-tauri'
  autoBuildRust?: boolean;   // default false
}

export class TauriAdapter implements LunxAdapter {
  name = 'tauri';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['@tauri-apps/api']);
  }

  plugins(): Plugin[] {
    return [
      tauriIpcPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.tauri) config.tauri = {};
    config.tauri = {
      backendSrc: 'src-tauri',
      autoBuildRust: false,
      ...(config.tauri || {})
    };
    return config;
  }

  // BUG-004: use getDevHandler not serverMiddleware
  // BUG-002: null guard on req/res
  getDevHandler(): any {
    return async (req: any, res: any, next: any) => {
      if (!req || !res) return next?.();

      // Tauri relies on native Rust backend, dev server acts purely as static HTML edge host for the WebView
      next();
    };
  }
}

registry.register(new TauriAdapter());
