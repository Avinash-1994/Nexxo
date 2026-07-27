import { spawn } from 'child_process';
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testsDir = path.join(__dirname, '../framework-tests');

const dirs = fs.readdirSync(testsDir)
  .filter(d => d.startsWith('test-') && fs.statSync(path.join(testsDir, d)).isDirectory())
  .sort();

console.log(`Found ${dirs.length} framework test projects.`);

(async () => {
  const browser = await chromium.launch();
  
  for (const dir of dirs) {
    console.log(`\n======================================`);
    console.log(` Testing: ${dir}`);
    console.log(`======================================`);
    
    const proc = spawn('npm', ['run', 'dev'], { cwd: path.join(testsDir, dir), shell: true });
    
    let url = '';
    let serverReady = false;
    
    proc.stdout.on('data', data => {
      const out = data.toString();
      if (out.includes('http://localhost:')) {
        const match = out.match(/http:\/\/localhost:\d+/);
        if (match && !url) {
          url = match[0];
          serverReady = true;
        }
      }
    });
    
    let waitTime = 0;
    while (!serverReady && waitTime < 10000) {
      await new Promise(r => setTimeout(r, 500));
      waitTime += 500;
    }
    
    if (!url) {
      console.log(`❌ FAIL: Dev server did not start for ${dir}`);
      proc.kill();
      continue;
    }
    
    console.log(`Server started at ${url}. Opening browser...`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    let hasErrors = false;
    let errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico')) {
          errors.push(`[Console Error] ${text}`);
          hasErrors = true;
        }
      }
    });
    
    page.on('pageerror', err => {
      errors.push(`[Page Error] ${err.toString()}`);
      hasErrors = true;
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 8000 });
      const title = await page.title();
      console.log(`Page Title: "${title}"`);
      
      if (hasErrors) {
        console.log(`⚠️  COMPLETED WITH ERRORS:`);
        errors.forEach(e => console.log(`  - ${e}`));
      } else {
        console.log(`✅ PASS: No console errors!`);
      }
    } catch (err) {
      console.log(`❌ FAIL: Could not load page - ${err.message}`);
    }
    
    await context.close();
    proc.kill();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
  console.log(`\nDone testing all frameworks!`);
})();
