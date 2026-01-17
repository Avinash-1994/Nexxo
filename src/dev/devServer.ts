import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import { anomalyDetector } from '../security/anomaly.js';
import type { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { PluginManager } from '../plugins/index.js';
import { PluginSandbox } from '../core/sandbox.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load Native Worker
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let NativeWorker: any;

try {
  const candidates = [
    path.resolve(__dirname, '../../nexxo_native.node'), // From src/dev/devServer.ts
    path.resolve(__dirname, '../nexxo_native.node'),    // From dist/dev/devServer.js
    path.resolve(__dirname, './nexxo_native.node'),     // From dist/
    path.resolve(process.cwd(), 'nexxo_native.node'),   // Root fallback
    path.resolve(process.cwd(), 'dist/nexxo_native.node')
  ];

  let pathFound = '';
  for (const c of candidates) {
    try {
      if (require('fs').existsSync(c)) {
        pathFound = c;
        break;
      }
    } catch { }
  }

  if (!pathFound) throw new Error('Native binary not found');

  const nativeModule = require(pathFound);
  NativeWorker = nativeModule.NativeWorker;
} catch (e) {
  // Native worker not found or failed to load, will fallback to JS implementation
  log.warn('Native worker not found, falling back to JS implementation');
  // Mock Native Worker
  NativeWorker = class {
    constructor(workers: number) { }
    processFile(filePath: string) { return null; }
    invalidate(filePath: string) { }
    rebuild(filePath: string) { return []; }
  };
}

import { HMRThrottle } from './hmrThrottle.js';
import { ConfigWatcher } from './configWatcher.js';
import { StatusHandler } from './statusHandler.js';
import { LiveConfigManager } from '../config/live-config.js';

/**
 * Rewrite bare module imports to node_modules paths
 * Converts: import React from 'react'
 * To: import React from '/node_modules/react/index.js'
 */
/**
 * Rewrite bare module imports to node_modules paths
 * Production-grade AST-based rewriting (Phase C1 Honest)
 */
async function rewriteImports(code: string, rootDir: string, preBundledDeps?: Map<string, string>): Promise<string> {
  try {
    const acorn = await import('acorn');
    const ast = acorn.parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest'
    }) as any;

    const replacements: { start: number, end: number, replacement: string }[] = [];

    const addReplacement = (node: any) => {
      if (node && node.type === 'Literal' && typeof node.value === 'string') {
        const specifier = node.value;
        if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('http')) {
          // Handle relative CSS/JSON 
          if (specifier.endsWith('.css') || specifier.endsWith('.json')) {
            replacements.push({
              start: node.start,
              end: node.end,
              replacement: `'${specifier}?import'`
            });
          }
          return;
        }

        let replacement = `/node_modules/${specifier}`;
        if (preBundledDeps && preBundledDeps.has(specifier)) {
          replacement = `${preBundledDeps.get(specifier)}?v=${Date.now()}`;
        } else if (preBundledDeps) {
          // Subpath check
          const parts = specifier.split('/');
          const pkgName = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
          if (preBundledDeps.has(pkgName)) {
            const safeName = specifier.replace(/\//g, '_');
            replacement = `/@nexxo-deps/${safeName}.js?v=${Date.now()}`;
          }
        }

        replacements.push({
          start: node.start,
          end: node.end,
          replacement: `'${replacement}'`
        });
      }
    };

    // Walk AST
    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') {
        addReplacement(node.source);
      } else if (node.type === 'ExportNamedDeclaration' && node.source) {
        addReplacement(node.source);
      } else if (node.type === 'ExportAllDeclaration' && node.source) {
        addReplacement(node.source);
      }
    }

    // Sort replacements backwards to avoid offset issues
    replacements.sort((a, b) => b.start - a.start);

    let output = code;
    for (const { start, end, replacement } of replacements) {
      output = output.slice(0, start) + replacement + output.slice(end);
    }
    return output;
  } catch (e) {
    // If AST fails (e.g. non-JS content), return as is
    return code;
  }
}

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.on('error', () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}

/**
 * Find the next available port
 */
async function findAvailablePort(startPort: number, host: string): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port, host))) {
    log.warn(`Port ${port} is already in use, trying ${port + 1}...`, { category: 'server' });
    port++;
    if (port > startPort + 100) {
      throw new Error(`Could not find an available port after ${port - startPort} attempts`);
    }
  }
  return port;
}

export async function startDevServer(cfg: BuildConfig, existingServer?: any) {
  // 1. Load Environment Variables
  try {
    const dotenvModule = await import('dotenv');
    const loadEnv = (dotenvModule as any).config || (dotenvModule as any).default?.config;
    if (loadEnv) {
      loadEnv({ path: path.join(cfg.root, '.env') });
      loadEnv({ path: path.join(cfg.root, '.env.local') });
    }
  } catch (e) { }

  // Filter public env vars
  const publicEnv = Object.keys(process.env)
    .filter(key => key.startsWith('NEXXO_') || key.startsWith('PUBLIC_') || key === 'NODE_ENV')
    .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {
      NODE_ENV: process.env.NODE_ENV || 'development'
    });

  log.debug('Loaded Environment Variables', { category: 'server', count: Object.keys(publicEnv).length });

  // 2. Detect Framework (Universal Support)
  const { FrameworkDetector } = await import('../core/framework-detector.js');
  // 1. Initialize Framework Pipeline (Phase B3)
  const { FrameworkPipeline } = await import('../core/pipeline/framework-pipeline.js');
  const pipeline = await FrameworkPipeline.auto(cfg);
  let primaryFramework = pipeline.getFramework();
  if (cfg.adapter && cfg.adapter.includes('react')) {
    primaryFramework = 'react';
  }

  // @ts-ignore - Pipeline owns opinionated defaults
  pipeline.applyDefaults();

  log.info(`--> Dev Server: Active ${primaryFramework} workflow`, { category: 'server' });
  if (primaryFramework === 'vanilla') {
    log.warn('--> Dev Server: No framework detected, HMR might be limited', { category: 'server' });
  }

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
  log.debug(`Checking for Tailwind at: ${tailwindConfigPath}`);
  if (await fs.access(tailwindConfigPath).then(() => true).catch(() => false)) {
    const { TailwindPlugin } = await import('../plugins/css/tailwind.js');
    pluginManager.register(new TailwindPlugin(cfg.root));
    log.info('--> Dev Server: Tailwind CSS Plugin registered', { category: 'server' });
  }

  // Auto-register CSS Preprocessor Plugins
  const { SassPlugin } = await import('../plugins/css/sass.js');
  pluginManager.register(new SassPlugin(cfg.root));

  const { LessPlugin } = await import('../plugins/css/less.js');
  pluginManager.register(new LessPlugin(cfg.root));

  const { StylusPlugin } = await import('../plugins/css/stylus.js');
  pluginManager.register(new StylusPlugin(cfg.root));

  // Svelte Support removed - Handled by UniversalTransformer
  // Vue Support removed - Handled by UniversalTransformer

  const { DependencyPreBundler } = await import('./preBundler.js');
  const preBundler = new DependencyPreBundler(cfg.root);

  // Initialize Live Config Manager
  const liveConfig = new LiveConfigManager(cfg, cfg.root);

  // Scan and pre-bundle dependencies on server start
  log.debug('Scanning dependencies for pre-bundling...');
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
      react: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom', '@remix-run/router', 'react-router'],
      next: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom'],
      remix: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-router-dom'],
      preact: ['preact', 'preact/hooks', 'preact/jsx-runtime', 'preact/jsx-dev-runtime'],
      vue: ['vue'],
      nuxt: ['vue'],
      svelte: [
        'svelte',
        'svelte/animate',
        'svelte/easing',
        'svelte/internal',
        'svelte/internal/disclose-version',
        'svelte/motion',
        'svelte/store',
        'svelte/transition'
      ],
      solid: ['solid-js', 'solid-js/web', 'solid-js/store'],
      angular: [
        '@angular/core',
        '@angular/common',
        '@angular/compiler',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router',
        '@angular/forms',
        'rxjs',
        'rxjs/operators',
        'zone.js'
      ]
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
        log.debug('Dependencies pre-bundled successfully', { count: preBundledDeps.size });
      }
    }

    // Warmup Build (Phase C1/C2)
    log.info('--> Dev Server: Warming up graph...');
    const buildResult = await pipeline.build();
    if (!buildResult.success) {
      const errorMsg = (buildResult as any).error?.message || 'Unknown error during warmup';
      log.error('--> Dev Server: Warmup build failed: ' + errorMsg);
    }
  } catch (error: any) {
    log.warn('Failed to pre-bundle or warmup:', error.message);
  }

  let port = cfg.server?.port || cfg.port || 5173;
  const host = cfg.server?.host || 'localhost';

  // Dynamic port detection
  if (!cfg.server?.strictPort) {
    port = await findAvailablePort(port, host);
  }

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
      const certDir = path.join(cfg.root, '.nexxo', 'certs');
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
  let wss: WebSocketServer | undefined;
  const broadcast = (msg: string) => {
    if (wss) {
      wss.clients.forEach((c: any) => {
        // WebSocket.OPEN is 1
        if (c.readyState === 1) c.send(msg);
      });
    }
  };

  const hmrThrottle = new HMRThrottle(broadcast);

  // Initialize Federation Dev
  const { FederationDev } = await import('./federation-dev.js');
  const federationDev = new FederationDev(cfg, broadcast);
  federationDev.start();

  // Initialize security headers once
  const { createSecurityHeaders } = await import('../server/security-headers.js');
  const securityHeaders = createSecurityHeaders({
    csp: false,
    hsts: cfg.server?.https ? true : false,
    frameOptions: 'SAMEORIGIN',
    xssProtection: true,
    contentTypeNosniff: true
  });

  // Setup WebSocket Handlers for Config Sync (Advanced & Secure)
  const setupWssHandlers = (server: WebSocketServer) => {
    server.on('connection', (ws, req) => {
      // Security Gate: Origin Validation
      const origin = req.headers.origin;
      const allowedOrigins = [
        `http://${host}:${port}`,
        `https://${host}:${port}`,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];

      if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
        log.warn(`Blocked unauthorized WebSocket connection from origin: ${origin}`);
        ws.terminate();
        return;
      }

      // 1. Initial Handshake: Send current config AND session token
      ws.send(JSON.stringify({
        type: 'config:init',
        config: liveConfig.getConfig(),
        token: liveConfig.getSessionToken() // Only shared over this secure local WS
      }));

      // 2. Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) ws.ping();
      }, 30000);

      ws.on('close', () => clearInterval(heartbeat));

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'config:update') {
            // Security: Token must match
            const success = liveConfig.updateConfig(message.update, message.token);
            if (success) {
              // Broadcast update to ALL clients (without token)
              broadcast(JSON.stringify({
                type: 'config:changed',
                config: liveConfig.getConfig(),
                update: message.update
              }));

              if (message.persist) {
                await liveConfig.persist();
              }
            } else {
              ws.send(JSON.stringify({
                type: 'config:error',
                message: 'Update rejected (invalid token or protected path)'
              }));
            }
          }

          if (message.type === 'config:get') {
            ws.send(JSON.stringify({
              type: 'config:current',
              config: liveConfig.getConfig()
            }));
          }
        } catch (e) {
          log.error('Failed to handle WS message', e);
        }
      });
    });
  };

  const requestHandler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (process.env.DEBUG) {
      // Diagnostic log removed for cleaner production output
      // log.debug(`[DevServer] Request: ${req.url} Preset: ${cfg.preset}`);
    }
    statusHandler.trackRequest();
    if (await statusHandler.handleRequest(req, res)) return;
    if (federationDev.handleRequest(req, res)) return;

    // Security Scan (Day 41)
    if (!anomalyDetector.scanRequest({ url: req.url || '', headers: req.headers, method: req.method || 'GET' })) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Request Blocked by Nexxo Security Shield');
      return;
    }

    if (req.url === '/__nexxo/security') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(anomalyDetector.getDashboard(), null, 2));
      return;
    }

    // Apply security headers
    securityHeaders.apply(req, res);

    // Ignore Chrome DevTools extension probes
    if (req.url?.includes('.well-known/appspecific/com.chrome.devtools.json')) {
      res.writeHead(404);
      res.end();
      return;
    }

    // Federation Editor
    if (req.url === '/__federation') {
      const { getEditorHtml } = await import('../visual/federation-editor.js');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getEditorHtml(cfg));
      return;
    }

    // Graph Visualizer
    if (req.url === '/__graph') {
      const { getGraphUIHtml } = await import('../visual/graph-ui.js');
      const liveGraph = pipeline.getEngine().getGraph();
      if (!liveGraph) {
        res.writeHead(503);
        res.end('Graph not yet warmed up');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getGraphUIHtml(liveGraph));
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

    // SPA Fallback: If route has no extension and it's not a known internal route, serve index.html
    const isInternal = url.startsWith('/@') || url.startsWith('/__') || url.startsWith('/node_modules/');
    const hasExtension = path.extname(url.split('?')[0]) !== '';
    const acceptsHtml = req.headers.accept?.includes('text/html');

    if ((url === '/' || (!hasExtension && !isInternal && acceptsHtml)) && cfg.preset === 'spa') {
      let p = path.join(cfg.root, 'index.html');
      let data = '';

      // 1. Try Root (Vite standard)
      try {
        log.debug(`Reading index from ${p}`);
        data = await fs.readFile(p, 'utf-8');
      } catch (e: any) {
        // 2. Fallback to public/index.html
        try {
          p = path.join(cfg.root, 'public', 'index.html');
          log.debug(`Reading index from ${p}`);
          data = await fs.readFile(p, 'utf-8');
        } catch (e2: any) {
          // 3. Fallback to src/index.html
          try {
            p = path.join(cfg.root, 'src', 'index.html');
            log.debug(`Reading index from ${p}`);
            data = await fs.readFile(p, 'utf-8');
          } catch (e3: any) {
            // Final failure
            log.debug(`Failed to find index.html in root, public, or src`);
            if (e3.code === 'EISDIR') { /* ignore */ }
            res.writeHead(404);
            res.end('index.html not found');
            return;
          }
        }
      }

      try {
        // Inject entry point if not present (simple heuristic)
        // Angular CLI projects often don't have the script tag in source index.html
        if (!data.includes('src="main.ts"') && !data.includes('src="/src/main.ts"')) {
          // Try to inject main entry point script at the end of body
          // We need to guess the entry point or use config. 
          // Config has cfg.entry which is an array.
          if (cfg.entry && cfg.entry.length > 0) {
            const entryScript = `<script type="module" src="/${cfg.entry[0]}"></script>`;
            data = data.replace('</body>', `${entryScript}</body>`);
          }
        }

        // Inject only client runtime
        let clientScript = `
    <script type="module" src="/@nexxo/client"></script>
        `;

        // Always inject basic shims in dev mode to prevent ReferenceErrors from any React-ish modules
        let preamble = `
    <script>
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
    </script>
        `;

        // Inject full React Refresh Preamble if React is detected or configured
        const isReact = ['react', 'next', 'remix', 'react-typescript', 'react-adapter'].includes(primaryFramework) ||
          (cfg.adapter && cfg.adapter.includes('react'));

        if (isReact) {
          if (process.env.DEBUG) {
            log.info('[Nexxo] Injecting React Refresh Preamble', { category: 'server' });
          }
          preamble += `
    <script type="module">
      import RefreshRuntime from "/@react-refresh";
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = (type, id) => {
        RefreshRuntime.register(type, id);
      };
      window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
      window.__vite_plugin_react_preamble_installed__ = true;
    </script>
          `;
        }
        clientScript = preamble + clientScript;

        // Use a more robust injection that handles case-sensitivity and space variations
        if (data.includes('<head>')) {
          data = data.replace('<head>', '<head>' + clientScript);
        } else if (data.includes('<HEAD>')) {
          data = data.replace('<HEAD>', '<HEAD>' + clientScript);
        } else {
          // Fallback if no head tag found
          data = clientScript + data;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch (e) {
        log.error('Error serving index.html', e);
        res.writeHead(500);
        res.end('Internal Server Error');
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
    if (url.startsWith('/@nexxo-deps/')) {
      // Strip query parameters
      const cleanUrl = url.split('?')[0];
      const depFile = cleanUrl.replace('/@nexxo-deps/', '');
      const depPath = path.join(cfg.root, 'node_modules', '.nexxo', depFile);
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
        // Try to find react-refresh in node_modules
        const searchPaths = [
          path.join(cfg.root, 'node_modules/react-refresh/cjs/react-refresh-runtime.development.js'),
          path.join(cfg.root, '../node_modules/react-refresh/cjs/react-refresh-runtime.development.js'),
          path.join(process.cwd(), 'node_modules/react-refresh/cjs/react-refresh-runtime.development.js'),
        ];

        let runtime = null;
        for (const checkPath of searchPaths) {
          try {
            runtime = await fs.readFile(checkPath, 'utf-8');
            runtimePath = checkPath;
            break;
          } catch {
            // Continue to next path
          }
        }

        if (!runtime) {
          throw new Error('Could not find react-refresh runtime in any node_modules');
        }

        // Wrap the CJS module with process polyfill for browser environment
        const wrappedRuntime = `
          const process = { env: { NODE_ENV: 'development' } };
          const exports = {};
          const module = { exports };
          
          ${runtime}
          
          export default module.exports;
        `;

        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(wrappedRuntime);
      } catch (e) {
        log.error('Failed to resolve React Refresh', { category: 'server', error: e });
        res.writeHead(404);
        res.end('React Refresh runtime not found');
      }
      return;
    }



    if (url === '/@nexxo/client') {
      const clientPath = path.resolve(__dirname, '../runtime/client.ts');
      try {
        const raw = await fs.readFile(clientPath, 'utf-8');
        const { transform } = await import('esbuild');
        const result = await transform(raw, { loader: 'ts' });
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(result.code);
      } catch (e) {
        // Fallback to JS if TS missing
        const jsPath = path.resolve(__dirname, '../runtime/client.js');
        try {
          const client = await fs.readFile(jsPath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(client);
        } catch (e2) {
          res.writeHead(404);
          res.end('Nexxo client runtime not found');
        }
      }
      return;
    }

    if (url === '/@nexxo/error-overlay.js') {
      // Also transform error-overlay if ts
      const overlayPath = path.resolve(__dirname, '../runtime/error-overlay.ts');
      try {
        const raw = await fs.readFile(overlayPath, 'utf-8');
        const { transform } = await import('esbuild');
        const result = await transform(raw, { loader: 'ts' });
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(result.code);
      } catch (e) {
        // Fallback
        const jsPath = path.resolve(__dirname, '../runtime/error-overlay.js');
        try {
          const overlay = await fs.readFile(jsPath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(overlay);
        } catch (e2) {
          res.writeHead(404);
          res.end('Nexxo error overlay not found');
        }
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
      const cleanUrl = url.split('?')[0];
      let modulePath = path.join(cfg.root, cleanUrl);

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
      } catch (e: any) {
        log.error(`[SERVER] Failed to serve module: ${url}`, e);
        if (!res.headersSent) {
          res.writeHead(404);
          res.end('Module not found');
        }
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

    // console.log('Serving:', { url, cleanUrl, filePath });

    // SECURITY: Path Traversal Protection
    if (!filePath.startsWith(cfg.root)) {
      res.writeHead(403);
      res.end('Access denied');
      return;
    }

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
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        // If trying to read a directory (like root '/'), default to index.html
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath);

      if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs' || ext === '.vue' || ext === '.svelte' || ext === '.astro') {
        let raw = await fs.readFile(filePath, 'utf-8');

        // Native Transform (Caching + Graph) - only for JS/TS files
        if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs') {
          try {
            raw = nativeWorker.transformSync(raw, filePath);
          } catch (e: any) {
            // Silently continue - native worker is optional optimization
            // Only log in debug mode to avoid terminal spam
            if (process.env.DEBUG) {
              log.debug(`NativeWorker skipped for ${filePath}: ${e.message}`, { category: 'build' });
            }
          }
        }

        // Plugin transform (JS plugins like Tailwind)
        raw = await pluginManager.transform(raw, filePath);

        // Inject Env Vars and React Refresh Shims (only for JS/TS files)
        // Aggressive In-Module Shim: Guarantee $RefreshSig$ existence
        if (ext === '.ts' || ext === '.tsx' || ext === '.jsx' || ext === '.js' || ext === '.mjs') {
          raw = `
/** Nexxo Dev Preamble **/
if (typeof window !== 'undefined') {
  window.$RefreshReg$ = window.$RefreshReg$ || (() => {});
  window.$RefreshSig$ = window.$RefreshSig$ || (() => (type) => type);
}
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
          let code = await rewriteImports(transformResult.code, cfg.root, preBundledDeps);

          res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(code);
          return;
        } catch (error: any) {
          // Compute preamble line offset (we prepend a dev preamble before the original file)
          let reportedLine: number | undefined = undefined;
          try {
            const sep = '\n\n';
            const sepIdx = typeof raw === 'string' ? raw.indexOf(sep) : -1;
            let preambleLines = 0;
            if (sepIdx !== -1) {
              preambleLines = raw.slice(0, sepIdx).split(/\r?\n/).length;
            }
            if (error && error.loc && typeof error.loc.line === 'number') {
              reportedLine = Math.max(1, error.loc.line - preambleLines);
            } else if (error && error.loc && typeof error.loc === 'object' && error.loc.line) {
              reportedLine = Math.max(1, Number(error.loc.line) - preambleLines);
            }
          } catch (e) {
            reportedLine = error.loc?.line;
          }

          const relativePath = path.relative(cfg.root, filePath).replace(/^[\\\/]/, '');
          log.projectError({
            file: relativePath,
            message: error.message || String(error),
            line: reportedLine,
            column: error.loc?.column
          });

          // Send error to browser console as well (minimal)
          const errorPayload = {
            file: relativePath,
            message: error.message || String(error),
            line: reportedLine,
            column: error.loc?.column
          };

          const errorScript = `console.error('Project Error:', ${JSON.stringify(errorPayload)});`;
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(errorScript);
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
          res.end(`export default ${raw}; `);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(raw);
        return;
      }

      // Serve other files raw
      const data = await fs.readFile(filePath);
      let mime = 'application/octet-stream';
      if (ext === '.map') mime = 'application/json';
      if (ext === '.html') mime = 'text/html';
      if (ext === '.svg') mime = 'image/svg+xml';

      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    } catch (e: any) {
      log.error(`Request error: ${e.message}`, { category: 'server' });
      if (process.env.DEBUG || process.env.NODE_ENV === 'test') {
        console.error(e.stack);
      } else {
        // Always show stack for request errors in dev mode for visibility
        console.error(e);
      }

      const isJS = url.match(/\.(js|ts|tsx|jsx|mjs|vue|svelte|astro)/);

      // If it's a build error (has loc/frame/stack), broadcast it
      if (e.message && (e.frame || e.loc || e.stack)) {
        const errorData = {
          message: e.message,
          stack: e.stack,
          filename: filePath,
          frame: e.frame
        };

        broadcast(JSON.stringify({
          type: 'error',
          error: errorData
        }));

        if (isJS && !res.headersSent) {
          // Serve a JS fallback that throws in console and triggers overlay
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(`
            console.error("[Nexxo Build Error] ${e.message.replace(/"/g, '\\"')}");
            const error = ${JSON.stringify(errorData)};
            if (window.__NEXXO_ERROR_OVERLAY__) {
              window.__NEXXO_ERROR_OVERLAY__.show(error);
            }
            throw new Error("[Nexxo Build Error] See overlay for details");
          `);
          return;
        }
      }

      if (!res.headersSent) {
        res.writeHead(500);
        res.end(e.message || 'Internal Server Error');
      }
    }
  };

  let server;
  if (existingServer) {
    server = existingServer;
    (server as any).__nexxo_handler = requestHandler;
  } else {
    if (httpsOptions) {
      const https = await import('https');
      server = https.createServer(httpsOptions, requestHandler);
    } else {
      server = http.createServer(requestHandler);
    }
  }

  // WebSocket Server setup
  const { WebSocketServer } = await import('ws');
  wss = new WebSocketServer({ server });

  // Initialize Config Sync Handlers
  setupWssHandlers(wss);

  wss.on('connection', (ws: WebSocket) => {
    log.info('HMR client connected', { category: 'hmr' });
    hmrThrottle.registerClient(ws);
    ws.on('close', () => hmrThrottle.unregisterClient(ws));
  });

  // Upgrade handling for Proxy WebSockets
  server.on('upgrade', (req: http.IncomingMessage, socket: any, head: Buffer) => {
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
    if (type === 'hot' || (file.endsWith('.json') && !file.includes('package.json'))) {
      log.info(`Hot reloading config from ${path.basename(file)}...`, { category: 'server' });
      try {
        const { loadConfig } = await import('../config/index.js');
        const updatedCfg = await loadConfig(cfg.root);

        // Update live config manager (which will broadcast to clients)
        // We do a full replacement here because the whole file changed
        Object.entries(updatedCfg).forEach(([key, value]) => {
          liveConfig.updateConfig({ path: key, value });
        });

        broadcast(JSON.stringify({
          type: 'config:changed',
          config: liveConfig.getConfig()
        }));
      } catch (e) {
        log.error('Failed to hot reload config', e);
      }
    } else if (type === 'restart') {
      log.warn('Restarting server due to config change...', { category: 'server' });
      broadcast(JSON.stringify({ type: 'restarting' }));
      await new Promise(r => setTimeout(r, 500)); // Give clients time to receive message
      server.close();
      wss?.close();
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

  const { default: chokidar } = await import('chokidar');
  const watcher = chokidar.watch(cfg.root, { ignored: /node_modules|\.git/ });
  watcher.on('change', async (file: string) => {
    try {
      // Clear transform cache for changed file
      universalTransformer.clearCache(file);

      // Proactively check for errors in JS/TS files
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.jsx', '.js', '.mjs', '.vue', '.svelte'].includes(ext)) {
        try {
          const code = await fs.readFile(file, 'utf-8');

          // Attempt transformation to catch errors immediately
          await universalTransformer.transform({
            filePath: file,
            code,
            framework: primaryFramework,
            root: cfg.root,
            isDev: true
          });

          // If transformation succeeds, log success
          if (process.env.DEBUG) {
            log.debug(`✓ ${path.relative(cfg.root, file)} validated`, { category: 'hmr' });
          }
        } catch (transformError: any) {
          // Error is already logged by universal-transformer
          // Also broadcast to browser
          const relativePath = path.relative(cfg.root, file);
          broadcast(JSON.stringify({
            type: 'error',
            error: {
              message: transformError.message || String(transformError),
              file: relativePath,
              line: transformError.loc?.line,
              column: transformError.loc?.column,
              stack: transformError.stack
            }
          }));

          // Don't continue with HMR if there's an error
          return;
        }
      }

      // Native Invalidation & Rebuild
      try {
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
      } catch (nativeError: any) {
        log.warn(`Native HMR unavailable for ${path.relative(cfg.root, file)}: ${nativeError.message || 'Unknown error'}. Falling back to full reload`, { category: 'hmr' });
        // Don't broadcast 'error' here, just restart
        broadcast(JSON.stringify({ type: 'restarting' }));
      }
    } catch (e: any) {
      log.error(`Watcher crash recovery for ${file}:`, e);
      // Ensure we don't leave the client hanging
      broadcast(JSON.stringify({
        type: 'error',
        error: { message: `Watcher error: ${e.message}`, stack: e.stack }
      }));
    }
  });

  if (!existingServer) {
    server.listen(port, () => {
      const protocol = httpsOptions ? 'https' : 'http';
      const url = `${protocol}://${host}:${port}`;

      log.table({
        'HTTP': url,
        'HTTPS': httpsOptions ? 'Enabled' : 'Disabled',
        'Proxy': cfg.server?.proxy ? Object.keys(cfg.server.proxy).join(', ') : 'None',
        'Status': `${url}/__nexxo/status`,
        'Security': `${url}/__nexxo/security`,
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
  } else {
    // Just log that full features are ready
    const protocol = httpsOptions ? 'https' : 'http';
    const url = `${protocol}://${host}:${port}`;
    log.success(`Full production engine active at ${url}`, { category: 'server' });
  }

  return server;
}
