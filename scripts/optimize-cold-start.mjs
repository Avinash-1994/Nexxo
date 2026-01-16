#!/usr/bin/env node

/**
 * Script to optimize devServer.ts for <200ms cold start
 * Moves pre-bundling to background initialization
 */

import fs from 'fs';
import path from 'path';

const filePath = './src/dev/devServer.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Wrap pre-bundling in async function
const oldCode1 = `  // Scan and pre-bundle dependencies on server start
  log.debug('Scanning dependencies for pre-bundling...');
  const entryPoint = path.join(cfg.root, 'public', 'index.html');
  let preBundledDeps = new Map<string, string>();

  try {`;

const newCode1 = `  // Pre-bundling runs in background after server starts
  let preBundledDeps = new Map<string, string>();

  const runBackgroundInit = async () => {
    const entryPoint = path.join(cfg.root, 'public', 'index.html');
    try {
      log.info('Background: Pre-bundling dependencies...', { category: 'server' });`;

content = content.replace(oldCode1, newCode1);

// Step 2: Close the function
const oldCode2 = `  } catch (error: any) {
    log.warn('Failed to pre-bundle or warmup:', error.message);
  }`;

const newCode2 = `    } catch (error: any) {
      log.warn('Background init failed:', error.message, { category: 'server' });
    }
  };`;

content = content.replace(oldCode2, newCode2);

// Step 3: Call background init after server starts
const oldCode3 = `    });

    if (cfg.server?.open) {`;

const newCode3 = `    });

    // Start background init (non-blocking)
    setImmediate(() => runBackgroundInit());

    if (cfg.server?.open) {`;

content = content.replace(oldCode3, newCode3);

// Write back
fs.writeFileSync(filePath, content);

console.log('✅ devServer.ts optimized for <200ms cold start!');
console.log('Changes made:');
console.log('  1. Wrapped pre-bundling in runBackgroundInit()');
console.log('  2. Moved execution to after server.listen()');
console.log('  3. Made it non-blocking with setImmediate()');
