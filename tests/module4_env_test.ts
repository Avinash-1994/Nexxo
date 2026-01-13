
/**
 * Module 4: Environment API Test
 * Validates Day 26 Unified HMR & Config
 */

import { NexxoEnv } from '../src/env/api.js';

async function runEnvTest() {
    console.log('🧪 Testing Environment API...');

    // 1. Initialize
    const env = NexxoEnv.init({
        mode: 'development',
        ssr: true,
        base: '/'
    });

    if (NexxoEnv.get().config.mode !== 'development') {
        throw new Error('Config mismatch');
    }
    console.log('  ✅ Env Initialization Verified');

    // 2. Test HMR Propagation
    console.log('  Scenario 1: HMR Event...');
    let receivedPayload = null;

    env.onHMR((payload) => {
        receivedPayload = payload;
    });

    const update = { type: 'js-update', path: '/app.js' };
    env.triggerHMR(update);

    if (receivedPayload !== update) throw new Error('HMR Payload Mismatch');
    console.log('  ✅ UDP/HMR Signal Propagated');

    console.log('---------------------------');
    console.log('🎉 Day 26 Env API Verified!');
}

runEnvTest().catch(e => {
    console.error('❌ Env Test Failed:', e);
    process.exit(1);
});
