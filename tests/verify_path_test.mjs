import path from 'path';
import { verifyPluginSignature } from '../dist/plugins/verify.js';

async function test() {
    console.log('Current working directory:', process.cwd());

    const pluginCandidate = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs');
    console.log('Plugin path:', pluginCandidate);

    const signed = await verifyPluginSignature(pluginCandidate).catch((e) => {
        console.error('Error during verification:', e);
        return false;
    });

    console.log('Verification result:', signed);

    if (signed) {
        console.log('✅ Plugin is signed and verified');
    } else {
        console.log('❌ Plugin signature verification failed');
    }
}

test();
