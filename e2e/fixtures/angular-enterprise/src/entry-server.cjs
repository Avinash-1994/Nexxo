'use strict';
/**
 * angular-enterprise/src/entry-server.cjs
 * Lunx SSR renderer for the Angular enterprise fixture.
 *
 * Produces a full HTML document whose <app-root> carries the ng-version
 * attribute Angular stamps onto the host element after bootstrap, plus a
 * realistic enterprise dashboard so the SSR payload has real content.
 */

const NG_VERSION = '17.3.0';

function renderPage(url) {
  const route = url || '/';
  const body = `
    <header class="app-toolbar">
      <span class="brand">Acme Enterprise Console</span>
      <nav>
        <a href="/">Dashboard</a>
        <a href="/reports">Reports</a>
        <a href="/settings">Settings</a>
      </nav>
      <span class="user-chip">signed in as admin@acme.com</span>
    </header>
    <main class="dashboard">
      <h1>Enterprise Dashboard</h1>
      <p class="subtitle">Server-rendered Angular application served through the Lunx dev server.</p>
      <section class="metrics">
        <div class="metric-card"><h2>Monthly Revenue</h2><p class="value">$1,284,900</p></div>
        <div class="metric-card"><h2>Active Seats</h2><p class="value">4,812</p></div>
        <div class="metric-card"><h2>Open Tickets</h2><p class="value">37</p></div>
        <div class="metric-card"><h2>Uptime (30d)</h2><p class="value">99.98%</p></div>
      </section>
      <section class="recent">
        <h2>Recent Activity</h2>
        <ul>
          <li>Invoice INV-4821 was paid by Globex Corporation.</li>
          <li>New team "Platform Engineering" provisioned with 24 seats.</li>
          <li>Security policy updated: SSO enforced for all members.</li>
        </ul>
      </section>
    </main>
    <footer class="app-footer">Route: ${route} · Angular ${NG_VERSION} · Lunx SSR</footer>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Acme Enterprise Console</title>
</head>
<body>
  <app-root ng-version="${NG_VERSION}">${body}</app-root>
  <script id="ng-state" type="application/json">{"route":"${route}","user":"admin@acme.com"}</script>
</body>
</html>`;
}

module.exports = { renderPage };
