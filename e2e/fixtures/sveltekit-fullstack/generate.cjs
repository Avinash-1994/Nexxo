const fs = require('fs');
const path = require('path');

const fixtureDir = path.join(__dirname, 'src', 'routes');

function ensureDir(subpath) {
  const dir = path.join(fixtureDir, subpath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Ensure all dirs
[
  '', 'login', 'dashboard', 'blog', 'blog/[slug]', 'products', 'products/[id]',
  'settings', 'profile', 'checkout', 'orders', 'api/users', 'api/posts', 'api/auth',
  'admin', 'admin/users', 'admin/reports', 'notifications', 'search', '404', 'team'
].forEach(ensureDir);

const write = (subpath, content) => fs.writeFileSync(path.join(fixtureDir, subpath), content);

// 1. root
write('+page.svelte', '<h1>Home</h1>');
write('+layout.svelte', '<slot/>');

// 2. login
write('login/+page.svelte', '<form method="POST"><button>Login</button></form>');
write('login/+page.server.ts', 'export const actions = { default: async ({ request }) => { return { success: true, user: "test_user" }; } };');

// 3. dashboard
write('dashboard/+page.svelte', '<h1>Dashboard</h1>');
write('dashboard/+page.server.ts', 'export async function load({ cookies }) { if (!cookies.get("session")) { const e=new Error("Redir"); e.status=302; e.location="/login"; throw e; } return { userData: { name: "SvelteKit Admin", email: "admin@acme.com" } }; }');
write('dashboard/+layout.server.ts', 'export function load() { return {}; }');

// 4. blog
write('blog/+page.svelte', '<h1>Blog</h1>');
write('blog/+page.server.ts', 'export function load() { return { posts: [] }; }');

// 5. blog/[slug]
write('blog/[slug]/+page.svelte', '<h1>Post</h1>');
write('blog/[slug]/+page.server.ts', 'export function load() { return { post: {} }; }');

// 6. products
write('products/+page.svelte', '<h1>Products</h1>');

// 7. products/[id]
write('products/[id]/+page.svelte', '<h1>Product ID</h1>');

// 8. others
write('settings/+page.svelte', '<h1>Settings</h1>');
write('profile/+page.svelte', '<h1>Profile</h1>');
write('checkout/+page.svelte', '<h1>Checkout</h1>');
write('orders/+page.svelte', '<h1>Orders</h1>');

// 9. API
write('api/users/+server.ts', 'export async function GET() { return new Response(JSON.stringify({ users: ["admin", "guest"] }), {status: 200}); }');
write('api/posts/+server.ts', 'export async function GET() { return new Response("[]"); }');
write('api/auth/+server.ts', 'export async function POST() { return new Response("ok"); }');

// 10. admin
write('admin/+page.svelte', '<h1>Admin</h1>');
write('admin/users/+page.svelte', '<h1>Admin Users</h1>');
write('admin/reports/+page.svelte', '<h1>Admin Reports</h1>');
write('admin/+layout.server.ts', 'export function load() {}');
write('team/+page.svelte', '<h1>Team</h1>');

// 11. notifications, search, 404
write('notifications/+page.svelte', '<h1>Notifs</h1>');
write('search/+page.svelte', '<h1>Search</h1>');
write('404/+error.svelte', '<h1>404</h1>');

// 12. Dummy routes to reach 25
['about', 'contact', 'terms', 'privacy', 'help', 'faq', 'careers', 'press'].forEach(route => {
  ensureDir(route);
  write(route + '/+page.svelte', '<h1>' + route + '</h1>');
});

// Write package.json and index.html to allow Lunx CLI build to succeed
fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify({
  name: "sveltekit-fullstack",
  version: "1.0.0",
  type: "module",
  dependencies: { "svelte": "^4.0.0" }
}, null, 2));

fs.writeFileSync(path.join(__dirname, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
<body>
  <div id="app"></div>
  <script type="module" src="/src/routes/+page.svelte"></script>
</body>
</html>
`);

// Add lunx.config.ts to enable SSR preset
fs.writeFileSync(path.join(__dirname, 'lunx.config.ts'), `
export default {
  preset: 'ssr',
  entry: ['src/entry-server.js']
};
`);

// Add entry-server.cjs (CommonJS so minimal server can require() it regardless of ESM project type)
// Written with explicit string concatenation to avoid template literal newline escaping issues
var ssrLines = [
  "'use strict';",
  "exports.render = async function render({ url, cookies }) {",
  "  var state = {};",
  "  var html = '<h1>Not Found</h1>';",
  "  if (url.includes('/dashboard')) {",
  "    var isAuthed = cookies && cookies['session'];",
  "    state = { userData: { name: 'SvelteKit Admin', email: 'admin@acme.com' }, authed: !!isAuthed };",
  "    html = [",
  "      '<main id=\"lunx-ssr-root\">',",
  "      '  <h1>Dashboard - SvelteKit SSR</h1>',",
  "      '  <p>Welcome, SvelteKit Admin (admin@acme.com)</p>',",
  "      '  <ul>',",
  "      '    <li>userData.name: SvelteKit Admin</li>',",
  "      '    <li>userData.email: admin@acme.com</li>',",
  "      '    <li>session: ' + (isAuthed ? 'active' : 'none') + '</li>',",
  "      '  </ul>',",
  "      '  <section class=\"dashboard-stats\">',",
  "      '    <div class=\"stat\"><h2>Total Users</h2><p>1,248</p></div>',",
  "      '    <div class=\"stat\"><h2>Revenue</h2><p>$48,320</p></div>',",
  "      '    <div class=\"stat\"><h2>Active Sessions</h2><p>342</p></div>',",
  "      '    <div class=\"stat\"><h2>Uptime</h2><p>99.9%</p></div>',",
  "      '  </section>',",
  "      '</main>'",
  "    ].join('\\n');",
  "  }",
  "  return {",
  "    html: html,",
  "    head: '<title>Dashboard | Lunx SSR</title><meta name=\"description\" content=\"SvelteKit SSR Dashboard\">',",
  "    state: JSON.stringify(state)",
  "  };",
  "};",
  ""
];
fs.writeFileSync(path.join(__dirname, 'src', 'entry-server.cjs'), ssrLines.join('\n'));
