#!/usr/bin/env node
/**
 * Urja Stability Audit — Master Script
 * 
 * Runs all governance audits and generates a comprehensive report.
 * This is the release gate - if this fails, release is blocked.
 * 
 * Exit codes:
 *   0 - All audits passed
 *   1 - One or more audits failed (blocks release)
 * 
 * @see docs/internal/STABILITY_AUDIT.md
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

interface AuditResult {
    name: string;
    passed: boolean;
    exitCode: number;
    output: string;
    duration: number;
}

async function runAudit(name: string, script: string): Promise<AuditResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
        const proc = spawn('node', ['--import', 'tsx', script], {
            cwd: ROOT,
            stdio: 'pipe',
        });

        let output = '';

        proc.stdout?.on('data', (data) => {
            output += data.toString();
        });

        proc.stderr?.on('data', (data) => {
            output += data.toString();
        });

        proc.on('close', (code) => {
            const duration = Date.now() - startTime;
            resolve({
                name,
                passed: code === 0,
                exitCode: code || 0,
                output,
                duration,
            });
        });
    });
}

async function generateReport(results: AuditResult[], version: string): Promise<void> {
    const reportPath = path.join(ROOT, `.governance/AUDIT_REPORT_v${version}.md`);

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    let report = `# Urja Stability Audit Report\n\n`;
    report += `**Version**: v${version}\n`;
    report += `**Date**: ${new Date().toISOString()}\n`;
    report += `**Status**: ${failed === 0 ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    report += `---\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Audits**: ${total}\n`;
    report += `- **Passed**: ${passed}\n`;
    report += `- **Failed**: ${failed}\n\n`;
    report += `---\n\n`;
    report += `## Audit Results\n\n`;

    for (const result of results) {
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        report += `### ${result.name} — ${status}\n\n`;
        report += `- **Exit Code**: ${result.exitCode}\n`;
        report += `- **Duration**: ${result.duration}ms\n\n`;

        if (!result.passed) {
            report += `**Output**:\n\`\`\`\n${result.output}\n\`\`\`\n\n`;
        }
    }

    report += `---\n\n`;
    report += `## Recommendation\n\n`;

    if (failed === 0) {
        report += `✅ **APPROVED FOR RELEASE**\n\n`;
        report += `All governance audits passed. Release may proceed.\n`;
    } else {
        report += `❌ **RELEASE BLOCKED**\n\n`;
        report += `${failed} audit(s) failed. Release cannot proceed until all audits pass.\n\n`;
        report += `**Failed Audits**:\n`;
        results.filter(r => !r.passed).forEach(r => {
            report += `- ${r.name}\n`;
        });
    }

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);

    console.log(`\n📄 Report generated: ${reportPath}`);
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║           URJA STABILITY AUDIT — RELEASE GATE                ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const audits = [
        { name: 'API Surface', script: 'scripts/audit/api-surface.ts' },
        { name: 'Plugin Contract', script: 'scripts/audit/plugin-contract.ts' },
        { name: 'Code Quality', script: 'scripts/audit/code-quality.ts' },
        { name: 'Inspector Schema', script: 'scripts/audit/inspector-schema.ts' },
    ];

    const results: AuditResult[] = [];

    for (const audit of audits) {
        console.log(`\n🔍 Running: ${audit.name}...`);
        console.log('─'.repeat(60));

        const result = await runAudit(audit.name, path.join(ROOT, audit.script));
        results.push(result);

        console.log(result.output);
        console.log('─'.repeat(60));
        console.log(result.passed ? '✅ PASSED' : '❌ FAILED');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 AUDIT SUMMARY\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    results.forEach(r => {
        const status = r.passed ? '✅' : '❌';
        console.log(`${status} ${r.name} (${r.duration}ms)`);
    });

    console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);

    // Generate report
    const version = process.env.npm_package_version || '0.1.3';
    await generateReport(results, version);

    if (failed > 0) {
        console.log('❌ RELEASE BLOCKED\n');
        console.log(`${failed} audit(s) failed. Fix issues and re-run audit.\n`);
        process.exit(1);
    }

    console.log('✅ ALL AUDITS PASSED\n');
    console.log('Release may proceed.\n');
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Audit system failed:', error);
    process.exit(1);
});
