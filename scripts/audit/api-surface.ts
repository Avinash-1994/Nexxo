#!/usr/bin/env node
/**
 * Nexxo Stability Audit — API Surface Check
 * 
 * Verifies that public API surface has not changed unexpectedly.
 * Compares current exports with baseline from last release.
 * 
 * Exit codes:
 *   0 - No changes detected
 *   1 - Breaking changes detected (blocks release)
 *   2 - New APIs added (requires review)
 * 
 * @see docs/internal/STABILITY_AUDIT.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

interface APIExport {
    name: string;
    type: 'function' | 'class' | 'interface' | 'type' | 'const';
    signature?: string;
}

interface APIBaseline {
    version: string;
    exports: APIExport[];
    timestamp: string;
}

async function extractPublicAPI(): Promise<APIExport[]> {
    const exports: APIExport[] = [];

    // Read main entry point
    const indexPath = path.join(ROOT, 'src/index.ts');
    const content = await fs.readFile(indexPath, 'utf-8');

    // 1. Match re-exports: export { A, B } from '...';
    const reExportRegex = /export\s+(?:type\s+)?{([\s\S]*?)}\s+from/g;
    let match;
    while ((match = reExportRegex.exec(content)) !== null) {
        const names = match[1].split(',').map(n => n.trim()).filter(Boolean);
        names.forEach(name => {
            // Handle "A as B"
            const parts = name.split(/\s+as\s+/);
            const finalName = parts[parts.length - 1];
            exports.push({ name: finalName, type: 'const' });
        });
    }

    // 2. Match direct exports: export function A() { ... }
    const directExportRegex = /export\s+(?:async\s+)?(?:function|class|interface|type|const)\s+(\w+)/g;
    while ((match = directExportRegex.exec(content)) !== null) {
        exports.push({
            name: match[1],
            type: 'function',
        });
    }

    return exports;
}

async function loadBaseline(): Promise<APIBaseline | null> {
    const baselinePath = path.join(ROOT, '.governance/api-baseline.json');

    try {
        const content = await fs.readFile(baselinePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

async function saveBaseline(exports: APIExport[], version: string): Promise<void> {
    const baselinePath = path.join(ROOT, '.governance/api-baseline.json');
    const baseline: APIBaseline = {
        version,
        exports,
        timestamp: new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));
}

function compareAPIs(baseline: APIExport[], current: APIExport[]): {
    added: APIExport[];
    removed: APIExport[];
    changed: APIExport[];
} {
    const baselineMap = new Map(baseline.map(e => [e.name, e]));
    const currentMap = new Map(current.map(e => [e.name, e]));

    const added: APIExport[] = [];
    const removed: APIExport[] = [];
    const changed: APIExport[] = [];

    // Find added APIs
    for (const [name, exp] of currentMap) {
        if (!baselineMap.has(name)) {
            added.push(exp);
        }
    }

    // Find removed APIs
    for (const [name, exp] of baselineMap) {
        if (!currentMap.has(name)) {
            removed.push(exp);
        }
    }

    // Find changed APIs (signature changes)
    for (const [name, currentExp] of currentMap) {
        const baselineExp = baselineMap.get(name);
        if (baselineExp && baselineExp.signature !== currentExp.signature) {
            changed.push(currentExp);
        }
    }

    return { added, removed, changed };
}

async function main() {
    console.log('🔍 Nexxo API Surface Audit\n');

    const currentExports = await extractPublicAPI();
    console.log(`✅ Extracted ${currentExports.length} public exports\n`);

    const baseline = await loadBaseline();

    if (!baseline) {
        console.log('⚠️  No baseline found. Creating initial baseline...');
        await saveBaseline(currentExports, '0.1.3');
        console.log('✅ Baseline created at .governance/api-baseline.json');
        process.exit(0);
    }

    console.log(`📊 Comparing against baseline (v${baseline.version})\n`);

    const { added, removed, changed } = compareAPIs(baseline.exports, currentExports);

    let exitCode = 0;

    if (removed.length > 0) {
        console.log('❌ BREAKING CHANGES DETECTED:\n');
        console.log('Removed APIs:');
        removed.forEach(exp => console.log(`  - ${exp.name} (${exp.type})`));
        console.log('\n⛔ Release BLOCKED. Removed APIs require major version bump.');
        exitCode = 1;
    }

    if (changed.length > 0) {
        console.log('❌ BREAKING CHANGES DETECTED:\n');
        console.log('Changed APIs:');
        changed.forEach(exp => console.log(`  - ${exp.name} (${exp.type})`));
        console.log('\n⛔ Release BLOCKED. Signature changes require major version bump.');
        exitCode = 1;
    }

    if (added.length > 0) {
        console.log('ℹ️  NEW APIs DETECTED:\n');
        console.log('Added APIs:');
        added.forEach(exp => console.log(`  - ${exp.name} (${exp.type})`));
        console.log('\n⚠️  Review required. New APIs should be documented.');
        if (exitCode === 0) exitCode = 2;
    }

    if (exitCode === 0) {
        console.log('✅ API surface unchanged. No breaking changes detected.');
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
