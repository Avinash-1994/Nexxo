
/**
 * Module 3: Elite DX - Framework HMR Logic Test
 * Validates Day 20 HMR Strategies for React/Vue/Angular
 */

import { HMREngine } from '../src/dev/hmr-v2.js';

async function runHMRTest() {
    console.log('🧪 Testing Framework HMR Logic...');

    const engine = new HMREngine('/app');

    // Scenario 1: React Fast Refresh
    // App.tsx is self-accepting (handled by react-refresh)
    console.log('  Scenario 1: React Fast Refresh (App.tsx)...');
    engine.registerModule('/app/src/App.tsx', [], true);
    const updateReact = engine.propagateUpdate('/app/src/App.tsx');

    if (updateReact?.type !== 'js-update' || updateReact.acceptedPath !== '/app/src/App.tsx') {
        throw new Error(`React HMR Failed. Got: ${JSON.stringify(updateReact)}`);
    }
    console.log('  ✅ React Component Hot Updated');

    // Scenario 2: Vue SFC
    // Component.vue is self-accepting
    console.log('  Scenario 2: Vue SFC (Comp.vue)...');
    engine.registerModule('/app/src/Comp.vue', [], true);
    const updateVue = engine.propagateUpdate('/app/src/Comp.vue');

    if (updateVue?.type !== 'js-update') throw new Error('Vue HMR Failed');
    console.log('  ✅ Vue SFC Hot Updated');

    // Scenario 3: CSS Injection
    console.log('  Scenario 3: Global Styles (global.css)...');
    // CSS is implicitly self-accepting in our engine
    engine.registerModule('/app/src/global.css', [], false); // Engine handles CSS magic
    const updateCss = engine.propagateUpdate('/app/src/global.css');
    if (updateCss?.type !== 'css-update') throw new Error('CSS HMR Failed');
    console.log('  ✅ CSS Hot Injected');

    // Scenario 4: Shared Utility (Bubble Up)
    // utils.ts imported by App.tsx. utils.ts is NOT self-accepting.
    // App.tsx IS self-accepting.
    console.log('  Scenario 4: Dependency Update (utils.ts -> App.tsx)...');
    engine.registerModule('/app/src/utils.ts', [], false);
    // Re-register App.tsx to depend on utils.ts
    // Note: HMREngine.registerModule updates if exists
    engine.registerModule('/app/src/App.tsx', ['/app/src/utils.ts'], true);

    const updateUtils = engine.propagateUpdate('/app/src/utils.ts');

    // Should bubble to App.tsx and be accepted there
    if (updateUtils?.type !== 'js-update' || updateUtils.acceptedPath !== '/app/src/App.tsx') {
        // Wait, did I implement bubble up in Day 5? 
        // Let's check Day 5 HMREngine logic in memory/summary.
        // Step 913 view_file showed:
        // "Check if all importers can accept this update... if any importer is self-accepting... return acceptedPath: importerId"
        // Yes, Day 5 logic supports bubbling.
        throw new Error(`Bubble Up Failed. Got: ${JSON.stringify(updateUtils)}`);
    }
    console.log('  ✅ Dependency Update Bubbled to React Boundary');

    // Scenario 5: Angular/Entry Point (Full Reload)
    // main.ts imports App.tsx. main.ts is NOT self-accepting.
    // If main.ts changes, it reloads.
    console.log('  Scenario 5: Entry Point (main.ts)...');
    engine.registerModule('/app/src/main.ts', ['/app/src/App.tsx'], false);
    const updateMain = engine.propagateUpdate('/app/src/main.ts');

    if (updateMain?.type !== 'full-reload') throw new Error('Entry point did not trigger Full Reload');
    console.log('  ✅ Entry Point Modification Triggers Reload');

    console.log('---------------------------');
    console.log('🎉 Day 20 Framework DX Verified!');
}

runHMRTest().catch(e => {
    console.error('❌ HMR Logic Test Failed:', e);
    process.exit(1);
});
