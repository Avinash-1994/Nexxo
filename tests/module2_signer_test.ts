
/**
 * Module 2: Zero-Trust Ecosystem - Signing System Test
 * Validates Day 9 WebCrypto Implementation
 */

import { PluginSigner } from '../src/plugins/signer.js';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.resolve('.test_signer');

// Simple WASM stub from Day 8
const WASM_HEX = '0061736d0100000001040160000003020100070d01097472616e73666f726d00000a040102000b';
const WASM_BYTES = Buffer.from(WASM_HEX, 'hex');

async function setup() {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function cleanup() {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

async function testSigningFlow() {
    console.log('🧪 Testing Plugin Signing System...');

    // 1. Key Gen
    const startKen = performance.now();
    const keyPair = await PluginSigner.generateKeyPair();
    console.log(`  Key Gen Time: ${(performance.now() - startKen).toFixed(2)}ms`);

    // 2. Create Manifest
    const meta = {
        name: 'test-plugin',
        version: '1.0.0',
        author: 'NexxoBot',
        description: 'Secure Test',
        permissions: {}
    };

    console.log('  Signing Plugin...');
    const manifest = await PluginSigner.createManifest(meta, WASM_BYTES, keyPair);

    // Check fields
    if (!manifest.hash) throw new Error('Missing Hash');
    if (!manifest.signature) throw new Error('Missing Signature');
    if (!manifest.publicKey) throw new Error('Missing Public Key');

    console.log(`  Signature: ${manifest.signature.substring(0, 20)}...`);

    // 3. Verify Valid
    console.log('  Verifying Valid Plugin...');
    const isValid = await PluginSigner.verifyManifest(manifest, WASM_BYTES);
    if (!isValid) throw new Error('Valid plugin failed verification');
    console.log('  ✅ Valid Plugin Verified');

    // 4. Attack: Tampered Binary
    console.log('  Testing Tampered Binary...');
    const tamperedBytes = Buffer.from(WASM_BYTES);
    tamperedBytes[0] = 0xFF; // Corrupt magic number

    const isValidTamper = await PluginSigner.verifyManifest(manifest, tamperedBytes);
    if (isValidTamper) throw new Error('Tampered binary passed verification!');
    console.log('  ✅ Tampered Binary Rejected');

    // 5. Attack: Tampered Signature
    console.log('  Testing Tampered Signature...');
    const tamperedManifest = { ...manifest };
    // Mutate signature (replace first char)
    const oldSig = Buffer.from(tamperedManifest.signature, 'base64');
    oldSig[0] = oldSig[0] ^ 0xFF; // Flip bits
    tamperedManifest.signature = oldSig.toString('base64');

    const isValidSigTamper = await PluginSigner.verifyManifest(tamperedManifest, WASM_BYTES);
    if (isValidSigTamper) throw new Error('Tampered signature passed verification!');
    console.log('  ✅ Tampered Signature Rejected');

    // 6. Attack: Tampered Hash in Manifest (but valid sig? No, verify checks calcHash match too)
    console.log('  Testing Metadata Tamper...');
    const tamperedHashManifest = { ...manifest, hash: 'badhash' };
    const isValidHashTamper = await PluginSigner.verifyManifest(tamperedHashManifest, WASM_BYTES);
    if (isValidHashTamper) throw new Error('Tampered hash passed verification!');
    console.log('  ✅ Tampered Hash Rejected');
}

async function runTests() {
    try {
        await setup();
        await testSigningFlow();
        console.log('---------------------------');
        console.log('🎉 Day 9 Signing System Verified!');
    } catch (e: any) {
        console.error('❌ Signer Test Failed:', e);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

runTests();
