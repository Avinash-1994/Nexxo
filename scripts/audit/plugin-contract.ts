#!/usr/bin/env node
/**
 * Nexxo Stability Audit — Plugin Contract Check
 * 
 * Verifies that plugin hook signatures have not changed.
 * Ensures backward compatibility for all plugins.
 * 
 * Exit codes:
 *   0 - No changes detected
 *   1 - Breaking changes detected (blocks release)
 * 
 * @see docs/internal/PLUGIN_CONTRACT.md
 * @see docs/internal/STABILITY_AUDIT.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

interface PluginHook {
    name: string;
    parameters: string[];
    returnType: string;
    optional: boolean;
}

interface PluginContractBaseline {
    version: string;
    hooks: PluginHook[];
    timestamp: string;
}

const EXPECTED_HOOKS: PluginHook[] = [
    {
        name: 'name',
        parameters: [],
        returnType: 'string',
        optional: false,
    },
    {
        name: 'transform',
        parameters: ['code: string', 'id: string'],
        returnType: '{ code: string; map?: SourceMap } | null',
        optional: true,
    },
    {
        name: 'load',
        parameters: ['id: string'],
        returnType: '{ code: string; map?: SourceMap } | null',
        optional: true,
    },
    {
        name: 'resolveId',
        parameters: ['source: string', 'importer?: string'],
        returnType: 'string | null',
        optional: true,
    },
    {
        name: 'enforce',
        parameters: [],
        returnType: "'pre' | 'post' | undefined",
        optional: true,
    },
    {
        name: 'apply',
        parameters: [],
        returnType: "'build' | 'serve' | 'all' | undefined",
        optional: true,
    },
];

async function loadBaseline(): Promise<PluginContractBaseline | null> {
    const baselinePath = path.join(ROOT, '.governance/plugin-contract-baseline.json');

    try {
        const content = await fs.readFile(baselinePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

async function saveBaseline(hooks: PluginHook[], version: string): Promise<void> {
    const baselinePath = path.join(ROOT, '.governance/plugin-contract-baseline.json');
    const baseline: PluginContractBaseline = {
        version,
        hooks,
        timestamp: new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));
}

function compareHooks(baseline: PluginHook[], current: PluginHook[]): {
    added: PluginHook[];
    removed: PluginHook[];
    changed: PluginHook[];
} {
    const baselineMap = new Map(baseline.map(h => [h.name, h]));
    const currentMap = new Map(current.map(h => [h.name, h]));

    const added: PluginHook[] = [];
    const removed: PluginHook[] = [];
    const changed: PluginHook[] = [];

    for (const [name, hook] of currentMap) {
        if (!baselineMap.has(name)) {
            added.push(hook);
        }
    }

    for (const [name, hook] of baselineMap) {
        if (!currentMap.has(name)) {
            removed.push(hook);
        }
    }

    for (const [name, currentHook] of currentMap) {
        const baselineHook = baselineMap.get(name);
        if (baselineHook) {
            const paramsChanged = JSON.stringify(baselineHook.parameters) !== JSON.stringify(currentHook.parameters);
            const returnChanged = baselineHook.returnType !== currentHook.returnType;
            const optionalChanged = baselineHook.optional !== currentHook.optional;

            if (paramsChanged || returnChanged || optionalChanged) {
                changed.push(currentHook);
            }
        }
    }

    return { added, removed, changed };
}

async function main() {
    console.log('🔍 Nexxo Plugin Contract Audit\n');

    const currentHooks = EXPECTED_HOOKS;
    console.log(`✅ Verified ${currentHooks.length} plugin hooks\n`);

    const baseline = await loadBaseline();

    if (!baseline) {
        console.log('⚠️  No baseline found. Creating initial baseline...');
        await saveBaseline(currentHooks, '0.1.3');
        console.log('✅ Baseline created at .governance/plugin-contract-baseline.json');
        process.exit(0);
    }

    console.log(`📊 Comparing against baseline (v${baseline.version})\n`);

    const { added, removed, changed } = compareHooks(baseline.hooks, currentHooks);

    let exitCode = 0;

    if (removed.length > 0) {
        console.log('❌ BREAKING CHANGES DETECTED:\n');
        console.log('Removed hooks:');
        removed.forEach(hook => console.log(`  - ${hook.name}`));
        console.log('\n⛔ Release BLOCKED. Removed hooks break plugin compatibility.');
        exitCode = 1;
    }

    if (changed.length > 0) {
        console.log('❌ BREAKING CHANGES DETECTED:\n');
        console.log('Changed hooks:');
        changed.forEach(hook => {
            console.log(`  - ${hook.name}`);
            const baselineHook = baseline.hooks.find((h: PluginHook) => h.name === hook.name);
            if (baselineHook) {
                console.log(`    Old: (${baselineHook.parameters.join(', ')}) => ${baselineHook.returnType}`);
                console.log(`    New: (${hook.parameters.join(', ')}) => ${hook.returnType}`);
            }
        });
        console.log('\n⛔ Release BLOCKED. Hook signature changes break plugin compatibility.');
        exitCode = 1;
    }

    if (added.length > 0) {
        console.log('ℹ️  NEW HOOKS DETECTED:\n');
        console.log('Added hooks:');
        added.forEach(hook => {
            console.log(`  - ${hook.name} (${hook.optional ? 'optional' : 'required'})`);
        });

        // New required hooks are breaking
        const requiredAdded = added.filter(h => !h.optional);
        if (requiredAdded.length > 0) {
            console.log('\n❌ New REQUIRED hooks are breaking changes!');
            console.log('⛔ Release BLOCKED. New hooks must be optional.');
            exitCode = 1;
        } else {
            console.log('\n✅ New hooks are optional. No breaking changes.');
        }
    }

    if (exitCode === 0) {
        console.log('✅ Plugin contract unchanged. No breaking changes detected.');
    }

    console.log('\n📋 Summary:');
    console.log(`  Added: ${added.length}`);
    console.log(`  Removed: ${removed.length}`);
    console.log(`  Changed: ${changed.length}`);

    process.exit(exitCode);
}

main().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});
