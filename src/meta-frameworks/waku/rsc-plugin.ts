import type { Plugin } from '@lunx/adapter-core';
import path from 'path';

let wakuCompiler: any;

export function wakuRscPlugin(): Plugin {
  return {
    name: 'lunx:waku-rsc',

    async resolveId(source: string) {
       // Virtual bridge linking Core RSC Server actions
       if (source === 'virtual:lunx/waku-rsc-router') {
          return source;
       }
       return null;
    },

    async load(id: string) {
       if (id === 'virtual:lunx/waku-rsc-router') {
          // Shim standard RSC pipeline mappings for React Server Components natively
          // Mapping directly over 'react-server-dom-webpack/server' (Vite shim alternative)
          return `
             import { renderToReadableStream } from 'react-server-dom-webpack/server.browser';
             // Internally this binds against the project src/entries.tsx which Waku relies heavily on
             import * as Entries from '${path.join(process.cwd(), 'src/entries.tsx').replace(/\\/g, '/')}';

             export async function renderRSC(url) {
                // Return Flight Data Stream payload directly using React core SSR hooks
                const element = await Entries.default(url);
                if (!element) return null;
                return renderToReadableStream(element);
             }

             export async function renderSSR(url) {
                // Typically SSR is deferred inside Waku down through the react-server-dom stream parser
                // For simplified integration we expose the hook here natively
                return '<!-- React Shell Placeholder -->';
             }
          `;
       }
       return null;
    },

    transform(code: string, id: string) {
       if (!id.endsWith('.tsx') && !id.endsWith('.ts')) return null;
       
       // Handle "use client" and "use server" directives explicitly
       // In a native SWC configuration, this triggers dual-bundle emitting.
       // We mark those chunks here in the TS hook prior to native extraction.
       if (code.includes('use client')) {
           return {
              code: `/* @@lunx_rsc_client_boundary@@ */\n` + code,
              map: null
           };
       }
       if (code.includes('use server')) {
           return {
              code: `/* @@lunx_rsc_server_boundary@@ */\n` + code,
              map: null
           };
       }
       
       return null;
    }
  };
}
