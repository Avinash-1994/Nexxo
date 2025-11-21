import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import WebSocket, { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { PluginManager } from '../plugins/index.js';

export async function startDevServer(cfg: BuildConfig) {
  const pluginManager = new PluginManager();
  if (cfg.plugins) {
    cfg.plugins.forEach(p => pluginManager.register(p));
  }

  const port = cfg.port || 5173;
  const server = http.createServer(async (req, res) => {
    const url = req.url || '/';
    if (url === '/') {
      const p = path.join(cfg.root, 'public', 'index.html');
      try {
        const data = await fs.readFile(p);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch (e) {
        res.writeHead(404);
        res.end('index.html not found');
      }
      return;
    }

    if (url === '/@react-refresh') {
      const runtimePath = path.resolve(cfg.root, 'node_modules/react-refresh/cjs/react-refresh-runtime.development.js');
      try {
        const runtime = await fs.readFile(runtimePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(`
          const exports = {};
          ${runtime}
          export default exports;
        `);
      } catch (e) {
        res.writeHead(404);
        res.end('React Refresh runtime not found');
      }
      return;
    }

    // Try to serve from public first
    const publicPath = path.join(cfg.root, 'public', url);
    try {
      await fs.access(publicPath);
      const data = await fs.readFile(publicPath);
      // simple mime type guess
      const ext = path.extname(publicPath);
      const mime = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
      return;
    } catch (e) { }

    // Try to serve from root (src, node_modules, etc)
    // Remove query params
    const cleanUrl = url.split('?')[0];
    const filePath = path.join(cfg.root, cleanUrl);

    try {
      await fs.access(filePath);
      const ext = path.extname(filePath);

      if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs') {
        let raw = await fs.readFile(filePath, 'utf-8');

        // Plugin transform
        raw = await pluginManager.transform(raw, filePath);

        // Use Babel for React Refresh
        if (ext === '.tsx' || ext === '.jsx') {
          const babel = await import('@babel/core');
          const result = await babel.transformAsync(raw, {
            filename: filePath,
            presets: [
              ['@babel/preset-react', { runtime: 'automatic', development: true }],
              '@babel/preset-typescript'
            ],
            plugins: ['react-refresh/babel']
          });

          if (result && result.code) {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(result.code);
            return;
          }
        }

        const { transform } = await import('esbuild');
        const result = await transform(raw, {
          loader: ext.slice(1) as any,
          sourcemap: 'inline',
          format: 'esm',
          target: 'es2020',
        });

        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(result.code);
        return;
      }

      // Serve other files raw
      const data = await fs.readFile(filePath);
      res.writeHead(200);
      res.end(data);
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws: WebSocket) => {
    log.info('HMR client connected');
  });

  const watcher = chokidar.watch(cfg.root, { ignored: /node_modules|\.git/ });
  watcher.on('change', (file: string) => {
    log.info('File changed:', file);
    // Determine message type
    let type = 'reload';
    if (file.endsWith('.css')) {
      type = 'update-css';
    }

    // Normalize path for client (relative to root)
    const rel = '/' + path.relative(cfg.root, file);
    const msg = JSON.stringify({ type, path: rel });
    wss.clients.forEach((c: WebSocket) => c.send(msg));
  });

  server.listen(port, () => log.success('Dev server listening on', port));
}
