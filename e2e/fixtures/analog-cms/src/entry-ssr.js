import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url }) {
  const actualUrl = url || '/blog/my-post';
  const slug = actualUrl.split('/').pop() || 'my-post';
  const result = server.renderApplication(actualUrl, { params: { slug } });
  const html = result?.html || result || '';
  return { html, head: '' };
}
