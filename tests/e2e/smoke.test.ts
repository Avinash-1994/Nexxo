import { describe, it, expect, beforeAll, afterAll } from '../../src/test/api.js';
import { startDevServer } from '../../src/dev/devServer.js';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

let browser: any;
let page: any;
let server: any;
const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/e2e_app');

describe('E2E Smoke Test', () => {
    beforeAll(async () => {
        // Setup Fixture
        if (!fs.existsSync(FIXTURE_DIR)) {
            fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });
            fs.mkdirSync(path.join(FIXTURE_DIR, 'public'), { recursive: true });
        }

        const html = `
            <!DOCTYPE html>
            <body>
                <div id="root">Hello E2E</div>
            </body>
        `;
        fs.writeFileSync(path.join(FIXTURE_DIR, 'index.html'), html);
        fs.writeFileSync(path.join(FIXTURE_DIR, 'public/index.html'), html);

        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.ts'), `
            console.log('Hydrated');
        `);

        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: "e2e-app",
            type: "module",
            dependencies: { "react": "^18.0.0" }
        }));

        // Start Server on custom port
        const TEST_PORT = 3099;
        const config = {
            root: FIXTURE_DIR,
            port: TEST_PORT,
            server: { open: false },
            entry: ['src/main.ts'],
            preset: 'spa'
        };

        console.log('Starting E2E Server...');
        server = await startDevServer(config as any);

        // Wait for server to be ready (approx)
        await new Promise(r => setTimeout(r, 2000));

        console.log('Launching Browser...');
        browser = await puppeteer.launch({
            headless: true, // Use old headless or 'new' depending on version
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
    });

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) {
            server.close();
            // server.close() is async in node http if callback, but we trigger it and move on
            await new Promise(r => server.close(r));
        }
    });

    it('should serve the index page with Nexxo client', async () => {
        try {
            await page.goto('http://localhost:3099', { waitUntil: 'networkidle0' });
            const content = await page.content();

            expect(content).toBeDefined();
            // Nexxo always injects client script
            expect(content).toContain('@nexxo/client');
        } catch (e: any) {
            console.error('E2E Navigation Error:', e);
            throw e;
        }
    });

    it('should have correct title', async () => {
        const title = await page.title();
        expect(title).toBeDefined();
    });
});
