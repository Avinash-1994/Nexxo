import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url, root }) {
  const result = server.renderPage(url || '/blog', { root: root || process.cwd() });
  const html = result?.html || result || '';
  return { html, head: '' };
}
