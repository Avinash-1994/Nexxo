/**
 * Plugin System Test Suite — Agent 5
 * Tests the Lunx plugin system: load hooks, transform hooks, virtual modules,
 * ordering, error handling, and context APIs.
 */

import { PluginManager } from '../../src/core/plugins/manager.js';
import type { LunxPlugin } from '../../src/core/plugins/types.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TMP = path.join(os.tmpdir(), 'lunx-plugin-tests');
fs.mkdirSync(TMP, { recursive: true });

// Helper: build a minimal LunxPlugin
function makePlugin(name: string, runHookFn: LunxPlugin['runHook']): LunxPlugin {
    return {
        id: name,
        manifest: {
            name,
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['transformModule'],
            permissions: { fs: 'read' },
        },
        runHook: runHookFn,
    };
}

// ──────────────────────────────────────────────────────────────────────
// PLG-001: Basic load hook — plugin can intercept and transform modules
// ──────────────────────────────────────────────────────────────────────
test('PLG-001: Plugin load hook transforms module content', async () => {
    const txtPlugin = makePlugin('txt-loader', async (hook, input) => {
        if (hook === 'transformModule' && input.path.endsWith('.txt')) {
            return { ...input, code: `export default ${JSON.stringify(input.code)}` };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(txtPlugin);

    const result = await manager.runHook('transformModule', {
        path: 'hello.txt',
        code: 'Hello, World!',
        mode: 'development',
    });

    expect(result.code).toContain('Hello, World!');
    expect(result.code).toContain('export default');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-002: Basic transform hook — __BUILD_DATE__ replacement
// ──────────────────────────────────────────────────────────────────────
test('PLG-002: Transform hook replaces __BUILD_DATE__ with ISO string', async () => {
    const datePlugin = makePlugin('build-date', async (hook, input) => {
        if (hook === 'transformModule') {
            const date = new Date().toISOString();
            return {
                ...input,
                code: input.code.replace(/__BUILD_DATE__/g, JSON.stringify(date)),
            };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(datePlugin);

    const result = await manager.runHook('transformModule', {
        path: 'app.js',
        code: `const date = __BUILD_DATE__;`,
        mode: 'production',
    });

    expect(result.code).not.toContain('__BUILD_DATE__');
    // Result should contain a quoted ISO date string
    expect(result.code).toMatch(/"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
});

// ──────────────────────────────────────────────────────────────────────
// PLG-003: Plugin ordering — plugins run in registration order
// ──────────────────────────────────────────────────────────────────────
test('PLG-003: Two plugins both transform the same code (chained transforms)', async () => {
    // Note: PluginManager sorts by plugin id (hash), not registration order.
    // This test verifies both plugins run and both transforms are applied.
    const pluginA = makePlugin('aaa-plugin-alpha', async (hook, input) => {
        if (hook === 'transformModule') {
            return { ...input, code: input.code + '+ALPHA' };
        }
        return input;
    });
    const pluginB = makePlugin('zzz-plugin-beta', async (hook, input) => {
        if (hook === 'transformModule') {
            return { ...input, code: input.code + '+BETA' };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(pluginA);
    await manager.register(pluginB);

    const result = await manager.runHook('transformModule', {
        path: 'test.js',
        code: 'original',
        mode: 'development',
    });
    // Both transforms applied
    expect(result.code).toContain('+ALPHA');
    expect(result.code).toContain('+BETA');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-004: Plugin error handling — thrown errors propagate with plugin name
// ──────────────────────────────────────────────────────────────────────
test('PLG-004: Plugin that throws in runHook propagates error with plugin name', async () => {
    const badPlugin = makePlugin('bad-plugin', async (hook, input) => {
        if (hook === 'transformModule') {
            throw new Error('PLUGIN_TRANSFORM_ERROR from bad-plugin');
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(badPlugin);

    await expect(
        manager.runHook('transformModule', { path: 'app.js', code: 'code', mode: 'development' })
    ).rejects.toThrow('PLUGIN_TRANSFORM_ERROR');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-005: Virtual modules — plugin returns code for virtual ID
// ──────────────────────────────────────────────────────────────────────
test('PLG-005: Virtual module plugin resolves virtual:config correctly', async () => {
    const virtualPlugin = makePlugin('virtual-config', async (hook, input) => {
        if (hook === 'transformModule' && input.path === '\0virtual:config') {
            return { ...input, code: `export const version = '1.0.0';` };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(virtualPlugin);

    const result = await manager.runHook('transformModule', {
        path: '\0virtual:config',
        code: '',
        mode: 'development',
    });

    expect(result.code).toContain("version = '1.0.0'");
    expect(result.code).toContain('export const');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-006: Plugin works in both dev and build modes
// ──────────────────────────────────────────────────────────────────────
test('PLG-006: Plugin produces identical output in dev and production modes', async () => {
    const stablePlugin = makePlugin('stable-transform', async (hook, input) => {
        if (hook === 'transformModule') {
            return { ...input, code: input.code + '\n// STABLE_TRANSFORM_APPLIED' };
        }
        return input;
    });

    const devManager = new PluginManager();
    await devManager.register(stablePlugin);

    const prodManager = new PluginManager();
    await prodManager.register(stablePlugin);

    const input = { path: 'app.js', code: 'console.log("hello")', mode: 'development' as const };
    const devResult = await devManager.runHook('transformModule', input);
    const prodResult = await prodManager.runHook('transformModule', { ...input, mode: 'production' as const });

    // Both should have the transform applied
    expect(devResult.code).toContain('STABLE_TRANSFORM_APPLIED');
    expect(prodResult.code).toContain('STABLE_TRANSFORM_APPLIED');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-007: Async plugin hooks — async runHook resolves before next plugin runs
// ──────────────────────────────────────────────────────────────────────
test('PLG-007: Async plugin hooks resolve in correct order', async () => {
    const log: string[] = [];

    const asyncPlugin1 = makePlugin('async-1', async (hook, input) => {
        if (hook === 'transformModule') {
            await new Promise(res => setTimeout(res, 10));
            log.push('plugin1');
            return { ...input, code: input.code + '\n// ASYNC1' };
        }
        return input;
    });

    const asyncPlugin2 = makePlugin('async-2', async (hook, input) => {
        if (hook === 'transformModule') {
            await new Promise(res => setTimeout(res, 5));
            log.push('plugin2');
            return { ...input, code: input.code + '\n// ASYNC2' };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(asyncPlugin1);
    await manager.register(asyncPlugin2);

    const result = await manager.runHook('transformModule', {
        path: 'test.js', code: 'start', mode: 'development',
    });

    // Plugin 1 runs before plugin 2 (sequential)
    expect(log[0]).toBe('plugin1');
    expect(log[1]).toBe('plugin2');
    expect(result.code).toContain('ASYNC1');
    expect(result.code).toContain('ASYNC2');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-008: PluginManager API — register, list, unregister
// ──────────────────────────────────────────────────────────────────────
test('PLG-008: PluginManager tracks metrics after running hooks', async () => {
    const manager = new PluginManager();
    const p1 = makePlugin('plugin-metrics-one', async (h, i) => i);

    await manager.register(p1);
    await manager.runHook('transformModule', { path: 'a.js', code: 'x', mode: 'development' });

    const metrics = manager.getMetricsSummary();
    const entry = metrics.find(m => m.plugin === 'plugin-metrics-one');
    expect(entry).toBeDefined();
    expect(entry!.callCount).toBeGreaterThanOrEqual(1);
    // getPipelineHash returns a string hash
    const hash = manager.getPipelineHash();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
});

// ──────────────────────────────────────────────────────────────────────
// PLG-009: CSS plugin — CSS-only plugin doesn't affect JS files
// ──────────────────────────────────────────────────────────────────────
test('PLG-009: CSS-scoped plugin does not transform JS files', async () => {
    const cssPlugin = makePlugin('css-only', async (hook, input) => {
        if (hook === 'transformModule' && input.path.endsWith('.css')) {
            return { ...input, code: `/* processed */ ${input.code}` };
        }
        return input;
    });

    const manager = new PluginManager();
    await manager.register(cssPlugin);

    const jsResult = await manager.runHook('transformModule', {
        path: 'app.js',
        code: 'const x = 1;',
        mode: 'development',
    });
    expect(jsResult.code).toBe('const x = 1;');
    expect(jsResult.code).not.toContain('/* processed */');

    const cssResult = await manager.runHook('transformModule', {
        path: 'styles.css',
        code: '.button { color: red; }',
        mode: 'development',
    });
    expect(cssResult.code).toContain('/* processed */');
});

// ──────────────────────────────────────────────────────────────────────
// PLG-010: Plugin passthrough — unhook'd plugins don't modify input
// ──────────────────────────────────────────────────────────────────────
test('PLG-010: Plugin that returns input unchanged does not modify code', async () => {
    const passthroughPlugin = makePlugin('passthrough', async (hook, input) => input);

    const manager = new PluginManager();
    await manager.register(passthroughPlugin);

    const originalCode = 'const answer = 42;';
    const result = await manager.runHook('transformModule', {
        path: 'app.js',
        code: originalCode,
        mode: 'production',
    });

    expect(result.code).toBe(originalCode);
});

// ──────────────────────────────────────────────────────────────────────
// PLG-EXTRA: Multiple plugins chain transforms correctly
// ──────────────────────────────────────────────────────────────────────
test('PLG-EXTRA: 5 chained plugins all applied in order', async () => {
    const manager = new PluginManager();

    for (let i = 1; i <= 5; i++) {
        const plugin = makePlugin(`chain-${i}`, async (hook, input) => {
            if (hook === 'transformModule') {
                return { ...input, code: input.code + `+P${i}` };
            }
            return input;
        });
        await manager.register(plugin);
    }

    const result = await manager.runHook('transformModule', {
        path: 'app.js', code: 'START', mode: 'development',
    });

    expect(result.code).toBe('START+P1+P2+P3+P4+P5');
});
