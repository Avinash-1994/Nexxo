import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url }) {
  const result = server.renderPage(url || '/');
  const html = result?.html || result || '';
  return { html, head: '' };
}
