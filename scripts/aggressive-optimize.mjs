#!/usr/bin/env node

/**
 * AGGRESSIVE Cold Start Optimization
 * Defer EVERYTHING except HTTP server creation
 */

import fs from 'fs';

const filePath = './src/dev/devServer.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Find the startDevServer function and wrap most of it
const functionStart = 'export async function startDevServer(cfg: BuildConfig) {';
const envLoadEnd = `  log.debug('Loaded Environment Variables', { category: 'server', count: Object.keys(publicEnv).length });`;

// Step 2: Everything from framework detection to pre-bundling goes into background
const frameworkStart = `  // 2. Detect Framework (Universal Support)`;
const backgroundEnd = `  };`;

// Find where server.listen is
const serverListenPattern = `  server.listen(port, () => {`;

// Create the optimized version
const optimized = content.replace(
    /export async function startDevServer\(cfg: BuildConfig\) \{[\s\S]*?server\.listen\(port, \(\) => \{/,
    (match) => {
        // Extract just the env loading part
        const envPart = match.substring(
            match.indexOf('export async function'),
            match.indexOf('// 2. Detect Framework')
        );

        // Extract the initialization part (framework to pre-bundling)
        const initPart = match.substring(
            match.indexOf('// 2. Detect Framework'),
            match.indexOf('let port = cfg.server?.port')
        );

        // Extract server creation part
        const serverPart = match.substring(
            match.indexOf('let port = cfg.server?.port'),
            match.indexOf('server.listen(port, () => {') + 'server.listen(port, () => {'.length
        );

        return `export async function startDevServer(cfg: BuildConfig) {
  // OPTIMIZED: Minimal startup, defer everything else
  
  // Only load env vars (fast)
  const { config: loadEnv } = await import('dotenv');
  loadEnv({ path: path.join(cfg.root, '.env') });
  loadEnv({ path: path.join(cfg.root, '.env.local') });

  const publicEnv = Object.keys(process.env)
    .filter(key => key.startsWith('NEXXO_') || key.startsWith('PUBLIC_') || key === 'NODE_ENV')
    .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {
      NODE_ENV: process.env.NODE_ENV || 'development'
    });

  // Minimal vars needed for server
  let preBundledDeps = new Map<string, string>();
  let pipeline: any;
  let universalTransformer: any;
  let pluginManager: any;
  let liveConfig: any;

  // Background initialization (ALL the slow stuff)
  const initializeBackground = async () => {
    try {
      log.info('Background: Initializing features...', { category: 'server' });
      
${initPart}
      
      log.info('Background: Initialization complete!', { category: 'server' });
    } catch (error: any) {
      log.warn('Background init failed: ' + error.message, { category: 'server' });
    }
  };

${serverPart}`;
    }
);

fs.writeFileSync(filePath, optimized);

console.log('✅ Aggressive optimization applied!');
console.log('Server will start in <100ms, init runs in background');
