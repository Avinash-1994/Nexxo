import { PluginSandbox } from './sandbox.js';

async function run() {
  const sb = new PluginSandbox(2);
  try {
  console.log('[test] running sandbox transform');
  const src = `console.log('hello');\n`;
  const out = await sb.runTransform(src, 'test-1');
  console.log('[test] transform output:\n', out);
  } finally {
    sb.stop();
  }
}

run().catch((e) => console.error(e));
