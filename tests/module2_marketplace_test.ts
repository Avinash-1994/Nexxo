
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

    // 2. Publish version 1.0.0
    await MarketplaceClient.publish(pluginPath, meta);

    // 3. Publish version 1.1.0
    const metaV2 = { ...meta, version: '1.1.0', description: 'A second test plugin version' };
    await MarketplaceClient.publish(pluginPath, metaV2);

    // 4. Search
    const results = await MarketplaceClient.search('test');
    if (results.length < 2) throw new Error('Search failed to return multiple plugin versions');
    if (!results.some(r => r.version === '1.0.0')) throw new Error('Search missing version 1.0.0');
    if (!results.some(r => r.version === '1.1.0')) throw new Error('Search missing version 1.1.0');

    // 5. List versions
    const versions = await MarketplaceClient.listVersions('test-pkg');
    if (versions.length !== 2) throw new Error('Version listing should return both published versions');
    if (versions[0].version !== '1.1.0') throw new Error('Latest version should be listed first');

    // 6. Install latest (should choose 1.1.0)
    const latestInstallPath = await MarketplaceClient.install('test-pkg', TEST_DIR);
    if (!latestInstallPath || !fs.existsSync(latestInstallPath)) {
        throw new Error('Installed plugin directory does not exist');
    }
    const latestArtifactFile = path.join(latestInstallPath, 'plugin-1.1.0.wasm');
    if (!fs.existsSync(latestArtifactFile)) {
        throw new Error('Installed latest plugin artifact is missing');
    }

    // 7. Install specific version
    const specificInstallPath = await MarketplaceClient.install('test-pkg', TEST_DIR, '1.0.0');
    if (!specificInstallPath || !fs.existsSync(specificInstallPath)) {
        throw new Error('Installed plugin directory does not exist for specific version');
    }
    const specificArtifactFile = path.join(specificInstallPath, 'plugin-1.0.0.wasm');
    if (!fs.existsSync(specificArtifactFile)) {
        throw new Error('Installed specific plugin artifact is missing');
    }

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
