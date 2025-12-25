
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

const PROJECT_ROOT = '/home/avinash/Desktop/framework_practis/build';
const NEXT_TEST_DIR = path.join(PROJECT_ROOT, 'examples/nextjs-test');
const CLI_PATH = path.join(PROJECT_ROOT, 'src/cli.ts');

async function testRoute(url) {
    return new Promise((resolve) => {
        console.log(`🔍 Testing route: ${url}`);
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`✅ Status: ${res.statusCode}`);
                resolve({
                    status: res.statusCode,
                    content: data,
                    headers: res.headers
                });
            });
        }).on('error', (err) => {
            console.error(`❌ Failed to request ${url}: ${err.message}`);
            resolve(null);
        });
    });
}

async function runTests() {
    console.log('🚀 Starting SSR Verification Tests...');

    // 1. Start SSR Server
    console.log('📡 Starting SSR server in background...');
    const serverProcess = spawn('npx', ['tsx', CLI_PATH, 'ssr', '--framework', 'nextjs', '--port', '3005'], {
        cwd: NEXT_TEST_DIR,
        cwd: NEXT_TEST_DIR,
        stdio: ['ignore', 'pipe', 'pipe'], // Capture output
        env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
    });

    const fs = await import('fs');
    const logStream = fs.createWriteStream(path.join(PROJECT_ROOT, 'ssr-server.log'));
    serverProcess.stdout.pipe(process.stdout);
    serverProcess.stderr.pipe(process.stderr);
    serverProcess.stdout.pipe(logStream);
    serverProcess.stderr.pipe(logStream);

    // Wait for server to boot
    await new Promise(resolve => setTimeout(resolve, 5000));

    const results = [];

    // 2. Test Home Route
    const home = await testRoute('http://localhost:3005/');
    if (home) {
        const hasSSR = home.content.includes('SSR Placeholder') || home.content.includes('Home');
        const hasData = home.content.includes('__INITIAL_DATA__');
        console.log(`   - SSR Content: ${hasSSR ? 'Found' : 'Missing ❌'}`);
        console.log(`   - Initial Data: ${hasData ? 'Found' : 'Missing ❌'}`);
        results.push({ name: 'Home Route', pass: hasSSR && home.status === 200 });
    }

    // 3. Test About Route
    const about = await testRoute('http://localhost:3005/about');
    if (about) {
        const hasAbout = about.content.includes('About');
        if (!hasAbout) {
            console.log('❌ Debug: About content missing. Actual content:');
            console.log(about.content.substring(0, 500));
        }
        results.push({ name: 'About Route', pass: about.status === 200 && hasAbout });
    }

    // 4. Test API Route
    const api = await testRoute('http://localhost:3005/api/hello');
    if (api) {
        console.log(`   - API Response: ${api.content}`);
        results.push({ name: 'API Route', pass: api.status === 200 && api.content.includes('Hello from API') });
    }

    // 5. Test 404
    const errorPage = await testRoute('http://localhost:3005/not-found-page');
    if (errorPage) {
        results.push({ name: '404 Page', pass: errorPage.status === 404 });
    }

    // Cleanup
    // Cleanup
    console.log('🛑 Stopping server...');
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        // Force kill after delay if needed
        setTimeout(() => {
            try { process.kill(serverProcess.pid, 'SIGKILL'); } catch (e) { }
        }, 1000);
    }

    console.log('\n📊 TEST SUMMARY:');
    results.forEach(r => {
        console.log(`${r.pass ? '✅' : '❌'} ${r.name}`);
    });

    if (results.length > 0 && results.every(r => r && r.pass)) {
        console.log('\n🎉 ALL SSR TESTS PASSED!');
        process.exit(0);
    } else {
        console.log('\n❌ SOME TESTS FAILED OR SERVER CRASHED');
        process.exit(1);
    }
}

runTests();
