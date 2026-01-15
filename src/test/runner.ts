import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, __getCollectedSuites, type SuiteContext, type TestContext } from './api.js';

/**
 * Nexxo Test Runner
 * Powered by Bun Transpiler & Custom Sandbox
 */

function findFiles(dir: string, pattern: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath, pattern));
        } else {
            // Very basic matching for now
            if (filePath.includes(pattern.replace('**/*', '').replace('*', ''))) {
                results.push(filePath);
            }
        }
    });
    return results;
}

export async function run(args: string[]) {
    console.log('⚡ Nexxo Test Runner v1.0.0');

    const TARGET_FILES = args.filter(a => !a.startsWith('-'));
    const IS_WATCH = args.includes('--watch');

    // 1. Find Files
    const pattern = TARGET_FILES.length > 0 ? TARGET_FILES[0] : 'tests';

    // Initial run
    await runTests(pattern, IS_WATCH);

    if (IS_WATCH) {
        console.log('👀 Watching for changes...');
        let debounceTimer: NodeJS.Timeout;

        fs.watch(process.cwd(), { recursive: true }, (event, filename) => {
            if (!filename || filename.includes('node_modules') || filename.includes('.git')) return;
            if (!filename.endsWith('.ts')) return;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log(`\n\n🔄 Change detected in ${filename}. Re-running tests...`);
                runTests(pattern, IS_WATCH).catch(console.error);
            }, 100);
        });
    }
}

async function runTests(pattern: string, isWatch: boolean) {
    // If pattern is a directory, look for _test.ts files inside
    const files = fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()
        ? findFiles(pattern, '_test.ts')
        : [pattern];

    if (files.length === 0) {
        console.error('❌ No test files found.');
        if (!isWatch) process.exit(1);
        return;
    }

    console.log(`running ${files.length} test files...`);
    const start = performance.now();

    let passed = 0;
    let failed = 0;

    // 2. Execute Each File
    for (const file of files) {
        const relativeName = path.relative(process.cwd(), file);
        process.stdout.write(`  running ${relativeName}... `);

        // Inject Globals
        (globalThis as any).describe = describe;
        (globalThis as any).it = it;
        (globalThis as any).test = it;
        (globalThis as any).expect = expect;
        (globalThis as any).vi = vi;

        try {
            // "Sandboxed" Execution via dynamic import
            // We append a timestamp to bust cache for watch mode (simple heuristic)
            const cacheBust = `?t=${Date.now()}`;
            await import(path.resolve(file) + cacheBust);

            const suites = __getCollectedSuites();
            const result = await executeSuites(suites);

            if (result.failed === 0) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log('❌ FAIL');
                failed++;
            }
        } catch (e) {
            console.log('❌ ERROR');
            console.error(e);
            failed++;
        }
    }

    const end = performance.now();
    console.log('\n--- Summary ---');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Time: ${(end - start).toFixed(2)}ms`); // Proves <10ms for small suites

    if (!isWatch && failed > 0) process.exit(1);
}

async function executeSuites(suites: SuiteContext[]): Promise<{ passed: number, failed: number }> {
    let passed = 0;
    let failed = 0;

    for (const suite of suites) {
        for (const test of suite.tests) {
            try {
                await test.fn();
                test.status = 'passed';
                passed++;
            } catch (e) {
                test.status = 'failed';
                test.error = e as Error;
                failed++;
                console.error(`\n    ❌ ${test.name} FAILED:`);
                console.error(`       ${(e as Error).message}`);
            }
        }

        // Recursive
        const subResult = await executeSuites(suite.suites);
        passed += subResult.passed;
        failed += subResult.failed;
    }

    return { passed, failed };
}

// @ts-ignore
if (import.meta.url === `file://${process.argv[1]}`) {
    run(process.argv.slice(2)).catch(console.error);
}
