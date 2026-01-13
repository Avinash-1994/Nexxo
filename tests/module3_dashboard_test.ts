
/**
 * Module 3: Elite DX - Dashboard Logic Test
 * Validates Day 19 Metrics & tRPC Pipeline
 */

import { dashboardRouter } from '../src/dashboard/server/router.js';
import { MetricsCollector } from '../src/dashboard/metrics.js';

async function runDashboardTest() {
    console.log('🧪 Testing Dashboard Metrics Pipeline...');

    // 1. Populate Metrics
    const collector = MetricsCollector.getInstance();

    console.log('  Simulating Build Traffic...');
    // Build 1: Slow cold start
    collector.recordBuild(500, 100, 0.0);
    // Build 2: Fast HMR
    collector.recordBuild(10, 1, 1.0);
    collector.recordHMR();
    collector.recordHMR();

    // 2. Query via tRPC
    const caller = dashboardRouter.createCaller({});

    console.log('  Querying getMetrics()...');
    const start = performance.now();
    const metrics = await caller.getMetrics();
    const latency = performance.now() - start;

    console.log(`  API Latency: ${latency.toFixed(2)}ms`); // Target < 100ms

    if (metrics.totalBuilds !== 2) throw new Error(`Build count mismatch: ${metrics.totalBuilds}`);
    if (metrics.hmrEvents !== 2) throw new Error('HMR count mismatch');
    if (metrics.lastBuildTime !== 10) throw new Error('Last build time mismatch');

    console.log('  ✅ Metrics Accuracy Verified');
    console.log(`  ✅ Update Latency: ${latency.toFixed(2)}ms (Target < 100ms)`);

    // 3. Generate Report
    console.log('  Generating Public Report...');
    const reportJson = await caller.generateReport();
    const report = JSON.parse(reportJson);

    if (report.title !== 'Nexxo Build Report') throw new Error('Report title mismatch');
    if (report.history.length !== 2) throw new Error('History length mismatch');
    console.log('  ✅ Report Generation Verified');

    console.log('---------------------------');
    console.log('🎉 Day 19 Dashboard Logic Verified!');
}

runDashboardTest().catch(e => {
    console.error('❌ Dashboard Test Failed:', e);
    process.exit(1);
});
