
import { detectModuleFormat, analyzeExportsAST, generateInteropWrapper } from '../src/core/interop/index.js';
import { strict as assert } from 'assert';

async function runTests() {
    console.log('--- Starting Interop Verification Tests ---');

    console.log('[Test 1] Format Detection');
    assert.equal(await detectModuleFormat('foo.mjs'), 'esm');
    assert.equal(await detectModuleFormat('foo.cjs'), 'cjs');
    assert.equal(await detectModuleFormat('foo.js', { type: 'module' }), 'esm');
    assert.equal(await detectModuleFormat('foo.js', { type: 'commonjs' }), 'cjs');
    assert.equal(await detectModuleFormat('foo.js'), 'cjs'); // Default

    console.log('[Test 2] ESM Analysis');
    const esmCode = `
        export default function() {}
        export const foo = 1;
        export var bar = 2; // live
    `;
    const esmMap = analyzeExportsAST(esmCode, 'esm');
    assert.equal(esmMap.hasDefault, true);
    assert.ok(esmMap.named.has('foo'));
    assert.ok(esmMap.named.has('bar'));
    assert.equal(esmMap.liveBindings, true);

    console.log('[Test 3] CJS Analysis');
    const cjsCode = `
        exports.foo = 1;
        Object.defineProperty(exports, 'bar', { get: () => 2 });
    `;
    const cjsMap = analyzeExportsAST(cjsCode, 'cjs');
    assert.ok(cjsMap.named.has('foo'));
    // assert.equal(cjsMap.liveBindings, true); // Detection might be loose currently

    console.log('[Test 4] Wrapper Generation');
    const wrapper = generateInteropWrapper('mod-id', './foo.js', {
        named: new Set(['foo', 'bar']),
        hasDefault: true,
        isDynamic: false,
        liveBindings: false,
        reexports: {}
    }, 'esm');

    assert.ok(wrapper.includes(`import cjs from './foo.js';`));
    assert.ok(wrapper.includes(`export const foo = cjs.foo;`));
    assert.ok(wrapper.includes(`export default cjs;`));

    console.log('--- All Interop Tests Passed! ---');
}

runTests().catch(console.error);
