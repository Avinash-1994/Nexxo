/**
 * @lunx/plugin-pwa — Progressive Web App, one plugin, full offline support
 * Replaces: vite-plugin-pwa
 * Permissions: fs:write
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface PWAIcon {
  src: string;
  sizes: number[];
}

export interface RuntimeCacheEntry {
  pattern: RegExp;
  strategy: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate';
}

export interface PWAOptions {
  name: string;
  short_name: string;
  description?: string;
  theme_color?: string;
  background_color?: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  icons: PWAIcon[];
  offline_fallback?: string;
  runtime_cache?: RuntimeCacheEntry[];
}

function generateManifest(options: PWAOptions, base: string): object {
  return {
    name: options.name,
    short_name: options.short_name,
    description: options.description ?? '',
    theme_color: options.theme_color ?? '#ffffff',
    background_color: options.background_color ?? '#ffffff',
    display: options.display ?? 'standalone',
    start_url: './',
    icons: options.icons.flatMap((icon) =>
      icon.sizes.map((size) => ({
        src: icon.src,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any maskable',
      }))
    ),
  };
}

function generateServiceWorker(precacheUrls: string[], options: PWAOptions): string {
  const cacheVersion = crypto.randomUUID().slice(0, 8);
  const runtimeRules = (options.runtime_cache ?? []).map((rule) => ({
    pattern: rule.pattern.toString(),
    strategy: rule.strategy,
  }));

  return `// @lunx/plugin-pwa — Generated Service Worker
const CACHE_VERSION = 'lunx-v${cacheVersion}';
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};
const OFFLINE_FALLBACK = ${JSON.stringify(options.offline_fallback ?? '/offline.html')};
const RUNTIME_RULES = ${JSON.stringify(runtimeRules, null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(OFFLINE_FALLBACK).then((r) => r || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
`;
}

export function pwa(options: PWAOptions) {
  let distDir = '';
  let baseUrl = '/';

  return {
    name: '@lunx/plugin-pwa',
    enforce: 'post' as const,

    configResolved(config: any) {
      distDir = path.resolve(config.root ?? process.cwd(), config.build?.outDir ?? 'dist');
      baseUrl = config.base ?? '/';
    },

    async closeBundle() {
      if (!fs.existsSync(distDir)) return;

      // Collect all output assets for precaching
      const assets: string[] = [];
      function walk(dir: string) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else {
            const rel = '/' + path.relative(distDir, full).replace(/\\/g, '/');
            assets.push(rel);
          }
        }
      }
      walk(distDir);

      // Write manifest.webmanifest
      const manifest = generateManifest(options, baseUrl);
      fs.writeFileSync(
        path.join(distDir, 'manifest.webmanifest'),
        JSON.stringify(manifest, null, 2),
        'utf8'
      );

      // Write service worker
      const sw = generateServiceWorker(assets, options);
      fs.writeFileSync(path.join(distDir, 'sw.js'), sw, 'utf8');

      console.info(`[lunx:pwa] ✅ PWA manifest + service worker generated (${assets.length} assets precached)`);
    },

    transformIndexHtml(html: string) {
      const injection = `
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="${options.theme_color ?? '#ffffff'}">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
    }
  </script>`;
      return html.replace('</head>', injection + '\n</head>');
    },
  };
}

export default pwa;
