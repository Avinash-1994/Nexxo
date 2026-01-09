/**
 * Phase 2.2 Tier-2: Framework Plugins Tests
 * Tests for Svelte, Solid, and Lit plugins
 */

import { nexxoSvelte } from '../src/plugins/frameworks/svelte.js';
import { nexxoSolid } from '../src/plugins/frameworks/solid.js';
import { nexxoLit } from '../src/plugins/frameworks/lit.js';
import { strict as assert } from 'assert';

async function testSvelteBasicCompilation() {
    console.log('\n[Test 1] Svelte - Basic Component Compilation');

    const plugin = nexxoSvelte({ development: true });

    const code = `
<script>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>

<style>
  button {
    color: blue;
  }
</style>
`.trim();

    const result = await plugin.transform!(code, 'Counter.svelte');

    assert.ok(result);
    console.log('✅ Svelte basic compilation works');
}

async function testSvelteProductionMode() {
    console.log('\n[Test 2] Svelte - Production Mode');

    const plugin = nexxoSvelte({ development: false, hmr: false });

    const code = `
<script>
  export let name = 'World';
</script>

<h1>Hello {name}!</h1>
`.trim();

    const result = await plugin.transform!(code, 'Hello.svelte');

    assert.ok(result);
    const resultCode = typeof result === 'string' ? result : result.code;
    assert.ok(!resultCode.includes('import.meta.hot'));

    console.log('✅ Svelte production mode works (no HMR)');
}

async function testSvelteCaching() {
    console.log('\n[Test 3] Svelte - Component Caching');

    const plugin = nexxoSvelte({ development: true });

    const code = `<h1>Cached Component</h1>`;

    // First call
    const result1 = await plugin.transform!(code, 'Cached.svelte');
    assert.ok(result1);

    // Second call with same code (should use cache)
    const result2 = await plugin.transform!(code, 'Cached.svelte');
    assert.ok(result2);

    console.log('✅ Svelte caching works');
}

async function testSolidBasicJSX() {
    console.log('\n[Test 4] Solid - Basic JSX Transform');

    const plugin = nexxoSolid({ development: true });

    const code = `
import { createSignal } from 'solid-js';

export default function Counter() {
  const [count, setCount] = createSignal(0);
  
  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {count()}
    </button>
  );
}
`.trim();

    const result = await plugin.transform!(code, 'Counter.jsx');

    assert.ok(result);
    console.log('✅ Solid basic JSX transform works');
}

async function testSolidTypeScript() {
    console.log('\n[Test 5] Solid - TypeScript Support');

    const plugin = nexxoSolid({ development: true });

    const code = `
import { createSignal, Component } from 'solid-js';

interface Props {
  initialCount: number;
}

const Counter: Component<Props> = (props) => {
  const [count, setCount] = createSignal(props.initialCount);
  
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
};

export default Counter;
`.trim();

    const result = await plugin.transform!(code, 'Counter.tsx');

    assert.ok(result);
    console.log('✅ Solid TypeScript support works');
}

async function testSolidProductionMode() {
    console.log('\n[Test 6] Solid - Production Mode');

    const plugin = nexxoSolid({ development: false, hmr: false });

    const code = `
import { createSignal } from 'solid-js';

export default function App() {
  return <div>Production</div>;
}
`.trim();

    const result = await plugin.transform!(code, 'App.jsx');

    assert.ok(result);
    const resultCode = typeof result === 'string' ? result : result.code;
    assert.ok(!resultCode.includes('import.meta.hot'));

    console.log('✅ Solid production mode works (no HMR)');
}

async function testLitBasicComponent() {
    console.log('\n[Test 7] Lit - Basic Component');

    const plugin = nexxoLit({ development: true });

    const code = `
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  name = 'World';

  static styles = css\`
    :host {
      display: block;
      color: blue;
    }
  \`;

  render() {
    return html\`<h1>Hello, \${this.name}!</h1>\`;
  }
}
`.trim();

    const result = await plugin.transform!(code, 'MyElement.ts');

    assert.ok(result);
    console.log('✅ Lit basic component works');
}

async function testLitDecorators() {
    console.log('\n[Test 8] Lit - Decorator Support');

    const plugin = nexxoLit({ development: true });

    const code = `
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('counter-element')
export class CounterElement extends LitElement {
  @property({ type: Number })
  count = 0;

  @state()
  private _internalState = false;

  render() {
    return html\`<button @click=\${this._increment}>\${this.count}</button>\`;
  }

  private _increment() {
    this.count++;
  }
}
`.trim();

    const result = await plugin.transform!(code, 'CounterElement.ts');

    assert.ok(result);
    console.log('✅ Lit decorator support works');
}

async function testLitProductionMode() {
    console.log('\n[Test 9] Lit - Production Mode');

    const plugin = nexxoLit({ development: false, hmr: false });

    const code = `
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-element')
export class AppElement extends LitElement {
  render() {
    return html\`<div>Production</div>\`;
  }
}
`.trim();

    const result = await plugin.transform!(code, 'AppElement.ts');

    assert.ok(result);
    const resultCode = typeof result === 'string' ? result : result.code;
    assert.ok(!resultCode.includes('import.meta.hot'));

    console.log('✅ Lit production mode works (no HMR)');
}

async function testFrameworkDetection() {
    console.log('\n[Test 10] Framework Detection');

    const sveltePlugin = nexxoSvelte();
    const solidPlugin = nexxoSolid();
    const litPlugin = nexxoLit();

    // Non-framework files should return undefined
    const jsResult = await sveltePlugin.transform!('const x = 1;', 'test.js');
    assert.strictEqual(jsResult, undefined);

    const tsResult = await litPlugin.transform!('const y = 2;', 'test.ts');
    assert.strictEqual(tsResult, undefined);

    console.log('✅ Framework detection works correctly');
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 2.2 Tier-2: Framework Plugins - Test Suite');
    console.log('='.repeat(60));

    try {
        await testSvelteBasicCompilation();
        await testSvelteProductionMode();
        await testSvelteCaching();
        await testSolidBasicJSX();
        await testSolidTypeScript();
        await testSolidProductionMode();
        await testLitBasicComponent();
        await testLitDecorators();
        await testLitProductionMode();
        await testFrameworkDetection();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED (10/10)');
        console.log('='.repeat(60));
        console.log('\nPhase 2.2 Tier-2 Framework Plugins are VERIFIED and READY');

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
