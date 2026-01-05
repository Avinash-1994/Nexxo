// Test each framework individually to see exact errors
import { UniversalTransformer } from '../src/core/universal-transformer.js';

const transformer = new UniversalTransformer(process.cwd());

async function testFramework(name: string, code: string, filePath: string, framework: any) {
    console.log(`\n[${name}]`);
    try {
        const result = await transformer.transform({
            filePath,
            code,
            framework,
            root: process.cwd(),
            isDev: true
        });

        const hasHMR = result.code.includes('import.meta.hot') || result.code.includes('createHotContext');
        console.log(`✅ ${name}: Transform OK, HMR: ${hasHMR}`);
        if (!hasHMR) {
            console.log('⚠️ Missing HMR injection!');
        }
        return true;
    } catch (e: any) {
        console.error(`❌ ${name}: FAILED`);
        console.error(`   Error: ${e.message}`);
        if (e.stack) {
            console.error(`   Stack: ${e.stack.split('\n').slice(0, 3).join('\n')}`);
        }
        return false;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('INDIVIDUAL FRAMEWORK TESTS');
    console.log('='.repeat(60));

    const tests = [
        ['React', 'export default () => <div>test</div>', '/test/App.tsx', 'react'],
        ['Vue', '<template><div>test</div></template>\n<script setup>\n</script>', '/test/App.vue', 'vue'],
        ['Svelte', '<script>let x = 1;</script>\n<div>{x}</div>', '/test/App.svelte', 'svelte'],
        ['Solid', 'import {createSignal} from "solid-js"; export default () => { const [x] = createSignal(0); return <div>{x()}</div>; }', '/test/App.tsx', 'solid'],
        ['Lit', 'import {LitElement, html} from "lit"; export class MyEl extends LitElement { render() { return html`<div>test</div>`; } }', '/test/my-el.ts', 'lit'],
        ['Angular', 'import {Component} from "@angular/core"; @Component({selector: "app", template: "<div>test</div>"}) export class AppComponent {}', '/test/app.component.ts', 'angular'],
        ['Preact', 'import {h} from "preact"; export default () => <div>test</div>', '/test/App.tsx', 'preact'],
        ['Vanilla', 'export class Test { x = 1; }', '/test/test.ts', 'vanilla']
    ];

    let passed = 0;
    let failed = 0;

    for (const [name, code, filePath, framework] of tests) {
        const result = await testFramework(name as string, code as string, filePath as string, framework);
        if (result) passed++;
        else failed++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`RESULTS: ${passed}/${tests.length} passed, ${failed} failed`);
    console.log('='.repeat(60));

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
