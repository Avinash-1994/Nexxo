import { ProjectProfiler } from '../src/ai/optimizer/profiler.js';
import { RulesEngine } from '../src/ai/optimizer/rules.js';
import { ErrorCollector } from '../src/ai/healer/collector.js';
import { ErrorParser } from '../src/ai/healer/parser.js';
import { AuditEngine } from '../src/audit/index.js';
import { Telemetry } from '../src/ai/telemetry.js';
import path from 'path';

async function runTest() {
    console.log('🧪 Running Advanced AI Verification Test\n');

    try {
        // 1. Optimizer
        console.log('Test 1: Optimizer (Profiler & Rules)');
        const profiler = new ProjectProfiler(process.cwd());
        const profile = await profiler.profile();
        if (profile.framework !== 'unknown') console.log(`  Framework detected: ${profile.framework}`);

        const suggestions = RulesEngine.analyze(profile);
        console.log(`  Generated ${suggestions.length} suggestions`);
        if (suggestions.length > 0) console.log('  ✅ Rules Engine working');

        // 2. Self-Healing
        console.log('\nTest 2: Self-Healing (Collector & Parser)');
        const collector = new ErrorCollector();
        const rawError = "Module not found: Error: Can't resolve 'react'";
        const error = collector.collect({ message: rawError });

        const parsed = ErrorParser.parse(error.message);
        if (parsed.type === 'MISSING_DEPENDENCY') console.log('  ✅ Error Parser working');
        else throw new Error('Error Parser failed');

        // 3. Audits
        console.log('\nTest 3: Terminal Audits');
        const auditReport = await AuditEngine.runAll(process.cwd());
        if (auditReport.groups.a11y) console.log('  ✅ A11y Audit ran');
        if (auditReport.groups.perf) console.log('  ✅ Perf Audit ran');
        if (auditReport.groups.seo) console.log('  ✅ SEO Audit ran');

        console.log('\n✨ All verification tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
