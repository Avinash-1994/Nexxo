import type { Plugin } from '@lunx/adapter-core';
import { spawn } from 'child_process';
import path from 'path';

let electronProcess: any = null;

export function electronPlugin(): Plugin {
  return {
    name: 'lunx:electron-process',

    async transform(code: string, id: string) {
       // Identify and externalize common Node.js / Electron APIs like 'ipcRenderer', 'fs', etc.
       // The native pipeline does this via Vite's \`build.rollupOptions.external\` naturally,
       // but here we verify that if code requests \`electron\` we do not attempt to polyfill it.
       return null;
    },

    async buildOutput(outputDir: string) {
       // Development Lifecycle hook: Auto-restarts Electron process on main.ts change
       if (process.env.NODE_ENV === 'development') {
           const electronPath = require('electron'); // Optional dependency loaded at dev-time
           
           if (electronProcess) {
              electronProcess.kill();
           }

           electronProcess = spawn(electronPath, ['.'], {
              cwd: process.cwd(),
              env: {
                 ...process.env,
                 // Pass down the Dev Server PORT for the renderer
                 VITE_DEV_SERVER_URL: 'http://localhost:5173/' 
              }
           });

           electronProcess.stdout.on('data', (d: any) => console.log(`[Electron] ${d}`));
           electronProcess.stderr.on('data', (d: any) => console.error(`[Electron] ${d}`));
       }
    }
  };
}
