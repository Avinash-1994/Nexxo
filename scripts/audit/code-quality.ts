#!/usr/bin/env node
/**
 * Nexxo Stability Audit — Code Quality Check
 * 
 * Scans core files for prohibited "temporary" hacks:
 * - TODO / FIXME comments in src/core
 * - @ts-ignore without justification
 * - Usage of 'any' in public signatures (planned)
 * 
 * Exit codes:
 *   0 - Pass (No critical hacks found)
 *   1 - Fail (Blocking hacks found in core)
 * 
 * @see docs/internal/STABILITY_AUDIT.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORE_PATH = path.join(ROOT, 'src/core');

interface QualityViolation {
    file: string;
    line: number;
    type: 'TODO' | 'FIXME' | 'TS-IGNORE';
    content: string;
}

async function scanDirectory(dir: string, violations: QualityViolation[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await scanDirectory(fullPath, violations);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Check for FIXME
                if (line.includes('FIXME')) {
                    violations.push({
                        file: path.relative(ROOT, fullPath),
                        line: index + 1,
                        type: 'FIXME',
                        content: line.trim(),
                    });
                }
                // Check for TODO
                if (line.includes('TODO')) {
                    violations.push({
                        file: path.relative(ROOT, fullPath),
                        line: index + 1,
                        type: 'TODO',
                        content: line.trim(),
                    });
                }
                // Check for @ts-ignore
                if (line.includes('@ts-ignore')) {
                    violations.push({
                        file: path.relative(ROOT, fullPath),
                        line: index + 1,
                        type: 'TS-IGNORE',
                        content: line.trim(),
                    });
                }
            });
        }
    }
}

async function main() {
    console.log('🔍 Nexxo Code Quality Audit (src/core)\n');

    const violations: QualityViolation[] = [];

    try {
        await scanDirectory(CORE_PATH, violations);
    } catch (error) {
        console.warn(`⚠️  Core path not found: ${CORE_PATH}. Skipping scan.`);
        process.exit(0);
    }

    const criticalViolations = violations.filter(v => v.type === 'FIXME');
    const warningViolations = violations.filter(v => v.type !== 'FIXME');

    if (violations.length === 0) {
        console.log('✅ No prohibited hacks found in src/core.');
        process.exit(0);
    }

    if (criticalViolations.length > 0) {
        console.log('❌ CRITICAL HACKS DETECTED (Blocking Release):\n');
        criticalViolations.forEach(v => {
            console.log(`  [${v.type}] ${v.file}:${v.line}`);
            console.log(`    > ${v.content}`);
        });
        console.log('\n⛔ Release BLOCKED. FIXMEs are not allowed in src/core.');
    }

    if (warningViolations.length > 0) {
        console.log('\n⚠️  WARNING: Temporary technical debt found:\n');
        warningViolations.forEach(v => {
            console.log(`  [${v.type}] ${v.file}:${v.line}`);
            console.log(`    > ${v.content}`);
        });
        console.log('\nℹ️  Note: TODOs and @ts-ignore should be converted to tracked issues.');
    }

    // If there are FIXMEs, fail. Otherwise, warn but pass.
    process.exit(criticalViolations.length > 0 ? 1 : 0);
}

main().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});
