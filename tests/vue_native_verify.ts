import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import { strict as assert } from 'assert';

// Locate native binary
const nativePath = path.resolve(process.cwd(), 'lunx_native.node');
console.log('Loading native binary from:', nativePath);
const { NativeWorker } = require(nativePath);

async function testVueNative() {
    console.log('🧪 Testing Native Vue Transform...');
    const worker = new NativeWorker(4);

    const vueCode = `
<script>
export default {
  data() { return { count: 0 } }
}
</script>
<template>
  <div class="app">Hello {{ count }}</div>
</template>
<style>
.app { color: red; }
</style>
    `;

    try {
        const result = worker.transformSync({
            path: 'test.vue',
            content: vueCode,
            loader: 'vue',
            minify: false
        });

        // console.log('Output Code:\n', result.code);

        assert.ok(result.code.includes('__sfc_main.template = `'), 'Template not injected');
        // Rust SWC might change export default syntax specificities, but based on my glue code:
        assert.ok(result.code.includes('exports.default = __sfc_main'), 'Default export not wired up');

        // Check template extraction
        assert.ok(result.code.includes('class="app"'), 'Template content missing');

        console.log('✅ Native Vue Transform Verified!');
    } catch (e) {
        console.error('❌ Vue Native Test Failed:', e);
        process.exit(1);
    }
}

testVueNative();
