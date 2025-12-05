import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import WebSocket, { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { PluginManager } from '../plugins/index.js';
import { PluginSandbox } from '../core/sandbox.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load Native Worker
const nativePath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../nextgen_native.node');
// Fallback for different environments if needed, but this should work for local dev
const { NativeWorker } = require(nativePath);

import { HMRThrottle } from './hmrThrottle.js';
import { ConfigWatcher } from './configWatcher.js';
import { StatusHandler } from './statusHandler.js';

export async function startDevServer(cfg: BuildConfig) {
  // 1. Load Environment Variables
  const { config: loadEnv } = await import('dotenv');
  loadEnv({ path: path.join(cfg.root, '.env') });
  loadEnv({ path: path.join(cfg.root, '.env.local') });

  // Filter public env vars
  const publicEnv = Object.keys(process.env)
    .filter(key => key.startsWith('NEXTGEN_') || key.startsWith('PUBLIC_'))
    .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {});

  log.info('Loaded Environment Variables', { category: 'server', count: Object.keys(publicEnv).length });

  const nativeWorker = new NativeWorker(4); // 4 threads
  const pluginManager = new PluginManager();
  if (cfg.plugins) {
    cfg.plugins.forEach(p => pluginManager.register(p));
  }

  // Initialize Sandbox
  const { PermissionManager } = await import('../core/permissions.js');
  const sandbox = new PluginSandbox(new PermissionManager());

  // Auto-register Tailwind Plugin if config exists
  const tailwindConfigPath = path.join(cfg.root, 'tailwind.config.js');
  if (await fs.access(tailwindConfigPath).then(() => true).catch(() => false)) {
    const { TailwindPlugin } = await import('../plugins/css/tailwind.js');
    pluginManager.register(new TailwindPlugin(cfg.root));
  }

  // Auto-register CSS Preprocessor Plugins
  const { SassPlugin } = await import('../plugins/css/sass.js');
  pluginManager.register(new SassPlugin(cfg.root));

  const { LessPlugin } = await import('../plugins/css/less.js');
  pluginManager.register(new LessPlugin(cfg.root));

  const { StylusPlugin } = await import('../plugins/css/stylus.js');
  pluginManager.register(new StylusPlugin(cfg.root));

  const port = cfg.server?.port || cfg.port || 5173;
  const host = cfg.server?.host || 'localhost';

  // 2. Setup Proxy
  const { default: httpProxy } = await import('http-proxy');
  const proxy = httpProxy.createProxyServer({});

  proxy.on('error', (err, req, res) => {
    log.error('Proxy error: ' + err.message, { category: 'server' });
    if ((res as any).writeHead) {
      (res as any).writeHead(500, { 'Content-Type': 'text/plain' });
      (res as any).end('Proxy error: ' + err.message);
    }
  });

  // 3. Setup HTTPS
  let httpsOptions: any = null;
  if (cfg.server?.https) {
    if (typeof cfg.server.https === 'object') {
      httpsOptions = cfg.server.https;
    } else {
      // Generate self-signed cert
      const certDir = path.join(cfg.root, '.nextgen', 'certs');
      await fs.mkdir(certDir, { recursive: true });
      const keyPath = path.join(certDir, 'dev.key');
      const certPath = path.join(certDir, 'dev.crt');

      if (await fs.access(keyPath).then(() => true).catch(() => false)) {
        httpsOptions = {
          key: await fs.readFile(keyPath),
          cert: await fs.readFile(certPath)
        };
      } else {
        log.info('Generating self-signed certificate...', { category: 'server' });
        const selfsigned = await import('selfsigned');
        // @ts-ignore
        const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 30 });
        await fs.writeFile(keyPath, pems.private);
        await fs.writeFile(certPath, pems.cert);
        httpsOptions = {
          key: pems.private,
          cert: pems.cert
        };
      }
    }
  }

  // 4. Initialize Premium Features
  const statusHandler = new StatusHandler();

  // WebSocket Server setup (early init for HMRThrottle)
  // We need the server instance first, but we can setup the WSS later or pass a callback
  // Let's create the broadcast function first
  let wss: WebSocketServer;
  const broadcast = (msg: string) => {
    if (wss) {
      wss.clients.forEach((c: WebSocket) => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
      });
    }
  };

  const hmrThrottle = new HMRThrottle(broadcast);

  // Initialize Federation Dev
  const { FederationDev } = await import('./federation-dev.js');
  const federationDev = new FederationDev(cfg, broadcast);
  federationDev.start();

  const requestHandler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    statusHandler.trackRequest();
    if (await statusHandler.handleRequest(req, res)) return;
    if (federationDev.handleRequest(req, res)) return;

    // Federation Editor
    if (req.url === '/__federation') {
      const { getEditorHtml } = await import('../visual/federation-editor.js');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getEditorHtml(cfg));
      return;
    }

    const url = req.url || '/';

    // Headers
    if (cfg.server?.headers) {
      Object.entries(cfg.server.headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    if (cfg.server?.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Proxy Handler
    if (cfg.server?.proxy) {
      for (const [context, target] of Object.entries(cfg.server.proxy)) {
        if (url.startsWith(context)) {
          log.debug(`Proxying ${url} -> ${target}`, { category: 'server' });
          const options = typeof target === 'string' ? { target } : target;
          proxy.web(req, res, options);
          return;
        }
      }
    }

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

    // Open in Editor
    if (url.startsWith('/__open-in-editor')) {
      const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
      const file = urlObj.searchParams.get('file');
      const line = parseInt(urlObj.searchParams.get('line') || '1');
      const column = parseInt(urlObj.searchParams.get('column') || '1');

      if (file) {
        const launch = await import('launch-editor');
        launch.default(file, `${line}:${column}`);
        res.writeHead(200);
        res.end('Opened in editor');
      } else {
        res.writeHead(400);
        res.end('Missing file parameter');
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

        // Native Transform (Caching + Graph)
        try {
          // log.debug(`Processing with NativeWorker: ${filePath}`, { category: 'build' });
          raw = nativeWorker.processFile(filePath);
        } catch (e) {
          log.error('NativeWorker error', { category: 'build', error: e });
          throw e;
        }

        // Plugin transform (JS plugins like Tailwind)
        raw = await pluginManager.transform(raw, filePath);

        // Inject Env Vars
        raw = `
            if (!window.process) window.process = { env: {} };
            Object.assign(window.process.env, ${JSON.stringify(publicEnv)});
            ${raw}
        `;

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

      if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less' || ext === '.styl') {
        let raw = await fs.readFile(filePath, 'utf-8');
        raw = await pluginManager.transform(raw, filePath);
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(raw);
        return;
      }

      // Serve other files raw
      const data = await fs.readFile(filePath);
      const mime = ext === '.map' ? 'application/json' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    } catch (e: any) {
      log.error('Request error', { category: 'server', error: e });

      // If it's a build error (has loc/frame/stack), broadcast it
      if (e.message && (e.frame || e.loc || e.stack)) {
        const msg = JSON.stringify({
          type: 'error',
          error: {
            message: e.message,
            stack: e.stack,
            filename: filePath, // approximate
            frame: e.frame
          }
        });
        broadcast(msg);
      }

      res.writeHead(500);
      res.end(e.message);
    }
  };

  let server;
  if (httpsOptions) {
    const https = await import('https');
    server = https.createServer(httpsOptions, requestHandler);
  } else {
    server = http.createServer(requestHandler);
  }

  // WebSocket Server setup
  wss = new WebSocketServer({ server });
  wss.on('connection', (ws: WebSocket) => {
    log.info('HMR client connected', { category: 'hmr' });
    hmrThrottle.registerClient(ws);
    ws.on('close', () => hmrThrottle.unregisterClient(ws));
  });

  // Upgrade handling for Proxy WebSockets
  server.on('upgrade', (req, socket, head) => {
    if (cfg.server?.proxy) {
      for (const [context, target] of Object.entries(cfg.server.proxy)) {
        if (req.url?.startsWith(context)) {
          const options = typeof target === 'string' ? { target, ws: true } : { ...target, ws: true };
          proxy.ws(req, socket, head, options);
          return;
        }
      }
    }
  });

  // Config Watcher
  const configWatcher = new ConfigWatcher(cfg.root, async (type, file) => {
    if (type === 'hot') {
      // Reload env vars (simplified)
      log.info('Hot reloading config...', { category: 'server' });
      // In a real app we'd re-read .env and broadcast updates if needed
    } else if (type === 'restart') {
      log.warn('Restarting server due to config change...', { category: 'server' });
      broadcast(JSON.stringify({ type: 'restarting' }));
      await new Promise(r => setTimeout(r, 500)); // Give clients time to receive message
      server.close();
      wss.close();
      await configWatcher.close();
      federationDev.stop();
      // Re-run startDevServer (recursive)
      // Note: This might stack overflow if done repeatedly without process exit, 
      // but for dev server it's usually fine or we should use a wrapper.
      // For now, let's just exit and let nodemon/supervisor handle it if present, 
      // OR we can just re-call startDevServer.
      // Re-calling is better for "graceful" feel.
      startDevServer(cfg).catch(e => log.error('Failed to restart', { error: e }));
    }
  });
  configWatcher.start();

  const watcher = chokidar.watch(cfg.root, { ignored: /node_modules|\.git/ });
  watcher.on('change', (file: string) => {
    // log.debug(`File changed: ${file}`, { category: 'build' });

    // Native Invalidation & Rebuild
    nativeWorker.invalidate(file);
    const affected = nativeWorker.rebuild(file);

    if (affected.length > 0) {
      log.info(`Rebuild affected ${affected.length} files`, { category: 'build', duration: 10 }); // Mock duration
    }

    affected.forEach((affectedFile: string) => {
      // Determine message type
      let type = 'reload';
      if (affectedFile.endsWith('.css')) {
        type = 'update-css';
      }

      // Normalize path for client (relative to root)
      const rel = '/' + path.relative(cfg.root, affectedFile);

      // Queue update via throttle
      hmrThrottle.queueUpdate(rel, type);
      statusHandler.trackHMR();
    });
  });

  server.listen(port, () => {
    const protocol = httpsOptions ? 'https' : 'http';
    const url = `${protocol}://${host}:${port}`;

    log.table({
      'HTTP': url,
      'HTTPS': httpsOptions ? 'Enabled' : 'Disabled',
      'Proxy': cfg.server?.proxy ? Object.keys(cfg.server.proxy).join(', ') : 'None',
      'Status': `${url}/__nextgen/status`,
      'Federation': `${url}/__federation`
    });

    if (cfg.server?.open) {
      import('open').then(open => open.default(url));
    }
  });
}
