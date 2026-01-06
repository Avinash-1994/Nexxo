/**
 * Manual Dev Server for Testing
 * Run this and open manual-test/index.html in browser
 */

import { startDevServer } from './dev-server.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testRoot = path.join(__dirname, '../manual-test');

async function main() {
    console.log('🚀 Starting Manual Test Server...\n');

    const server = await startDevServer(3003, testRoot);
    server.watchDirectory(testRoot);

    console.log('\n✅ Server ready!');
    console.log('\n📝 Instructions:');
    console.log('   1. Open http://localhost:3003 in your browser');
    console.log('   2. Edit manual-test/test.css');
    console.log('   3. Change background color');
    console.log('   4. Save the file');
    console.log('   5. Watch the page update WITHOUT refresh!\n');
    console.log('Press Ctrl+C to stop\n');
}

main().catch(console.error);
