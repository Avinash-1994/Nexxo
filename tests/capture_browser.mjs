import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const MIME = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.json': 'application/json',
    '.br': 'application/br',
    '.gz': 'application/gz',
};

function serveDir(dir, port) {
    return new Promise((resolveP) => {
        const server = createServer((req, res) => {
            let filePath = join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
            if (!existsSync(filePath)) {
                filePath = join(dir, 'index.html');
            }
            try {
                const data = readFileSync(filePath);
                res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' });
                res.end(data);
            } catch {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/ serving ${dir}`);
            resolveP(server);
        });
    });
}

(async () => {
    const hostDist  = join(ROOT, 'real-world-mfe/host/dist');
    const navDist   = join(ROOT, 'real-world-mfe/nav/dist');

    const [hostServer, navServer] = await Promise.all([
        serveDir(hostDist, 3000),
        serveDir(navDist,  3001),
    ]);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('request', req => console.log(`REQ: ${req.url()}`));
    page.on('response', res => console.log(`RES: ${res.url()} ${res.status()}`));

    console.log('Navigating to http://localhost:3000/');
    try {
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 20000 });
        
        const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'ROOT NOT FOUND');
        console.log('Root HTML length:', rootHtml.length);
        console.log('Root HTML sample:', rootHtml.substring(0, 200));
        
        await page.screenshot({ path: 'mfe-success.png' });
        console.log('Screenshot saved to mfe-success.png');
    } catch (err) {
        console.log('Navigation error:', err.message);
    }

    await browser.close();
    hostServer.close();
    navServer.close();
})();
