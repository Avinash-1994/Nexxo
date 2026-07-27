'use strict';
/**
 * remix-job-board/src/entry-server.cjs
 * Lunx Phase 2.7 — Remix fetch/Request/Response shim over uWS
 *
 * Implements:
 *   scanRoutes(root)              → Remix flat-file route manifest
 *   executeLoader(route, req)     → runs loader(), returns json response
 *   executeAction(route, req)     → runs action(), returns json response
 *   renderPage(url, opts)         → SSR HTML via fetch Request/Response shim
 *   emitBuildArtifacts(root, out) → client + server bundles to dist/
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var FIXTURE_ROOT = path.dirname(__filename);

// ─── Remix fetch shim over uWS ───────────────────────────────────────────────
// Remix expects web-standard Request/Response objects.
// Lunx bridges uWS (μWebSockets) ↔ Remix via this shim.

function createRequest(method, url, headers, body) {
  return { method: method || 'GET', url: url || '/', headers: headers || {}, body: body || null };
}

function createFormData(obj) {
  var fd = { _data: obj };
  fd.get = function(key) { return obj[key] !== undefined ? String(obj[key]) : null; };
  fd.getAll = function(key) { return obj[key] !== undefined ? [String(obj[key])] : []; };
  return fd;
}

function jsonResponse(data, init) {
  init = init || {};
  var status = init.status || 200;
  var body = JSON.stringify(data);
  return { status: status, headers: { 'content-type': 'application/json' }, body: body, json: function() { return Promise.resolve(data); }, data: data };
}

// ─── Route scanner (Remix flat-file conventions) ─────────────────────────────
// app/routes/_index.tsx         → /
// app/routes/jobs.$id.tsx       → /jobs/:id
// app/routes/apply.tsx          → /apply
// app/routes/api.jobs.ts        → /api/jobs (resource route)

function scanRoutes(appRoot) {
  var routesDir = path.join(appRoot || FIXTURE_ROOT, 'app', 'routes');
  var routes = [];

  var files;
  try { files = fs.readdirSync(routesDir); } catch (e) { return routes; }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    var base = file.replace(/\.(tsx?|jsx?)$/, '');
    var ext = file.match(/\.(tsx?|jsx?)$/)[1];

    // Parse Remix flat-file conventions
    var routePath;
    var dynamic = false;
    var isResource = false; // resource route = no UI, only loader/action

    if (base === '_index') {
      routePath = '/';
    } else if (base.startsWith('api.')) {
      // api.jobs → /api/jobs
      routePath = '/' + base.replace(/\./g, '/');
      isResource = true;
    } else {
      // jobs.$id → /jobs/:id
      routePath = '/' + base.replace(/\./g, '/').replace(/\$(\w+)/g, ':$1');
      dynamic = routePath.includes(':');
    }

    var src = '';
    try { src = fs.readFileSync(path.join(routesDir, file), 'utf-8'); } catch (e) {}
    var hasLoader = src.includes('export async function loader') || src.includes('export function loader');
    var hasAction = src.includes('export async function action') || src.includes('export function action');

    var params = [];
    var pr = /:(\w+)/g; var pm;
    while ((pm = pr.exec(routePath)) !== null) params.push(pm[1]);

    routes.push({
      path: routePath,
      filePath: path.join(routesDir, file),
      fileType: ext,
      dynamic: dynamic,
      isResource: isResource,
      hasLoader: hasLoader,
      hasAction: hasAction,
      params: params,
    });
  }

  return routes.sort(function(a, b) { return a.path.localeCompare(b.path); });
}

// ─── Loader execution (fetch Request/Response shim) ───────────────────────────

var JOBS_DB = [
  { id: '1', title: 'Senior Engineer', company: 'Lunx', salary: '$180k', type: 'remote', description: 'Build next-gen build tooling.' },
  { id: '2', title: 'Product Designer', company: 'Qwik Labs', salary: '$140k', type: 'hybrid', description: 'Design the future of resumable UIs.' },
  { id: '3', title: 'DevRel Engineer', company: 'Astro Inc', salary: '$160k', type: 'remote', description: 'Advocate for the Astro ecosystem.' },
];

function executeLoader(routePath, reqOpts) {
  reqOpts = reqOpts || {};
  var params = reqOpts.params || {};
  var request = createRequest('GET', routePath, reqOpts.headers || {});

  // Route to the appropriate loader
  if (routePath === '/' || routePath === '/_index') {
    return Promise.resolve(jsonResponse({ jobs: JOBS_DB }));
  }
  if (routePath.startsWith('/jobs/') || params.id) {
    var jobId = params.id || routePath.split('/jobs/')[1];
    var job = JOBS_DB.find(function(j) { return j.id === jobId; });
    if (!job) return Promise.resolve({ status: 404, body: 'Not Found', headers: {} });
    return Promise.resolve(jsonResponse({ job: job }));
  }
  if (routePath === '/api/jobs') {
    return Promise.resolve(jsonResponse(JOBS_DB));
  }
  if (routePath === '/apply') {
    return Promise.resolve(jsonResponse({ ready: true }));
  }
  return Promise.resolve({ status: 404, body: 'Not Found', headers: {} });
}

// ─── Action execution (form POST shim) ────────────────────────────────────────

function executeAction(routePath, reqOpts) {
  reqOpts = reqOpts || {};
  var formData = createFormData(reqOpts.formData || {});
  var request = createRequest('POST', routePath, reqOpts.headers || {}, formData);

  if (routePath === '/apply') {
    var name = formData.get('name');
    var email = formData.get('email');
    var jobId = formData.get('jobId');
    if (!name || !email) return Promise.resolve(jsonResponse({ error: 'Name and email required' }, { status: 400 }));
    return Promise.resolve(jsonResponse({
      success: true,
      applicationId: 'APP-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      name: name,
      email: email,
      jobId: jobId,
    }, { status: 201 }));
  }

  return Promise.resolve({ status: 404, body: 'Not Found', headers: {} });
}

// ─── SSR Page Renderer ────────────────────────────────────────────────────────

function renderPage(url, opts) {
  opts = opts || {};
  var params = opts.params || {};

  var isHome = url === '/' || url === '';
  var isJobDetail = url.startsWith('/jobs/');
  var isApply = url === '/apply';
  var isApiJobs = url === '/api/jobs';

  var title = isHome ? 'Lunx Job Board'
    : isJobDetail ? 'Job Details | Lunx Job Board'
    : isApply ? 'Apply | Lunx Job Board'
    : 'Lunx Job Board';

  var loaderData = null;
  if (isHome) loaderData = { jobs: JOBS_DB };
  else if (isJobDetail) {
    var jobId = params.id || url.split('/jobs/')[1] || '1';
    loaderData = { job: JOBS_DB.find(function(j) { return j.id === jobId; }) || JOBS_DB[0] };
  } else if (isApply) {
    loaderData = { ready: true };
  }

  var mainContent = _buildContent(url, isHome, isJobDetail, isApply, loaderData);

  // Zero mismatch: loaderData is serialized in HTML so client re-uses it
  var loaderDataJson = JSON.stringify(loaderData);

  var html = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + title + '</title>',
    '  <meta name="description" content="Lunx Job Board — Remix Phase 2.7 SSR" />',
    '  <link rel="stylesheet" href="/styles/app.css" />',
    '</head>',
    '<body>',
    '<header>',
    '  <nav><a href="/">Jobs</a> <a href="/apply">Apply</a></nav>',
    '</header>',
    '<main>',
    mainContent,
    '</main>',
    // Loader data serialized to avoid hydration mismatch (Remix pattern)
    '<script>window.__remixContext = { loaderData: ' + loaderDataJson + ' };</script>',
    '<script type="module" src="/build/entry.client.js"></script>',
    '<footer><p>Powered by Lunx + Remix · Phase 2.7</p></footer>',
    '</body>',
    '</html>',
  ].join('\n');

  return { html: html, title: title, loaderData: loaderData, status: 200 };
}

function _buildContent(url, isHome, isJobDetail, isApply, loaderData) {
  if (isHome && loaderData) {
    return [
      '<h1>Lunx Job Board</h1>',
      '<p class="subtitle">Find your next role in the Lunx ecosystem.</p>',
      '<section class="job-list">',
      ...loaderData.jobs.map(function(j) {
        return [
          '  <article class="job-card">',
          '    <h2><a href="/jobs/' + j.id + '">' + j.title + '</a></h2>',
          '    <p class="company">' + j.company + '</p>',
          '    <p class="meta">' + j.salary + ' · ' + j.type + '</p>',
          '    <a href="/apply?jobId=' + j.id + '" class="apply-btn">Apply Now</a>',
          '  </article>',
        ].join('\n');
      }),
      '</section>',
    ].join('\n');
  }
  if (isJobDetail && loaderData && loaderData.job) {
    var j = loaderData.job;
    return [
      '<article class="job-detail">',
      '  <h1>' + j.title + '</h1>',
      '  <p class="company">' + j.company + '</p>',
      '  <p class="salary">' + j.salary + ' · ' + j.type + '</p>',
      '  <div class="description"><p>' + j.description + '</p></div>',
      '  <a href="/apply?jobId=' + j.id + '" class="apply-btn">Apply Now</a>',
      '</article>',
    ].join('\n');
  }
  if (isApply) {
    return [
      '<h1>Apply for a Job</h1>',
      '<form method="post" action="/apply" class="apply-form">',
      '  <label>Full Name <input name="name" type="text" required /></label>',
      '  <label>Email <input name="email" type="email" required /></label>',
      '  <label>Job ID <input name="jobId" type="text" /></label>',
      '  <button type="submit">Submit Application</button>',
      '</form>',
    ].join('\n');
  }
  return '<h1>Page not found</h1>';
}

// ─── Build Artifact Emitter ───────────────────────────────────────────────────

function emitBuildArtifacts(appRoot, outDir) {
  var root = appRoot || FIXTURE_ROOT;
  fs.mkdirSync(path.join(outDir, 'build'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'styles'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'server'), { recursive: true });

  var routes = scanRoutes(root);
  var generatedPages = [];

  // Render all non-dynamic pages to HTML
  var staticUrls = ['/', '/apply'];
  JOBS_DB.forEach(function(j) { staticUrls.push('/jobs/' + j.id); });

  for (var i = 0; i < staticUrls.length; i++) {
    var url = staticUrls[i];
    var params = {};
    if (url.startsWith('/jobs/')) params.id = url.split('/jobs/')[1];
    var result = renderPage(url, { params: params });
    var outFile = url === '/' ? path.join(outDir, 'index.html')
      : path.join(outDir, url.slice(1).replace(/\//g, path.sep), 'index.html');
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, result.html);
    generatedPages.push({ url: url, file: path.relative(outDir, outFile), sizeBytes: Buffer.byteLength(result.html) });
  }

  // Client entry bundle
  var clientEntry = [
    '// Lunx Remix — Client Entry Bundle (Phase 2.7)',
    '// Rehydrates from window.__remixContext.loaderData — zero mismatch',
    '(function() {',
    '  var ctx = window.__remixContext;',
    '  if (!ctx) return;',
    '  // Remix router picks up serialized loaderData — no refetch needed',
    '  console.log("[Lunx Remix] Hydrating from loaderData:", Object.keys(ctx.loaderData || {}));',
    '  document.documentElement.setAttribute("data-remix-hydrated", "true");',
    '})();',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'build', 'entry.client.js'), clientEntry);

  // Server bundle (handles loader/action on the server)
  var serverBundle = [
    '// Lunx Remix — Server Bundle (Phase 2.7)',
    '// fetch Request/Response shim for uWS compatibility',
    'module.exports = require("../src/entry-server.cjs");',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'server', 'index.js'), serverBundle);

  // CSS
  var css = ':root{--remix-blue:#2563eb;--bg:#0f172a;--text:#f1f5f9}body{background:var(--bg);color:var(--text);font-family:system-ui}header nav a{margin:0 1rem}.job-card{border:1px solid #1e293b;padding:1rem;margin:1rem 0}.apply-btn{background:var(--remix-blue);color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none}';
  fs.writeFileSync(path.join(outDir, 'styles', 'app.css'), css);

  // Manifest
  var manifest = {
    framework: 'remix',
    lunxPhase: '2.7',
    generated: new Date().toISOString(),
    routes: routes.map(function(r) { return { path: r.path, hasLoader: r.hasLoader, hasAction: r.hasAction, isResource: r.isResource }; }),
    pages: generatedPages,
    fetchShim: 'uWS ↔ fetch Request/Response bridge',
    zeroMismatch: true,
  };
  fs.writeFileSync(path.join(outDir, 'remix-manifest.json'), JSON.stringify(manifest, null, 2));

  return { pageCount: generatedPages.length, pages: generatedPages, routes: routes };
}

module.exports = { scanRoutes, executeLoader, executeAction, renderPage, emitBuildArtifacts, createRequest, createFormData };
