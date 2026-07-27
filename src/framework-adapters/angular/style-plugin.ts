import type { Plugin } from '@lunx/adapter-core';
import path from 'path';

export function angularStylePlugin(): Plugin {
  return {
    name: 'lunx:angular-styles',

    async transform(code: string, id: string) {
      if (!id.endsWith('.css') && !id.endsWith('.scss') && !id.endsWith('.less')) {
        return null; // Let the Ivy plugin handle .ts
      }

      // If it's a component style (e.g., requested via styleUrls), LightningCSS handles it
      // in the native engine. Here, we can intercept and inject ViewEncapsulation scoping
      // if needed, or we just rely on Angular compiler's Component scope.
      
      // Because Lunx's native CSS pipeline will catch CSS naturally, this plugin
      // focuses strictly on returning the CSS as an injectible string if it was imported 
      // by a Component, preventing it from becoming a separate global asset link.
      
      const isComponentStyle = id.includes('.component.');
      
      if (isComponentStyle) {
        // Simple ViewEncapsulation scoping tag can be embedded here if needed before native pipeline
        return {
           // We return a JS wrapper exported as string for Angular Ivy to consume 
           // natively instead of dropping it in the global CSS chunk.
           code: `export default ${JSON.stringify(code)};`,
           map: null
        };
      }

      return null;
    }
  };
}
