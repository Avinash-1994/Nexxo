'use strict';
exports.render = async function render({ url, cookies }) {
  var state = {};
  var html = '<h1>Not Found</h1>';
  if (url.includes('/dashboard')) {
    var isAuthed = cookies && cookies['session'];
    state = { userData: { name: 'SvelteKit Admin', email: 'admin@acme.com' }, authed: !!isAuthed };
    html = [
      '<main id="lunx-ssr-root">',
      '  <header class="dashboard-header">',
      '    <h1>Dashboard - SvelteKit SSR</h1>',
      '    <nav class="dashboard-nav">',
      '      <a href="/dashboard">Overview</a>',
      '      <a href="/dashboard/users">Users</a>',
      '      <a href="/dashboard/reports">Reports</a>',
      '      <a href="/settings">Settings</a>',
      '      <a href="/profile">Profile</a>',
      '    </nav>',
      '  </header>',
      '  <section class="dashboard-user">',
      '    <p class="welcome-msg">Welcome, SvelteKit Admin (admin@acme.com)</p>',
      '    <ul class="user-details">',
      '      <li>userData.name: SvelteKit Admin</li>',
      '      <li>userData.email: admin@acme.com</li>',
      '      <li>session: ' + (isAuthed ? 'active' : 'none') + '</li>',
      '      <li>role: administrator</li>',
      '      <li>last-login: 2026-04-27T16:00:00Z</li>',
      '    </ul>',
      '  </section>',
      '  <section class="dashboard-stats">',
      '    <div class="stat-card"><h2>Total Users</h2><p class="stat-value">1,248</p><p class="stat-change">+12% this month</p></div>',
      '    <div class="stat-card"><h2>Revenue</h2><p class="stat-value">$48,320</p><p class="stat-change">+8.4% vs last month</p></div>',
      '    <div class="stat-card"><h2>Active Sessions</h2><p class="stat-value">342</p><p class="stat-change">Live count</p></div>',
      '    <div class="stat-card"><h2>Uptime</h2><p class="stat-value">99.9%</p><p class="stat-change">Last 30 days</p></div>',
      '  </section>',
      '  <section class="dashboard-recent">',
      '    <h2>Recent Activity</h2>',
      '    <ul>',
      '      <li><time>16:01</time> User alice@example.com logged in</li>',
      '      <li><time>15:58</time> New order #8821 placed ($299)</li>',
      '      <li><time>15:45</time> Deployment to production succeeded</li>',
      '      <li><time>15:30</time> Cache invalidated for /blog routes</li>',
      '    </ul>',
      '  </section>',
      '  <footer class="dashboard-footer">',
      '    <p>Powered by Lunx SSR - SvelteKit Adapter v1.0.0</p>',
      '  </footer>',
      '</main>'
    ].join('\n');
  }
  return {
    html: html,
    head: '<title>Dashboard | Lunx SSR</title><meta name="description" content="SvelteKit SSR Dashboard"><meta name="robots" content="noindex">',
    state: JSON.stringify(state)
  };
};
