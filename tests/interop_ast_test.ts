
import { analyzeExportsAST } from '../src/core/interop/analyze_ast.js';
import { strict as assert } from 'assert';

async function runTests() {
    console.log('--- Starting AST Interop Verification Tests ---');

    console.log('[Test 1] ESM AST Analysis');
    const esmCode = `
        export default function() {}
        export const foo = 1;
        export var bar = 2; // live
        export { baz } from 'qux';
    `;
    const esmMap = analyzeExportsAST(esmCode, 'esm');
    assert.equal(esmMap.hasDefault, true);
    assert.ok(esmMap.named.has('foo'));
    assert.ok(esmMap.named.has('bar'));
    assert.ok(esmMap.named.has('baz'), 'Should detect re-exported name');
    assert.equal(esmMap.liveBindings, true);

    console.log('[Test 2] CJS AST Analysis');
    const cjsCode = `
        var local = 123;
        exports.foo = 1;
        module.exports.bar = 2;
        Object.defineProperty(exports, 'baz', { get: () => local });
    `;
    const cjsMap = analyzeExportsAST(cjsCode, 'cjs');
    assert.ok(cjsMap.named.has('foo'));
    assert.ok(cjsMap.named.has('bar'));
    assert.ok(cjsMap.named.has('baz'));
    assert.equal(cjsMap.liveBindings, true, 'Should detect getter as live binding');

    console.log('[Test 3] CJS Mixed Assignment');
    const cjsMixed = `
        module.exports = {
            a: 1,
            b: 2
        };
        exports.c = 3;
    `;
    const cjsMixedMap = analyzeExportsAST(cjsMixed, 'cjs');
    assert.equal(cjsMixedMap.hasDefault, true);
    assert.ok(cjsMixedMap.named.has('a'));
    assert.ok(cjsMixedMap.named.has('b'));
    assert.ok(cjsMixedMap.named.has('c'));

    console.log('--- All AST Tests Passed! ---');
}

runTests().catch(console.error);
