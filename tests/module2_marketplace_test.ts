
/**
 * Module 2: Zero-Trust Ecosystem - Marketplace MVP Test
 * Validates Day 10 Implementation (tRPC + SQLite + Signer)
 */

import { MarketplaceClient } from '../src/marketplace/client.js';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.resolve('.test_marketplace');

// Simple Stub WASM
const WASM_BYTES = Buffer.from('0061736d01000000', 'hex'); // Just header

async function setup() {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function cleanup() {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

async function testMarketplaceFlow() {
    console.log('🧪 Testing Marketplace Flow...');

    // 1. Setup Dummy Plugin
    const pluginPath = path.join(TEST_DIR, 'my-plugin.wasm');
    fs.writeFileSync(pluginPath, WASM_BYTES);

    const meta = {
        name: 'test-pkg',
        version: '1.0.0',
        author: 'Tester',
        description: 'A test plugin',
        permissions: { network: false }
    };

    // 2. Publish (Should sign and save to SQLite)
    await MarketplaceClient.publish(pluginPath, meta);

    // 3. Search
    const results = await MarketplaceClient.search('test');
    if (results.length === 0) throw new Error('Search failed to find published plugin');
    if (results[0].name !== 'test-pkg') throw new Error('Search result mismatch');

    // 4. Install
    await MarketplaceClient.install('test-pkg', TEST_DIR);

    console.log('✅ Marketplace Flow Passed');
}

async function runTests() {
    try {
        await setup();
        await testMarketplaceFlow();
        console.log('---------------------------');
        console.log('🎉 Day 10 Marketplace MVP Verified!');
    } catch (e: any) {
        console.error('❌ Marketplace Test Failed:', e);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

runTests();
