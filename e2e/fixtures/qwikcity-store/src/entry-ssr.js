import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url }) {
  const html = server.renderToString({ url });
  return { html: html || '', head: '' };
}
