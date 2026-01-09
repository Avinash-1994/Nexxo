
import { startDevServer } from '../../src/dev/devServer.js';
import { BuildConfig } from '../../src/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testRoot = path.resolve(__dirname, '../../test-battle-app');

async function setupProject() {
    console.log('🚀 Setting up Battle Test Project...');

    await fs.mkdir(testRoot, { recursive: true });
    await fs.mkdir(path.join(testRoot, 'src'), { recursive: true });
    await fs.mkdir(path.join(testRoot, 'public'), { recursive: true });

    // Create nexxo.config.js
    await fs.writeFile(path.join(testRoot, 'nexxo.config.js'), `
    export default {
      root: process.cwd(),
      entry: ["src/main.js"],
      server: { port: 3005 }
    };
  `);

    // Create index.html
    await fs.writeFile(path.join(testRoot, 'index.html'), `
    <!DOCTYPE html>
    <html>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.js"></script>
    </body>
    </html>
  `);

    // Create main.js
    await fs.writeFile(path.join(testRoot, 'src/main.js'), `
    import { render } from './render.js';
    render();
    if (import.meta.hot) {
      import.meta.hot.accept('./render.js', () => {
        render();
      });
    }
  `);

    // Create render.js
    await fs.writeFile(path.join(testRoot, 'src/render.js'), `
    export function render() {
      document.getElementById('root').innerHTML = '<h1>Battle Test: Generation 0</h1>';
    }
  `);

    console.log('✅ Project setup complete');
}

async function runBattleTest() {
    await setupProject();

    const config: BuildConfig = {
        root: testRoot,
        entry: ['src/main.js'],
        server: { port: 3005 }
    } as any;

    console.log('🔥 Starting Dev Server for Battle Test...');
    const server = await startDevServer(config);

    // Wait for warmup
    await new Promise(r => setTimeout(r, 2000));

    const ws = new WebSocket('ws://localhost:3005');
    let updateCount = 0;
    const targetUpdates = 100;

    return new Promise((resolve, reject) => {
        ws.on('open', async () => {
            console.log('📡 Connected to HMR via WebSocket');

            const start = Date.now();

            for (let i = 1; i <= targetUpdates; i++) {
                // Change file
                const content = `
          export function render() {
            document.getElementById('root').innerHTML = '<h1>Battle Test: Generation ${i}</h1>';
          }
        `;
                await fs.writeFile(path.join(testRoot, 'src/render.js'), content);

                // Wait for HMR message
                await new Promise((res) => {
                    const onMessage = (data: any) => {
                        const msg = JSON.parse(data.toString());
                        if (msg.type === 'update' || msg.type === 'reload' || msg.type === 'update-css') {
                            updateCount++;
                            ws.off('message', onMessage);
                            res(true);
                        }
                    };
                    ws.on('message', onMessage);

                    // Timeout for single update
                    setTimeout(() => {
                        ws.off('message', onMessage);
                        res(false);
                    }, 1000);
                });

                if (i % 10 === 0) {
                    console.log(`📊 Progress: ${i}/${targetUpdates} updates successful`);
                }
            }

            const duration = Date.now() - start;
            const avgTime = duration / targetUpdates;

            console.log('\n' + '='.repeat(40));
            console.log('🏁 BATTLE TEST RESULTS');
            console.log('='.repeat(40));
            console.log(`Success Rate: ${(updateCount / targetUpdates * 100).toFixed(1)}%`);
            console.log(`Avg HMR Latency: ${avgTime.toFixed(2)}ms`);
            console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
            console.log('='.repeat(40));

            ws.close();
            if (updateCount >= targetUpdates * 0.95) { // 95% threshold
                console.log('✅ BATTLE TEST PASSED');
                resolve(true);
            } else {
                console.log('❌ BATTLE TEST FAILED');
                reject(new Error(`Success rate too low: ${updateCount}/${targetUpdates}`));
            }
        });

        ws.on('error', (err) => {
            console.error('❌ WebSocket Error:', err);
            reject(err);
        });
    });
}

// Global timeout
const TIMEOUT = 60000;
setTimeout(() => {
    console.error('❌ Test timed out!');
    process.exit(1);
}, TIMEOUT);

runBattleTest()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Battle test failed:', err);
        process.exit(1);
    });
