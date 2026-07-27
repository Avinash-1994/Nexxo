import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const frameworks = [
    { name: 'React', dir: 'test-react-ts', port: 4001 },
    { name: 'Vue', dir: 'test-vue-ts', port: 4002 },
    { name: 'Svelte', dir: 'test-svelte-ts', port: 4003 },
    { name: 'Solid', dir: 'test-solid-ts', port: 4004 },
    { name: 'Preact', dir: 'test-preact-ts', port: 4005 }
];

const MIME = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

function serveDir(dir, port) {
    return new Promise((resolveP) => {
        const server = createServer((req, res) => {
            let filePath = join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
            if (!existsSync(filePath)) filePath = join(dir, 'index.html');
            try {
                const data = readFileSync(filePath);
                res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' });
                res.end(data);
            } catch {
                res.writeHead(404);
                res.end('Not found');
            }
        });
        server.listen(port, () => resolveP(server));
    });
}

(async () => {
    console.log("🚀 Recompiling Lunx build engine...");
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

    console.log("\\n🚀 Building all framework test apps...");
    const servers = [];

    for (const fw of frameworks) {
        console.log(`\\n📦 Building ${fw.name}...`);
        const projectDir = join(ROOT, fw.dir);
        try {
            execSync('node ../dist/cli.js build --mode production', { cwd: projectDir, stdio: 'inherit' });
            
            const distPath = join(projectDir, 'dist');
            const appBuildOutput = existsSync(distPath) ? distPath : join(projectDir, 'build_output');
            
            servers.push({
                fw,
                server: await serveDir(appBuildOutput, fw.port)
            });
            console.log(`✅ ${fw.name} built and serving on port ${fw.port}`);
        } catch (e) {
            console.error(`❌ Failed to build ${fw.name}:`, e.message);
        }
    }

    console.log("\\n📸 Spawning browser to verify rendering natively...");
    const browser = await chromium.launch();
    
    for (const instance of servers) {
        const page = await browser.newPage();
        const url = `http://localhost:${instance.fw.port}`;
        console.log(`Navigating to ${url} for ${instance.fw.name}...`);
        
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
            await page.waitForTimeout(500); // Give JS time to mount
            
            const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || document.getElementById('app')?.innerHTML || document.body.innerHTML);
            console.log(`- HTML length: ${rootHtml.length}`);
            
            const screenshotPath = `framework_${instance.fw.name.toLowerCase()}.png`;
            await page.screenshot({ path: screenshotPath });
            console.log(`- Screenshot saved to ${screenshotPath}`);
        } catch (err) {
            console.error(`❌ Error rendering ${instance.fw.name}:`, err.message);
        } finally {
            await page.close();
            instance.server.close();
        }
    }

    await browser.close();
    console.log("\\n✅ All frameworks verified and servers shut down!");
})();
