import { verifyPluginSignature } from '../dist/plugins/verify.js';

async function test() {
    const pluginPath = 'src/plugins/samplePlugin.mjs';
    console.log('Testing verification for:', pluginPath);

    const result = await verifyPluginSignature(pluginPath);
    console.log('Verification result:', result);

    if (result) {
        console.log('✅ PASS: Plugin signature verified');
        process.exit(0);
    } else {
        console.log('❌ FAIL: Plugin signature verification failed');
        process.exit(1);
    }
}

test();
