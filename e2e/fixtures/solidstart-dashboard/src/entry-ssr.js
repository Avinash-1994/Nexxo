import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./entry-server.cjs');

export async function render({ url }) {
  const chunks = [];
  const stream = server.renderToStream({ url: url || '/', cookies: { session: 'test' } });
  return new Promise((resolve, reject) => {
    stream.on('data', c => chunks.push(c));
    stream.on('end', () => resolve({ html: chunks.join('') || '', head: '' }));
    stream.on('error', reject);
  });
}
