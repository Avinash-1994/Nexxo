// Test for Visual Builder Server
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function test() {
    console.log('Testing Visual Builder...\n');

    let builderProcess;

    try {
        // 1. Test that builder command exists
        console.log('1. Testing builder command exists...');
        const { stdout } = await execAsync('node dist/cli.js --help');
        if (!stdout.includes('builder')) {
            throw new Error('Builder command not found in help');
        }
        console.log('   ✅ Builder command exists\n');

        // 2. Test builder server (quick start/stop)
        console.log('2. Testing builder server startup...');
        builderProcess = exec('node dist/cli.js builder --port 3031 --no-open');

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Test API endpoint
        console.log('3. Testing API endpoint...');
        const response = await fetch('http://localhost:3031/api/config');
        if (!response.ok) {
            throw new Error('Config API endpoint failed');
        }
        const config = await response.json();
        console.log('   ✅ Config API works:', JSON.stringify(config, null, 2).substring(0, 100) + '...\n');

        // 4. Test builder UI loads
        console.log('4. Testing Builder UI loads...');
        const uiResponse = await fetch('http://localhost:3031/');
        if (!uiResponse.ok) {
            throw new Error('Builder UI failed to load');
        }
        const html = await uiResponse.text();
        if (!html.includes('Urja Builder')) {
            throw new Error('Builder UI content incorrect');
        }
        console.log('   ✅ Builder UI loads correctly\n');

        console.log('🎉 All builder tests passed!\n');

        // Cleanup
        builderProcess.kill();
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (builderProcess) builderProcess.kill();
        process.exit(1);
    }
}

test();
