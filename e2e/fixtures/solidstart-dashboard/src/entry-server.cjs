'use strict';

/**
 * SolidStart entry-server.cjs
 *
 * Used by Lunx dev-server's CJS fast-path (createRequire) and
 * directly by run-test.js for SS-02 (streaming) and SS-07 (SSR content).
 *
 * renderToStream() — returns a Node Readable that:
 *   CHUNK 1: HTML shell (immediately pushed → TTFB)
 *   CHUNK 2: async data (after dataDelay ms)
 *   CHUNK 3: hydration tail + window._$HY
 */

var Readable = require('stream').Readable;

function buildShell(url, isAuthed) {
  var title = url.includes('/dashboard') ? 'Dashboard | Lunx SolidStart'
    : url.includes('/products') ? 'Products | Lunx SolidStart'
    : url.includes('/profile') ? 'Profile | Lunx SolidStart'
    : 'Lunx SolidStart';

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + title + '</title>',
    '  <meta name="description" content="SolidStart streaming SSR — Lunx Phase 2.4" />',
    '</head>',
    '<body>',
    '<div id="root" data-hk="0-0">',
    '  <header class="app-header" data-hk="0-0-0">',
    '    <a href="/" class="logo" data-hk="0-0-0-0">Lunx SolidStart</a>',
    '    <nav data-hk="0-0-0-1">',
    '      <a href="/dashboard" data-hk="0-0-0-1-0">Dashboard</a>',
    '      <a href="/products" data-hk="0-0-0-1-1">Products</a>',
    '      <a href="/profile" data-hk="0-0-0-1-2">Profile</a>',
    '      <a href="/blog" data-hk="0-0-0-1-3">Blog</a>',
    '    </nav>',
    '    <span class="auth-badge" data-hk="0-0-0-2">' + (isAuthed ? 'admin@acme.com' : 'Sign in') + '</span>',
    '  </header>',
    '  <main id="lunx-solid-root" data-hk="0-0-1">',
  ].join('\n');
}

function buildDashboardChunk(isAuthed, elapsedMs) {
  return [
    '    <section class="dashboard-hero" data-hk="0-0-1-0">',
    '      <h1 data-hk="0-0-1-0-0">Dashboard - SolidStart SSR</h1>',
    '      <p class="welcome" data-hk="0-0-1-0-1">Welcome back, SolidStart Admin (admin@acme.com)</p>',
    '    </section>',
    '    <section class="dashboard-stats" data-hk="0-0-1-1">',
    '      <div class="stat"><h2>Revenue</h2><p class="value">$128,450</p><p class="delta">+15.2% vs last month</p></div>',
    '      <div class="stat"><h2>Active Users</h2><p class="value">3,842</p><p class="delta">+8.7% this week</p></div>',
    '      <div class="stat"><h2>Orders</h2><p class="value">1,209</p><p class="delta">+22.1% today</p></div>',
    '      <div class="stat"><h2>Uptime</h2><p class="value">99.98%</p><p class="delta">30-day average</p></div>',
    '    </section>',
    '    <section class="dashboard-feed">',
    '      <h2>Recent Activity</h2>',
    '      <ul>',
    '        <li><time>09:41</time> Order #9921 — $349.00 — completed</li>',
    '        <li><time>09:38</time> User bob@company.com registered</li>',
    '        <li><time>09:30</time> Deploy lunx@1.0.10 to production</li>',
    '        <li><time>09:15</time> Cache warmed — 1,248 assets pre-bundled</li>',
    '        <li><time>08:59</time> Security scan completed — 0 vulnerabilities</li>',
    '      </ul>',
    '    </section>',
    '    <!-- session: ' + (isAuthed ? 'active' : 'none') + ' -->',
    '    <!-- userData.name: SolidStart Admin -->',
    '    <!-- userData.email: admin@acme.com -->',
    '    <!-- stream-latency: ' + elapsedMs + 'ms -->',
  ].join('\n');
}

function buildHydrationTail() {
  return [
    '  </main>',
    '  <footer class="app-footer">',
    '    <p>Powered by Lunx SolidStart Adapter v1.0.0 — Phase 2.4</p>',
    '  </footer>',
    '</div>',
    '<!-- window._$HY: solid-js resumability marker -->',
    '<script>window._$HY={events:[],completed:new WeakSet(),r:{}};</script>',
    '<script type="module" src="/_lunx/assets/entry-client.js"></script>',
    '</body>',
    '</html>',
  ].join('\n');
}

/**
 * renderToStream({ url, cookies })
 * Returns a Node Readable stream.
 *
 * TTFB is the time to the first push() call.
 * The caller can measure by listening to the 'data' event.
 */
exports.renderToStream = function renderToStream(opts) {
  var url = opts.url || '/';
  var cookies = opts.cookies || {};
  var isAuthed = !!(cookies['session']);
  var startMs = Date.now();
  var started = false;

  return new Readable({
    read: function() {
      if (started) return; // guard: read() may be called multiple times
      started = true;
      var self = this;

      // CHUNK 1 — shell pushed synchronously → absolute minimum TTFB
      self.push(buildShell(url, isAuthed));

      // CHUNK 2 — data suspended (simulates real async server data fetch ~8ms)
      var dataDelay = 8;
      setTimeout(function() {
        var elapsed = Date.now() - startMs;
        if (url.includes('/dashboard')) {
          self.push(buildDashboardChunk(isAuthed, elapsed));
        } else {
          self.push('    <h1>SolidStart SSR</h1>\n    <p>Rendered server-side.</p>');
        }
        // CHUNK 3 — hydration tail
        self.push(buildHydrationTail());
        self.push(null); // end stream
      }, dataDelay);
    }
  });
};

/**
 * renderToString({ url, cookies }) — convenience wrapper for tools that
 * need a single string (e.g. Lunx SSR runner).
 * Collects all stream chunks.
 */
exports.renderToString = function renderToString(opts) {
  return new Promise(function(resolve, reject) {
    var stream = exports.renderToStream(opts);
    var chunks = [];
    stream.on('data', function(c) { chunks.push(c); });
    stream.on('end', function() { resolve(chunks.join('')); });
    stream.on('error', reject);
  });
};

/**
 * executeServerAction(actionId, payload)
 * SolidStart server actions — POST /_server/:actionId
 */
exports.executeServerAction = function executeServerAction(actionId, payload) {
  if (actionId === 'loginAction') {
    var username = payload.username || '';
    if (!username) return Promise.resolve({ ok: false, status: 400, body: { error: 'username required' } });
    return Promise.resolve({
      ok: true,
      status: 200,
      body: {
        success: true,
        token: 'solid-jwt-' + Buffer.from(username).toString('base64'),
        user: { name: username, role: 'admin' }
      }
    });
  }
  if (actionId === 'createOrder') {
    var productId = payload.productId || 'P-001';
    var qty = payload.quantity || 1;
    return Promise.resolve({
      ok: true,
      status: 201,
      body: { success: true, orderId: 'ORD-88210', productId: productId, quantity: qty, total: 99 * qty }
    });
  }
  return Promise.resolve({ ok: false, status: 404, body: { error: 'Action not found: ' + actionId } });
};
