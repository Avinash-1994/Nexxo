export async function render({ url, cookies }) {
  let state = {};
  let html = '<h1>Not Found</h1>';
  if (url.includes('/dashboard')) {
    const isAuthed = cookies && cookies['session'];
    state = { userData: { name: 'SvelteKit Admin', email: 'admin@acme.com' }, authed: !!isAuthed };
    html = [
      '<main id="lunx-ssr-root">',
      '  <h1>Dashboard — SvelteKit SSR</h1>',
      '  <p>Welcome, SvelteKit Admin (admin@acme.com)</p>',
      '  <ul>',
      '    <li>userData.name: SvelteKit Admin</li>',
      '    <li>userData.email: admin@acme.com</li>',
      '    <li>session: active</li>',
      '  </ul>',
      '  <section class="dashboard-stats">',
      '    <div class="stat"><h2>Total Users</h2><p>1,248</p></div>',
      '    <div class="stat"><h2>Revenue</h2><p>$48,320</p></div>',
      '    <div class="stat"><h2>Active Sessions</h2><p>342</p></div>',
      '    <div class="stat"><h2>Uptime</h2><p>99.9%</p></div>',
      '  </section>',
      '</main>',
    ].join('\n');
  }
  return { html, head: '<title>Dashboard | Lunx SSR</title><meta name="description" content="SvelteKit SSR Dashboard">', state: JSON.stringify(state) };
}
