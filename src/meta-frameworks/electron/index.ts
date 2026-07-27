import type { LunxAdapter, Plugin, LunxConfig, PackageJson, Middleware } from '@lunx/adapter-core';
import { detectDependencies, registry } from '@lunx/adapter-core';
import { electronPlugin } from './electron-plugin.js';

export interface ElectronConfig {
  mainSrc?: string;       // default 'electron/main.ts'
  preloadSrc?: string;    // default 'electron/preload.ts'
}

export class ElectronAdapter implements LunxAdapter {
  name = 'electron';

  detect(projectRoot: string, pkg: PackageJson): boolean {
    return detectDependencies(pkg, ['electron', 'electron-builder']);
  }

  plugins(): Plugin[] {
    return [
      electronPlugin()
    ];
  }

  config(config: LunxConfig): LunxConfig {
    if (!config.electron) config.electron = {};
    config.electron = {
      mainSrc: 'electron/main.ts',
      preloadSrc: 'electron/preload.ts',
      ...(config.electron || {})
    };
    return config;
  }

  getDevHandler(): Middleware {
    return async (req: any, res: any, next: any) => {
      // Set ELECTRON_DEV_SERVER_URL for the main process to load renderer from Lunx dev server
      const devUrl = process.env.ELECTRON_DEV_SERVER_URL || `http://localhost:${req?.socket?.localPort || 5173}`;
      res.setHeader('X-Lunx-Electron-Dev-URL', devUrl);
      // Renderer requests are served directly by the Lunx HMR dev server
      next();
    };
  }

  serverMiddleware(): Middleware[] {
    return [
      async (req: any, res: any, next: any) => {
        // Dev Server Renderer Window Host
        // Routes standard localhost req to the Vite renderer frontend
        next();
      }
    ];
  }
}

registry.register(new ElectronAdapter());
