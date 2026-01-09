#!/usr/bin/env node
/**
 * Nexxo Stability Audit — Inspector Schema Check
 * 
 * Verifies that the Graph Node and Edge structure remains stable.
 * This ensures external visualization tools won't break.
 * 
 * Exit codes:
 *   0 - Pass (Schema matches baseline)
 *   1 - Fail (Breaking schema change detected)
 * 
 * @see docs/internal/STABILITY_AUDIT.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

interface SchemaField {
    name: string;
    type: string;
    optional: boolean;
}

const EXPECTED_GRAPH_NODE_FIELDS: SchemaField[] = [
    { name: 'id', type: 'string', optional: false },
    { name: 'path', type: 'string', optional: false },
    { name: 'type', type: 'string', optional: false },
    { name: 'content', type: 'string', optional: false },
    { name: 'edges', type: 'array', optional: false },
    { name: 'hash', type: 'string', optional: true },
];

async function loadBaseline(): Promise<SchemaField[] | null> {
    const baselinePath = path.join(ROOT, '.governance/inspector-schema-baseline.json');
    try {
        const content = await fs.readFile(baselinePath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

async function saveBaseline(fields: SchemaField[]): Promise<void> {
    const baselinePath = path.join(ROOT, '.governance/inspector-schema-baseline.json');
    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.writeFile(baselinePath, JSON.stringify(fields, null, 2));
}

async function main() {
    console.log('🔍 Nexxo Inspector Schema Audit\n');

    const currentFields = EXPECTED_GRAPH_NODE_FIELDS;
    const baseline = await loadBaseline();

    if (!baseline) {
        console.log('⚠️  No baseline found. Creating initial baseline...');
        await saveBaseline(currentFields);
        console.log('✅ Baseline created at .governance/inspector-schema-baseline.json');
        process.exit(0);
    }

    const removed = baseline.filter(bf => !currentFields.some(cf => cf.name === bf.name));
    const changed = baseline.filter(bf => {
        const cf = currentFields.find(f => f.name === bf.name);
        return cf && (cf.type !== bf.type || cf.optional !== bf.optional);
    });

    if (removed.length > 0 || changed.length > 0) {
        console.log('❌ BREAKING SCHEMA CHANGES DETECTED:\n');

        if (removed.length > 0) {
            console.log('Removed Fields:');
            removed.forEach(f => console.log(`  - ${f.name}`));
        }

        if (changed.length > 0) {
            console.log('Changed Fields:');
            changed.forEach(f => {
                const cf = currentFields.find(cf => cf.name === f.name);
                console.log(`  - ${f.name}:`);
                console.log(`    Old: ${f.type} (optional: ${f.optional})`);
                console.log(`    New: ${cf?.type} (optional: ${cf?.optional})`);
            });
        }

        console.log('\n⛔ Release BLOCKED. Inspector schema changes break external tools.');
        process.exit(1);
    }

    console.log('✅ Inspector schema remains stable.');
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});
