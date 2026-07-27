/**
 * @lunx/plugin-icons — 100,000+ Icons, Zero Bundle Bloat
 * Replaces: unplugin-icons
 * Permissions: net:fetch (fetch icon datasets on first install)
 *
 * Usage:
 *   import MdiHome from '~icons/mdi/home'       // Vue/Svelte
 *   import { MdiHome } from '~icons/mdi/home'   // React
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

export type IconCompiler = 'vue3' | 'vue2' | 'react' | 'svelte' | 'solid' | 'web-components';

export interface IconsPluginOptions {
  /** Output framework (default: 'react') */
  compiler?: IconCompiler;
  /** Default CSS class for all icons */
  defaultClass?: string;
  /** Scale factor (default: 1.2em) */
  scale?: number;
  /** Custom icon directories: { prefix: '/path/to/svgs/' } */
  customCollections?: Record<string, string>;
  /** Cache directory (default: .lunx/cache/icons) */
  cacheDir?: string;
}

const ICON_PREFIX = '~icons/';
const ICONIFY_API = 'https://api.iconify.design';

async function fetchIconSVG(collection: string, name: string): Promise<string | null> {
  return new Promise((resolve) => {
    const url = `${ICONIFY_API}/${collection}/${name}.svg`;
    https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(data.includes('<svg') ? data : null));
    }).on('error', () => resolve(null));
  });
}

function svgToComponent(svg: string, compiler: IconCompiler, cls: string): string {
  const styled = svg.replace('<svg ', `<svg class="${cls}" `);

  switch (compiler) {
    case 'vue3':
      return `<template>${styled}</template>`;
    case 'react':
      const jsx = styled
        .replace(/class=/g, 'className=')
        .replace(/<svg /, '<svg {...props} ');
      return `import React from 'react';\nexport default (props) => (${jsx});`;
    case 'svelte':
      return `<script>export let size = '1.2em';</script>\n${styled}`;
    default:
      return `export default ${JSON.stringify(styled)};`;
  }
}

export function icons(options: IconsPluginOptions = {}) {
  const {
    compiler = 'react',
    defaultClass = 'lunx-icon',
    cacheDir = '.lunx/cache/icons',
    customCollections = {},
  } = options;

  let resolvedCacheDir = '';

  return {
    name: '@lunx/plugin-icons',

    configResolved(config: any) {
      resolvedCacheDir = path.resolve(config.root ?? process.cwd(), cacheDir);
      fs.mkdirSync(resolvedCacheDir, { recursive: true });
    },

    resolveId(id: string) {
      if (id.startsWith(ICON_PREFIX)) return '\0' + id;
    },

    async load(id: string) {
      if (!id.startsWith('\0' + ICON_PREFIX)) return;

      const iconPath = id.slice(1 + ICON_PREFIX.length); // e.g. 'mdi/home'
      const [collection, name] = iconPath.split('/');

      if (!collection || !name) return `export default null;`;

      // Check custom collection first
      const customDir = customCollections[collection];
      if (customDir) {
        const svgPath = path.resolve(customDir, `${name}.svg`);
        if (fs.existsSync(svgPath)) {
          const svg = fs.readFileSync(svgPath, 'utf8');
          return svgToComponent(svg, compiler, defaultClass);
        }
      }

      // Check cache
      const cacheFile = path.join(resolvedCacheDir, `${collection}__${name}.svg`);
      let svg: string | null = null;
      if (fs.existsSync(cacheFile)) {
        svg = fs.readFileSync(cacheFile, 'utf8');
      } else {
        svg = await fetchIconSVG(collection, name);
        if (svg) fs.writeFileSync(cacheFile, svg, 'utf8');
      }

      if (!svg) {
        console.warn(`[lunx:icons] Icon not found: ${collection}/${name}`);
        return `export default null;`;
      }

      return svgToComponent(svg, compiler, defaultClass);
    },
  };
}

export default icons;
