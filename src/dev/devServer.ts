import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { PluginManager } from '../plugins/index.js';
import { PluginSandbox } from '../core/sandbox.js';

import { NativeWorker } from '../native/index.js';

import { HMRThrottle } from './hmrThrottle.js';
import { ConfigWatcher } from './configWatcher.js';
import { StatusHandler } from './statusHandler.js';

/**
 * Rewrite bare module imports to node_modules paths
 * Converts: import React from 'react'
 * To: import React from '/node_modules/react/index.js'
 */
function rewriteImports(code: string, rootDir: string, preBundledDeps?: Map<string, string>): string {
  // Rewrite bare module imports to use pre-bundled versions or node_modules
  code = code.replace(
    /from\s+['"]((?![.\/])(?!https?:\/\/)[^'"]+)['"]/g,
    (match, specifier) => {
      // Skip if already a URL
      if (specifier.startsWith('http://') || specifier.startsWith('https://')) {
        return match;
      }

      // Rewrite to node_modules path (for non-React packages)
      // The browser will request /node_modules/package/...
      // and we'll serve it from the actual node_modules directory

      // Use pre-bundled version if available
      if (preBundledDeps && preBundledDeps.has(specifier)) {
        return `from '${preBundledDeps.get(specifier)}?v=${Date.now()}'`;
      }

      return `from '/node_modules/${specifier}'`;
    }
  );

  // Matches: import './style.css' or import styles from './style.module.css'
  code = code.replace(
    /import\s+['"]([^'"]+\.css)['"]/g,
    (match, path) => `import '${path}?import'`
  );

  // Matches: import data from './data.json'
  code = code.replace(
    /from\s+['"]([^'"]+\.json)['"]/g,
    (match, path) => `from '${path}?import'`
  );

  return code;
}

export async function startDevServer(cfg: BuildConfig) {
  // 1. Load Environment Variables
  const { config: loadEnv } = await import('dotenv');
  loadEnv({ path: path.join(cfg.root, '.env') });
  loadEnv({ path: path.join(cfg.root, '.env.local') });

  // Filter public env vars
  const publicEnv = Object.keys(process.env)
    .filter(key => key.startsWith('NEXTGEN_') || key.startsWith('PUBLIC_') || key === 'NODE_ENV')
    .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {
      NODE_ENV: process.env.NODE_ENV || 'development'
    });

  log.info('Loaded Environment Variables', { category: 'server', count: Object.keys(publicEnv).length });

  // 2. Detect Framework (Universal Support)
  const { FrameworkDetector } = await import('../core/framework-detector.js');
  const frameworkDetector = new FrameworkDetector(cfg.root);
  const detectedFrameworks = await frameworkDetector.detect();
  const primaryFramework = detectedFrameworks[0]?.name || 'vanilla';

  log.info(`Detected framework: ${primaryFramework}`, {
    category: 'server',
    version: detectedFrameworks[0]?.version,
    allFrameworks: detectedFrameworks.map(f => f.name).join(', ')
  });

  // 3. Initialize Universal Transformer
  const { UniversalTransformer } = await import('../core/universal-transformer.js');
  const universalTransformer = new UniversalTransformer(cfg.root);

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

  // Initialize Dependency Pre-Bundler
  const { DependencyPreBundler } = await import('./preBundler.js');
  const preBundler = new DependencyPreBundler(cfg.root);

  // Scan and pre-bundle dependencies on server start
  log.info('Scanning dependencies for pre-bundling...');
  const entryPoint = path.join(cfg.root, 'public', 'index.html');
  let preBundledDeps = new Map<string, string>();

  try {
    // 1. Load package.json dependencies
    let pkgDeps: string[] = [];
    try {
      const pkgPath = path.join(cfg.root, 'package.json');
      const pkgContent = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(pkgContent);
      pkgDeps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {})
      ];
    } catch (e) {
      log.warn('Could not read package.json dependencies', { category: 'server' });
    }

    // 2. Framework Defaults
    const frameworkDeps: Record<string, string[]> = {
      react: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom', '@remix-run/router'],
      next: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom'],
      remix: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom'],
      preact: ['preact', 'preact/hooks'],
      vue: ['vue'],
      nuxt: ['vue'],
      svelte: ['svelte'],
      solid: ['solid-js'],
    };

    const defaultDeps = frameworkDeps[primaryFramework] || [];

    // 3. User Config (prebundle)
    const prebundleConfig = cfg.prebundle || { enabled: true, include: [], exclude: [] };

    if (prebundleConfig.enabled !== false) {
      // Merge sources
      let depsToBundle = new Set([
        ...defaultDeps,
        ...(prebundleConfig.include || [])
      ]);

      // Filter 1: Must verify existence in node_modules (Avoid resolve errors)
      const validDeps = new Set<string>();
      // Use require.resolve to check existence, but be careful with exports
      for (const dep of depsToBundle) {
        // Exclude specific overrides
        if (prebundleConfig.exclude?.includes(dep)) continue;

        // Verify existence
        try {
          // Check if package.json or dependency exists in node_modules
          // We can't always use require.resolve for sub-paths (like react/jsx-runtime) comfortably without conditions
          // So we check if the ROOT package is installed
          const rootPkg = dep.startsWith('@') ? dep.split('/').slice(0, 2).join('/') : dep.split('/')[0];

          // Only strict check if it's NOT in package.json? 
          // Ideally we pre-bundle only what IS available.
          // Check if root package is in pkgDeps (direct dependency) OR we can resolve it
          const isDirectDep = pkgDeps.includes(rootPkg);

          if (isDirectDep) {
            validDeps.add(dep);
          } else {
            // Try to resolve it to ensure it exists (transitive deps like @remix-run/router)
            try {
              require.resolve(dep, { paths: [cfg.root] });
              validDeps.add(dep);
            } catch (e) {
              // Try resolving package.json of the dep
              try {
                const pkgJsonPath = path.join(cfg.root, 'node_modules', rootPkg, 'package.json');
                await fs.access(pkgJsonPath);
                validDeps.add(dep);
              } catch { }
            }
          }
        } catch (e) {
          // Skip missing dep
        }
      }

      if (validDeps.size > 0) {
        // 4. Pass to PreBundler
        preBundledDeps = await preBundler.preBundleDependencies(Array.from(validDeps));
        log.info('Dependencies pre-bundled successfully', { count: preBundledDeps.size });
      }
    }
  } catch (error: any) {
    log.warn('Failed to pre-bundle some dependencies:', error.message);
  }

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
        let data = await fs.readFile(p, 'utf-8');

        // Inject only client runtime (no React Refresh for now - simplify)
        const clientScript = `
    <script type="module" src="/@urja/client"></script>
        `;

        data = data.replace('<head>', '<head>' + clientScript);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch (e) {
        res.writeHead(404);
        res.end('index.html not found');
      }
      return;
    }

    if (url === '/favicon.ico') {
      const p = path.join(cfg.root, 'public', 'favicon.ico');
      try {
        const data = await fs.readFile(p);
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(data);
      } catch (e) {
        // Serve empty response or default icon to avoid 404/500 noise
        res.writeHead(204);
        res.end();
      }
      return;
    }

    // Serve pre-bundled dependencies
    if (url.startsWith('/@urja-deps/')) {
      // Strip query parameters
      const cleanUrl = url.split('?')[0];
      const depFile = cleanUrl.replace('/@urja-deps/', '');
      const depPath = path.join(cfg.root, 'node_modules', '.urja', depFile);
      try {
        const content = await fs.readFile(depPath, 'utf-8');
        res.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
      } catch (error) {
        log.error(`Failed to serve pre-bundled dep: ${depFile}`, { error });
        res.writeHead(404);
        res.end(`Pre-bundled dependency not found: ${depFile}`);
      }
      return;
    }

    if (url === '/@react-refresh') {
      try {
        let runtimePath;
        try {
          runtimePath = require.resolve('react-refresh/cjs/react-refresh-runtime.development.js', { paths: [cfg.root] });
        } catch (e) {
          // Fallback to manual path
          runtimePath = path.join(cfg.root, 'node_modules/react-refresh/cjs/react-refresh-runtime.development.js');
        }

        const runtime = await fs.readFile(runtimePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(`
          const exports = {};
          ${runtime}
          export default exports;
        `);
      } catch (e) {
        log.error('Failed to resolve React Refresh', { category: 'server', error: e });
        res.writeHead(404);
        res.end('React Refresh runtime not found');
      }
      return;
    }



    if (url === '/@urja/client') {
      const clientPath = path.resolve(__dirname, '../runtime/client.js');
      try {
        const client = await fs.readFile(clientPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(client);
      } catch (e) {
        res.writeHead(404);
        res.end('Urja client runtime not found');
      }
      return;
    }

    if (url === '/@urja/error-overlay.js') {
      const overlayPath = path.resolve(__dirname, '../runtime/error-overlay.js');
      try {
        const overlay = await fs.readFile(overlayPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(overlay);
      } catch (e) {
        res.writeHead(404);
        res.end('Urja error overlay not found');
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

    // Serve from node_modules
    if (url.startsWith('/node_modules/')) {
      let modulePath = path.join(cfg.root, url);

      try {
        // Handle potential directory or missing extension
        let stats;
        try {
          stats = await fs.stat(modulePath);
        } catch (e) {
          // Try appending .js
          if (!modulePath.endsWith('.js')) {
            modulePath += '.js';
            stats = await fs.stat(modulePath);
          } else {
            throw e;
          }
        }

        // If directory, resolve entry point
        if (stats.isDirectory()) {
          const pkgPath = path.join(modulePath, 'package.json');
          try {
            const pkgContent = await fs.readFile(pkgPath, 'utf-8');
            const pkg = JSON.parse(pkgContent);
            // Prefer module (ESM) > main > index.js
            let entry = pkg.module || pkg.main || 'index.js';
            modulePath = path.join(modulePath, entry);
          } catch (e) {
            // No package.json, try index.js
            modulePath = path.join(modulePath, 'index.js');
          }
        }

        const ext = path.extname(modulePath);

        // Transform JS files from node_modules using esbuild
        if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
          const { build } = await import('esbuild');

          try {
            // Use esbuild to bundle/transform to ESM
            const result = await build({
              entryPoints: [modulePath],
              bundle: true, // Bundle dependencies of this module
              format: 'esm',
              platform: 'browser',
              write: false,
              define: {
                'process.env.NODE_ENV': '"development"',
                'global': 'window'
              },
              plugins: [{
                name: 'node-modules-resolver',
                setup(build) {
                  // Mark other node_modules as external to avoid bundling EVERYTHING
                  // We want to bundle internal deps of the package, but keep peer deps external
                  // This is a simplified approach
                  build.onResolve({ filter: /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ }, args => {
                    if (args.path !== modulePath && !args.path.startsWith('.')) {
                      // Bundle scheduler to avoid dynamic require issues in react-dom
                      if (args.path === 'scheduler') return null;

                      // Bundle react if imported by react-dom or jsx-dev-runtime (to avoid dynamic require issues)
                      if (args.path === 'react' && (modulePath.includes('react-dom') || modulePath.includes('jsx-dev-runtime'))) return null;

                      // Bundle react-dom if imported by react-dom/client
                      if (args.path === 'react-dom' && modulePath.includes('react-dom/client')) return null;

                      return { path: `/node_modules/${args.path}`, external: true };
                    }
                    return null;
                  });
                }
              }]
            });

            const code = result.outputFiles[0].text;
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(code);
            return;
          } catch (e) {
            log.error(`Failed to transform module: ${url}`, { category: 'server', error: e });
            // Fallback to raw file if build fails
          }
        }

        let data = await fs.readFile(modulePath, 'utf-8');

        const mime = ext === '.js' || ext === '.mjs' ? 'application/javascript' :
          ext === '.css' ? 'text/css' : 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
        return;
      } catch (e) {
        log.error(`Failed to serve module: ${url}`, { category: 'server', error: e });
        res.writeHead(404);
        res.end('Module not found');
        return;
      }
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
    let filePath = path.join(cfg.root, cleanUrl);

    // Try to resolve extension if file doesn't exist
    try {
      await fs.access(filePath);
    } catch (e) {
      // Try extensions
      const extensions = ['.jsx', '.tsx', '.js', '.ts', '.mjs'];
      let found = false;
      for (const ext of extensions) {
        if (await fs.access(filePath + ext).then(() => true).catch(() => false)) {
          filePath += ext;
          found = true;
          break;
        }
      }
      if (!found) {
        // If still not found, let it fall through to 404 handler (or next logic)
      }
    }

    try {
      await fs.access(filePath);
      const ext = path.extname(filePath);

      if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs' || ext === '.vue' || ext === '.svelte' || ext === '.astro') {
        let raw = await fs.readFile(filePath, 'utf-8');

        // Native Transform (Caching + Graph) - only for JS/TS files
        if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs') {
          try {
            raw = nativeWorker.transformSync(raw, filePath);
          } catch (e) {
            log.error('NativeWorker error', { category: 'build', error: e });
            // Continue with raw content
          }
        }

        // Plugin transform (JS plugins like Tailwind)
        raw = await pluginManager.transform(raw, filePath);

        // Inject Env Vars (only for JS/TS files)
        if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs') {
          raw = `
            if (!window.process) window.process = { env: {} };
            Object.assign(window.process.env, ${JSON.stringify(publicEnv)});
            ${raw}
          `;
        }

        // Use Universal Transformer (supports all frameworks)
        try {
          const transformResult = await universalTransformer.transform({
            filePath,
            code: raw,
            framework: primaryFramework,
            root: cfg.root,
            isDev: true
          });

          // Rewrite imports after transformation
          let code = rewriteImports(transformResult.code, cfg.root, preBundledDeps);

          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(code);
          return;
        } catch (error: any) {
          log.error(`Universal transformer failed for ${filePath}:`, error.message);
          // Fallback to esbuild
          const { transform } = await import('esbuild');
          const result = await transform(raw, {
            loader: ext.slice(1) as any,
            sourcemap: 'inline',
            format: 'esm',
            target: 'es2020',
          });

          let code = rewriteImports(result.code, cfg.root, preBundledDeps);
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(code);
          return;
        }
      }

      if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less' || ext === '.styl') {
        let raw = await fs.readFile(filePath, 'utf-8');
        raw = await pluginManager.transform(raw, filePath);

        // Check if imported as module
        if (url.includes('?import')) {
          const jsModule = `
            const style = document.createElement('style');
            style.textContent = ${JSON.stringify(raw)};
            document.head.appendChild(style);
            export default ${JSON.stringify(raw)};
          `;
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(jsModule);
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(raw);
        return;
      }

      if (ext === '.json') {
        const raw = await fs.readFile(filePath, 'utf-8');
        if (url.includes('?import')) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(`export default ${raw};`);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
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
    // Clear transform cache for changed file
    universalTransformer.clearCache(file);

    // Native Invalidation & Rebuild
    nativeWorker.invalidate(file);
    const affected = nativeWorker.rebuild(file);

    if (affected.length > 0) {
      log.info(`Rebuild affected ${affected.length} files`, { category: 'build', duration: 10 }); // Mock duration
    }

    affected.forEach((affectedFile: string) => {
      // Clear cache for affected files too
      universalTransformer.clearCache(affectedFile);

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
      (async () => {
        const { spawn } = await import('child_process');
        const isWin = process.platform === 'win32';
        const cmd = isWin ? 'cmd' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
        const args = isWin ? ['/c', 'start', '', url] : [url];
        try {
          const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
          child.unref();
        } catch { }
      })();
    }
  });
}
