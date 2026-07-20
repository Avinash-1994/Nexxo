import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url }) {
  const html = await server.renderSSR(url || '/docs/guide');
  return { html: html || '', head: '' };
}
