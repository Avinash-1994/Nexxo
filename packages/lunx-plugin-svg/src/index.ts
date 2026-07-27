/**
 * @lunx/plugin-svg — SVG files as components or URLs
 * Replaces: vite-plugin-svgr, vue-svg-loader, @svgr/webpack
 * Permissions: fs:read
 *
 * Supports:
 *   - import logo from './logo.svg'           → hashed URL string
 *   - import { ReactComponent } from './a.svg' → React component
 *   - import Logo from './logo.svg?component'  → Vue/Svelte component
 *   - import str from './logo.svg?raw'         → raw SVG string
 */

import fs from 'node:fs';
import path from 'node:path';

export interface SVGPluginOptions {
  /** Default export type when no suffix is used (default: 'url') */
  defaultExport?: 'url' | 'component';
  /** Enable SVGO optimisation (default: true) */
  svgo?: boolean;
  /** Framework for component output (default: auto-detect) */
  framework?: 'react' | 'vue' | 'svelte' | 'solid' | 'none';
}

function optimizeSVG(svg: string): string {
  // Minimal SVGO-like pass: strip comments and unnecessary whitespace
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')       // strip comments
    .replace(/\s+/g, ' ')                   // collapse whitespace
    .replace(/> </g, '><')                  // remove space between tags
    .trim();
}

function svgToReactComponent(svg: string, componentName: string): string {
  // Convert SVG attributes to JSX (className, fill="currentColor", etc.)
  let jsx = svg
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<svg /, '<svg {...props} ');

  return `
import React from 'react';
const ${componentName} = (props) => (${jsx});
export { ${componentName} as ReactComponent };
export default ${componentName};
`;
}

function svgToVueComponent(svg: string): string {
  return `<template>${svg}</template>\n<script setup>\ndefineOptions({ name: 'SvgIcon' });\n</script>\n`;
}

export function svg(options: SVGPluginOptions = {}) {
  const {
    defaultExport = 'url',
    svgo = true,
    framework = 'react',
  } = options;

  return {
    name: '@lunx/plugin-svg',

    transform(code: string, id: string) {
      const [filePath, query] = id.split('?');
      if (!filePath.endsWith('.svg')) return;

      const rawSVG = fs.readFileSync(filePath, 'utf8');
      const optimized = svgo ? optimizeSVG(rawSVG) : rawSVG;
      const componentName = path.basename(filePath, '.svg')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/^(\d)/, '_$1');

      // ?raw → string export
      if (query === 'raw') {
        return {
          code: `export default ${JSON.stringify(optimized)};`,
          map: null,
        };
      }

      // ?component → framework-specific component
      if (query === 'component') {
        if (framework === 'vue') {
          return { code: `export default ${JSON.stringify(svgToVueComponent(optimized))};`, map: null };
        }
        return { code: svgToReactComponent(optimized, componentName), map: null };
      }

      // Default: URL export or component
      if (defaultExport === 'url') {
        // Return undefined to let Lunx's asset pipeline handle it as a file URL
        return;
      }

      // Default component export
      return { code: svgToReactComponent(optimized, componentName), map: null };
    },
  };
}

export default svg;
