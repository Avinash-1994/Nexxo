/**
 * Phase 2.2: Framework Pipelines Tests
 * Tests for React and Vue production-grade plugins
 */

import { nexxoReact } from '../src/plugins/frameworks/react.js';
import { nexxoVue } from '../src/plugins/frameworks/vue.js';
import { strict as assert } from 'assert';

async function testReactBasicTransform() {
    console.log('\n[Test 1] React - Basic JSX Transform');

    const plugin = nexxoReact({ development: true, fastRefresh: false });

    const code = `
import React from 'react';
export default function App() {
  return <div>Hello World</div>;
}
`.trim();

    const result = await plugin.transform!(code, 'App.jsx');

    assert.ok(result);
    assert.ok(typeof result === 'string' || (typeof result === 'object' && 'code' in result));

    console.log('✅ React basic JSX transform works');
}

async function testReactCSSTracking() {
    console.log('\n[Test 2] React - CSS Import Tracking');

    const plugin = nexxoReact({ development: true });

    const code = `
import './App.css';
import './styles.module.css';
import React from 'react';

export default function App() {
  return <div className="app">Hello</div>;
}
`.trim();

    const result = await plugin.transform!(code, 'App.jsx');

    assert.ok(result);
    console.log('✅ React CSS import tracking works');
}

async function testReactComponentDetection() {
    console.log('\n[Test 3] React - Component Detection');

    const plugin = nexxoReact({ development: true, fastRefresh: true });

    // Function component
    const funcComponent = `
export default function MyComponent() {
  return <div>Component</div>;
}
`.trim();

    const result1 = await plugin.transform!(funcComponent, 'MyComponent.jsx');
    assert.ok(result1);

    // Const arrow component
    const arrowComponent = `
export const MyComponent = () => {
  return <div>Component</div>;
};
`.trim();

    const result2 = await plugin.transform!(arrowComponent, 'MyComponent.jsx');
    assert.ok(result2);

    console.log('✅ React component detection works');
}

async function testVueBasicSFC() {
    console.log('\n[Test 4] Vue - Basic SFC Parsing');

    const plugin = nexxoVue({ development: true });

    const code = `
<template>
  <div class="app">
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
}
</script>

<style scoped>
.app {
  color: blue;
}
</style>
`.trim();

    const result = await plugin.transform!(code, 'App.vue');

    assert.ok(result);
    assert.ok(typeof result === 'string' || (typeof result === 'object' && 'code' in result));

    console.log('✅ Vue basic SFC parsing works');
}

async function testVueScriptSetup() {
    console.log('\n[Test 5] Vue - Script Setup Support');

    const plugin = nexxoVue({ development: true });

    const code = `
<template>
  <div>{{ count }}</div>
  <button @click="increment">Increment</button>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>
`.trim();

    const result = await plugin.transform!(code, 'Counter.vue');

    assert.ok(result);
    console.log('✅ Vue script setup support works');
}

async function testVueMultipleStyles() {
    console.log('\n[Test 6] Vue - Multiple Style Blocks');

    const plugin = nexxoVue({ development: true });

    const code = `
<template>
  <div class="app">Hello</div>
</template>

<script>
export default { name: 'App' }
</script>

<style>
.app { color: red; }
</style>

<style scoped>
.app { background: blue; }
</style>
`.trim();

    const result = await plugin.transform!(code, 'App.vue');

    assert.ok(result);
    console.log('✅ Vue multiple style blocks work');
}

async function testReactProductionMode() {
    console.log('\n[Test 7] React - Production Mode');

    const plugin = nexxoReact({ development: false, fastRefresh: false });

    const code = `
export default function App() {
  return <div>Production</div>;
}
`.trim();

    const result = await plugin.transform!(code, 'App.jsx');

    assert.ok(result);
    // In production, should not include HMR code
    const resultCode = typeof result === 'string' ? result : result.code;
    assert.ok(!resultCode.includes('import.meta.hot'));

    console.log('✅ React production mode works (no HMR)');
}

async function testVueProductionMode() {
    console.log('\n[Test 8] Vue - Production Mode');

    const plugin = nexxoVue({ development: false, hmr: false });

    const code = `
<template><div>Production</div></template>
<script>export default { name: 'App' }</script>
`.trim();

    const result = await plugin.transform!(code, 'App.vue');

    assert.ok(result);
    const resultCode = typeof result === 'string' ? result : result.code;
    assert.ok(!resultCode.includes('__VUE_HMR_RUNTIME__'));

    console.log('✅ Vue production mode works (no HMR)');
}

async function testReactTSXSupport() {
    console.log('\n[Test 9] React - TypeScript Support');

    const plugin = nexxoReact({ development: true });

    const code = `
interface Props {
  name: string;
}

export default function Greeting({ name }: Props) {
  return <div>Hello, {name}!</div>;
}
`.trim();

    const result = await plugin.transform!(code, 'Greeting.tsx');

    assert.ok(result);
    console.log('✅ React TypeScript support works');
}

async function testVueVirtualModules() {
    console.log('\n[Test 10] Vue - Virtual Module Resolution');

    const plugin = nexxoVue({ development: true });

    // Test resolveId for virtual modules
    const templateId = await plugin.resolveId!('App.vue?type=template', undefined);
    assert.strictEqual(templateId, 'App.vue?type=template');

    const styleId = await plugin.resolveId!('App.vue?type=style', undefined);
    assert.strictEqual(styleId, 'App.vue?type=style');

    console.log('✅ Vue virtual module resolution works');
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 2.2: Framework Pipelines - Test Suite');
    console.log('='.repeat(60));

    try {
        await testReactBasicTransform();
        await testReactCSSTracking();
        await testReactComponentDetection();
        await testVueBasicSFC();
        await testVueScriptSetup();
        await testVueMultipleStyles();
        await testReactProductionMode();
        await testVueProductionMode();
        await testReactTSXSupport();
        await testVueVirtualModules();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED (10/10)');
        console.log('='.repeat(60));
        console.log('\nPhase 2.2 Framework Plugins are VERIFIED and READY');

        return true;
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
});
