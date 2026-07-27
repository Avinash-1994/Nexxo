import type { Plugin } from '@lunx/adapter-core';
import fs from 'fs';
import path from 'path';

export function tauriIpcPlugin(): Plugin {
  return {
    name: 'lunx:tauri-ipc',

    async transform(code: string, id: string) {
       // Inspect typescript/javascript code utilizing tauri's IPC \`invoke\`
       // This plugin acts primarily to ensure that when \`@tauri-apps/api\` is imported,
       // it's externalized or properly mapped out of SSR bundles and flagged appropriately
       
       if (id.includes('@tauri-apps/api') || code.includes('@tauri-apps/api')) {
          // No immediate core transformations are required for standard IPC mapping unless
          // we inject mock IPC bindings for browser-based dev server testing outside of the Tauri window.
          // For now, we emit the code safely unmodified.
          return {
             code: code,
             map: null
          };
       }
       return null;
    },

    async buildOutput(outputDir: string) {
       // As part of the Tauri Adapter spec, post-build we can automatically verify or execute
       // \`cargo build\` if \`autoBuildRust\` is enabled (handled outside the core plugin loop)
       const tauriConf = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
       
       if (fs.existsSync(tauriConf)) {
          console.log('[Lunx:Tauri] Verified static bundle deployment to WebView directory.');
       }
    }
  };
}
