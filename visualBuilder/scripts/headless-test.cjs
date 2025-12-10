#!/usr/bin/env node
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function run() {
  const root = path.resolve(__dirname, '..');
  // Start a lightweight Python static server to serve build_output
  const buildOutput = path.join(root, 'build_output');
  const server = spawn('python3', ['-m', 'http.server', '5001', '--directory', buildOutput], {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`[server-err] ${d}`));

  // Wait for server to be ready (simple delay)
  await new Promise((res) => setTimeout(res, 800));

  const url = 'http://localhost:5001/';
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = resp && resp.status();
    const h1 = await page.textContent('h1');
    console.log('PAGE STATUS:', status);
    console.log('H1 TEXT:', h1 && h1.trim());
    if (status !== 200) throw new Error('Non-200 status: ' + status);
    if (!h1 || !h1.includes('Visual Builder')) throw new Error('Unexpected page content');
    console.log('Headless smoke test: SUCCESS');
  } catch (err) {
    console.error('Headless smoke test: FAILED', err && err.stack || err);
    process.exitCode = 2;
  } finally {
    try { if (browser) await browser.close(); } catch (e) {}
    // Kill SPA server
    server.kill('SIGINT');
  }
}

run();
