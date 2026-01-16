import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { startDevServer } from '../../src/dev/devServer.js'; // Adjust path
import { describe, it, expect, beforeAll, afterAll } from '../../src/test/api.js';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/security_app');
const TEST_PORT = 3101;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

// Create a basic app structure
async function setupFixture() {
    if (fs.existsSync(FIXTURE_DIR)) fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
    fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });
    fs.mkdirSync(path.join(FIXTURE_DIR, 'public'), { recursive: true });

    fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
        name: 'security-app',
        type: "module",
        dependencies: { react: '18.2.0' }
    }));

    fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.ts'), `
        console.log('Security App Running');
    `);

    fs.writeFileSync(path.join(FIXTURE_DIR, 'public/index.html'), `
        <!DOCTYPE html><body><div id="root">Safe</div></body>
    `);
}

describe('Security Shield & Anomaly Detection (Day 41)', () => {
    let server: any;
    let browser: any;

    beforeAll(async () => {
        await setupFixture();

        // Start Server
        server = await startDevServer({
            root: FIXTURE_DIR,
            entry: ['src/main.ts'],
            port: TEST_PORT,
            mode: 'development',
            // We need 'spa' to ensure HTML is served, but request scanning happens for all requests
            preset: 'spa'
        });

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
    });

    afterAll(async () => {
        if (server) await new Promise<void>(resolve => server.close(() => resolve()));
        if (browser) await browser.close();
        if (fs.existsSync(FIXTURE_DIR)) fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
    });

    it('should block requests containing XSS patterns', async () => {
        const page = await browser.newPage();
        // Attempt XSS via query param often reflected
        const response = await page.goto(`${SERVER_URL}/?query=<script>alert(1)</script>`);

        expect(response.status()).toBe(403);
        const text = await response.text();
        expect(text).toContain('Blocked by Nexxo Security Shield');
        await page.close();
    });

    it('should expose the Security Dashboard with recorded events', async () => {
        const page = await browser.newPage();
        const response = await page.goto(`${SERVER_URL}/__nexxo/security`);

        expect(response.status()).toBe(200);
        const json = await response.json();

        console.log('Security Dashboard:', json);

        // We blocked one request in previous test, so events should be >= 1
        expect(json.totalEvents).toBeGreaterThan(0);
        expect(json.recentEvents.length).toBeGreaterThan(0);
        expect(json.recentEvents[0].type).toBe('xss-attempt');

        await page.close();
    });
});
