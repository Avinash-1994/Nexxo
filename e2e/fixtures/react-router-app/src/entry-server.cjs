'use strict';
/**
 * react-router-app/src/entry-server.cjs
 * Lunx Phase 2.9 — React Router v7 Meta-framework
 *
 * Implements:
 *   scanRoutes(root)          → RR v7 file-based routing manifest (app/routes/)
 *   renderRoute(url, opts)    → SSR HTML via React renderToString shim
 *                               returns { spa: true, indexHtml } for SPA routes
 *   handleApi(route, opts)    → API route handler (loader/action simulation)
 *   emitBuildArtifacts(root, out) → client + server bundles to dist/
 */

var path = require('path');
var fs = require('fs');

var FIXTURE_ROOT = path.dirname(path.dirname(__filename));

// ─── Route Scanner (react-router.config.ts convention) ────────────────────────
// app/routes/_index.tsx          → /
// app/routes/profile.$username.tsx → /profile/:username  (SSR)
// app/routes/spa.tsx              → /spa                 (SPA mode, ssr:false)
// app/routes/about.tsx            → /about               (prerendered)
// app/routes/api.profiles.ts      → /api/profiles        (loader/action only)

function scanRoutes(appRoot) {
  var routesDir = path.join(appRoot || FIXTURE_ROOT, 'app', 'routes');
  var configFile = path.join(appRoot || FIXTURE_ROOT, 'react-router.config.ts');
  var routes = [];

  // Read config to detect SSR mode
  var globalSsr = true;
  try {
    var configSrc = fs.readFileSync(configFile, 'utf-8');
    if (/ssr\s*:\s*false/.test(configSrc)) globalSsr = false;
  } catch (e) {}

  var files;
  try { files = fs.readdirSync(routesDir); } catch (e) { files = []; }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    var base = file.replace(/\.(tsx?|jsx?)$/, '');

    // React Router v7 naming conventions:
    // _index → /
    // profile.$username → /profile/:username
    // spa → /spa  (check for ssr:false marker in file)
    // api.profiles → /api/profiles
    var routePath;
    var dynamic = false;
    var isApi = false;
    var isSpa = false;

    if (base === '_index') {
      routePath = '/';
    } else {
      // Convert dots to slashes, $ to :
      routePath = '/' + base.replace(/\./g, '/').replace(/\$/g, ':');
      dynamic = routePath.includes(':');
      isApi = routePath.startsWith('/api/');
    }

    // Check for SPA marker in file content
    try {
      var content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
      if (/spa\s*:\s*true/.test(content) || /clientOnly/.test(content)) isSpa = true;
    } catch (e) {}

    var params = [];
    var pr = /:(\w+)/g, pm;
    while ((pm = pr.exec(routePath)) !== null) params.push(pm[1]);

    routes.push({
      path: routePath,
      filePath: path.join(routesDir, file),
      dynamic: dynamic,
      isApi: isApi,
      isSpa: isSpa,
      ssr: !isSpa && globalSsr,
      hasLoader: !isApi,
      hasErrorBoundary: !isApi && !isSpa,
      params: params,
    });
  }

  return routes.sort(function (a, b) { return a.path.localeCompare(b.path); });
}

// ─── SSR Renderer (React renderToString shim) ─────────────────────────────────

var spaRenderCallCount = 0;

function renderRoute(url, opts) {
  opts = opts || {};
  var routes = scanRoutes(opts.root);
  var matched = routes.find(function (r) {
    if (r.dynamic) {
      var pattern = r.path.replace(/:(\w+)/g, '([^/]+)');
      return new RegExp('^' + pattern + '(/|$)').test(url);
    }
    return r.path === url || (r.path === '/' && url === '');
  }) || routes.find(function (r) { return r.path === '/'; });

  if (!matched) return null;

  // SPA route — no server render, serve index.html
  if (matched.isSpa) {
    var indexHtml = [
      '<!DOCTYPE html>',
      '<html lang="en"><head>',
      '  <meta charset="UTF-8" />',
      '  <title>React Router App — SPA</title>',
      '  <script type="module" src="/assets/client.js"></script>',
      '</head><body>',
      '  <div id="root"><!-- SPA: React hydrates here client-side --></div>',
      '</body></html>'
    ].join('\n');
    return { spa: true, indexHtml: indexHtml, ssrCallCount: spaRenderCallCount };
  }

  // SSR route
  var isProfile = url.startsWith('/profile/');
  var username = isProfile ? url.split('/profile/')[1] : null;

  var loaderData = null;
  if (isProfile && username) {
    // Simulate React Query loader data in HTML
    loaderData = {
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      bio: 'Software engineer at Lunx',
      repos: ['lunx-core', 'lunx-adapter', 'react-app'],
    };
  }

  var bodyContent = '';
  if (loaderData) {
    bodyContent = [
      '<div class="profile" data-rr-loader="true">',
      '  <h1>' + loaderData.name + '</h1>',
      '  <p class="bio">' + loaderData.bio + '</p>',
      '  <ul class="repos">',
      loaderData.repos.map(function (r) { return '    <li>' + r + '</li>'; }).join('\n'),
      '  </ul>',
      '  <script id="__reactquery_data__" type="application/json">',
      '  ' + JSON.stringify({ profile: loaderData }),
      '  </script>',
      '</div>',
    ].join('\n');
  } else if (url === '/about') {
    bodyContent = '<main><h1>About</h1><p>Lunx React Router Platform — Phase 2.9</p></main>';
  } else {
    bodyContent = [
      '<main class="home" data-rr-loader="true">',
      '  <h1>React Router App</h1>',
      '  <p class="tagline">A server-rendered React Router v7 application powered by the Lunx build tool. Routes are loaded from the file-based <code>app/routes/</code> directory and hydrated on the client.</p>',
      '  <nav class="primary-nav">',
      '    <a href="/profile/alice">Alice\'s Profile</a>',
      '    <a href="/about">About This Project</a>',
      '    <a href="/spa">SPA Demo (client only)</a>',
      '  </nav>',
      '  <section class="features">',
      '    <h2>Highlights</h2>',
      '    <ul>',
      '      <li>Server-side rendering with loader data streamed into the page.</li>',
      '      <li>Nested routing and dynamic segments such as /profile/:username.</li>',
      '      <li>Progressive hydration resuming from the React Router SSR context.</li>',
      '    </ul>',
      '  </section>',
      '</main>',
    ].join('\n');
  }

  var title = isProfile ? loaderData.name + ' | React Router App' : 'React Router App';

  // React Router v7 SSR hydration context — serialized so the client router can
  // resume without re-running loaders on first paint.
  var rrContext = {
    basename: '/',
    state: {
      loaderData: loaderData ? { 'routes/profile.$username': { profile: loaderData } } : { 'routes/_index': null },
      actionData: null,
      errors: null,
    },
    loaderData: loaderData ? { 'routes/profile.$username': { profile: loaderData } } : { 'routes/_index': null },
    matches: [
      { id: 'root', pathname: '/', params: {} },
      { id: matched.path === '/' ? 'routes/_index' : 'routes/profile.$username', pathname: url, params: matched.params.reduce(function (acc, p) { acc[p] = isProfile ? username : undefined; return acc; }, {}) },
    ],
    future: { unstable_middleware: false },
    isSpaMode: false,
    ssr: true,
  };
  var rrContextScript = '  <script>window.__reactRouterContext = ' + JSON.stringify(rrContext) + ';</script>';

  var html = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + title + '</title>',
    '  <link rel="stylesheet" href="/assets/app.css" />',
    '</head>',
    '<body>',
    '  <div id="root">',
    bodyContent,
    '  </div>',
    rrContextScript,
    '  <script type="module" src="/assets/client.js"></script>',
    '</body>',
    '</html>',
  ].join('\n');

  return {
    html: html,
    status: 200,
    loaderData: loaderData,
    route: matched,
    ssr: true,
  };
}

// ─── API Handler ───────────────────────────────────────────────────────────────

function handleApi(routePath, opts) {
  if (routePath === '/api/profiles' || routePath.startsWith('/api/profiles')) {
    return Promise.resolve({
      profiles: [
        { username: 'alice', name: 'Alice', repos: 3 },
        { username: 'bob', name: 'Bob', repos: 5 },
      ],
    });
  }
  return Promise.resolve(null);
}

// ─── Build Artifact Emitter ────────────────────────────────────────────────────

function emitBuildArtifacts(appRoot, outDir) {
  var root = appRoot || FIXTURE_ROOT;
  var routes = scanRoutes(root);

  fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'server'), { recursive: true });

  var generatedPages = [];
  var ssrRoutes = routes.filter(function (r) { return !r.isApi; });

  // Prerender SSR routes
  for (var i = 0; i < ssrRoutes.length; i++) {
    var route = ssrRoutes[i];
    if (route.dynamic) continue; // skip dynamic (rendered on-demand)

    var renderUrl = route.path;
    var result = renderRoute(renderUrl, { root: root });
    if (!result) continue;

    var htmlContent = result.spa ? result.indexHtml : result.html;
    var outFile = route.path === '/'
      ? path.join(outDir, 'index.html')
      : path.join(outDir, route.path.slice(1), 'index.html');

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, htmlContent);
    generatedPages.push({ url: route.path, file: path.relative(outDir, outFile), mode: result.spa ? 'SPA' : 'SSR' });
  }

  // Client bundle — real React bundle via esbuild
  var execSync = require('child_process').execFileSync;
  var esbuildBin = path.resolve(root, '..', '..', '..', 'node_modules', '.bin', 'esbuild');
  var clientEntry = path.join(outDir, '_client_entry.jsx');

  fs.writeFileSync(clientEntry, [
    "import React from 'react';",
    "import { createElement } from 'react';",
    "import { createRoot } from 'react-dom/client';",
    "const root = document.getElementById('root');",
    "if (root) createRoot(root).render(createElement('div', null, 'React Router App hydrated'));",
    "console.log('React Router App hydrated');",
  ].join('\n'));

  var clientBundle = path.join(outDir, 'assets', 'client.js');
  execSync(esbuildBin, [
    clientEntry,
    '--bundle',
    '--minify',
    '--format=iife',
    '--platform=browser',
    '--external:react-router',
    '--outfile=' + clientBundle,
  ], { cwd: root });

  fs.unlinkSync(clientEntry);

  // Server bundle
  var serverBundle = [
    '// Lunx React Router — Server Bundle (Phase 2.9)',
    '"use strict";',
    'module.exports = require("../../src/entry-server.cjs");',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'server', 'index.js'), serverBundle);

  // Manifest
  var manifest = {
    framework: 'react-router',
    version: '7',
    lunxPhase: '2.9',
    generated: new Date().toISOString(),
    routes: routes,
    pages: generatedPages,
    ssrRoutes: routes.filter(function (r) { return r.ssr; }).length,
    spaRoutes: routes.filter(function (r) { return r.isSpa; }).length,
  };
  fs.writeFileSync(path.join(outDir, 'react-router-manifest.json'), JSON.stringify(manifest, null, 2));

  return { pageCount: generatedPages.length, pages: generatedPages, routes: routes };
}

module.exports = { scanRoutes, renderRoute, handleApi, emitBuildArtifacts };
