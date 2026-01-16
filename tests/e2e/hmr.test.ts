import { describe, it, expect, beforeAll, afterAll } from '../../src/test/api.js';
import { startDevServer } from '../../src/dev/devServer.js';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

let browser: any;
let page: any;
let server: any;
const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/e2e_hmr');

describe('E2E HMR Test', () => {
    beforeAll(async () => {
        // Setup Fixture
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });
        fs.mkdirSync(path.join(FIXTURE_DIR, 'public'), { recursive: true });

        fs.writeFileSync(path.join(FIXTURE_DIR, 'index.html'), `
            <!DOCTYPE html>
            <body>
                <div id="root">Initial</div>
                <script type="module" src="/src/main.js"></script>
            </body>
        `);

        fs.writeFileSync(path.join(FIXTURE_DIR, 'public/index.html'), `
            <!DOCTYPE html>
            <body>
                <div id="root">Initial</div>
                <script type="module" src="/src/main.js"></script>
            </body>
        `);

        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.js'), `
            if (import.meta.hot) {
                import.meta.hot.accept();
            }
            document.getElementById('root').innerText = 'Version 1';
        `);

        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: "e2e-hmr",
            type: "module",
            dependencies: { "react": "^18.0.0" }
        }));

        // Start Server
        const TEST_PORT = 3100;
        const config = {
            root: FIXTURE_DIR,
            port: TEST_PORT,
            server: { open: false },
            entry: ['src/main.js'],
            preset: 'spa'
        };

        console.log('Starting HMR Server...');
        server = await startDevServer(config as any);
        await new Promise(r => setTimeout(r, 2000));

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        page.setDefaultTimeout(60000);
    });

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) await new Promise(r => server.close(r));
    });

    it('should update content on file change (HMR)', async () => {
        await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });

        // Check V1
        let text = await page.$eval('#root', (el: any) => el.innerText);
        expect(text).toBe('Version 1');

        // Trigger HMR
        console.log('Writing Version 2...');
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.js'), `
            if (import.meta.hot) {
                import.meta.hot.accept();
            }
            document.getElementById('root').innerText = 'Version 2';
        `);

        // Wait for HMR
        // We poll for the change
        console.log('Waiting for HMR update...');
        // Increase timeout to 30s to account for full reload fallback latency
        await page.waitForFunction(
            () => document.getElementById('root')?.innerText === 'Version 2',
            { timeout: 30000 }
        );

        text = await page.$eval('#root', (el: any) => el.innerText);
        expect(text).toBe('Version 2');
    });
});
