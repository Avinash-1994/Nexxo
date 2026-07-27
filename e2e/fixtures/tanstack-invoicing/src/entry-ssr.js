import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function render({ url }) {
  const result = await server.renderRoute(url || '/invoices/INV-123', { root: path.resolve(__dirname, '..') });
  const html = result?.html || result?.indexHtml || '';
  return { html, head: '' };
}
