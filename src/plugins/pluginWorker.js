const { parentPort } = require('worker_threads');
const path = require('path');

// Simple plugin loader: load plugin from plugins/samplePlugin.js relative to project root
const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.js');
let plugin = null;
try {
  plugin = require(pluginPath);
} catch (e) {
  // no plugin available; plugin should export transform(code, id) => code
}

parentPort.on('message', async (msg) => {
  if (msg.type === 'transform') {
    try {
      if (plugin && typeof plugin.transform === 'function') {
        const out = await plugin.transform(msg.code, msg.id);
        parentPort.postMessage({ type: 'result', id: msg.id, code: out });
      } else {
        // Echo back if no plugin
        parentPort.postMessage({ type: 'result', id: msg.id, code: msg.code });
      }
    } catch (err) {
      parentPort.postMessage({ type: 'error', id: msg.id, error: String(err) });
    }
  }
});
