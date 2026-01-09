
import fs from 'fs/promises';
import path from 'path';
import { log } from '../utils/logger.js';

export async function generateAnalyzeReport(result: any, jsonOnly: boolean = false) {
    const analysisData: any = {
        totalSize: 0,
        chunks: []
    };

    // Flatten results if multi-target
    const targets = result.targets || [result];

    for (const target of targets) {
        if (!target.artifacts) continue;

        const targetName = target.target || 'default';

        // Process Artifacts (Sizes)
        for (const artifact of target.artifacts) {
            if (artifact.type === 'map') continue;

            const artifactSize = artifact.source ? Buffer.byteLength(artifact.source) : 0;
            analysisData.totalSize += artifactSize;

            analysisData.chunks.push({
                target: targetName,
                fileName: artifact.fileName,
                size: artifactSize,
                modules: artifact.modules || []
            });
        }
    }

    // Process Events (Bottlenecks & Cache)
    const events = result.events || [];
    const moduleTimings: Map<string, number> = new Map();
    const cacheStats = { hits: 0, misses: 0 };

    events.forEach((e: any) => {
        if (e.decision === 'cache_hit') cacheStats.hits++;
        if (e.decision === 'cache_miss' || e.name === 'transform:start') cacheStats.misses++;
    });

    analysisData.cache = {
        ...cacheStats,
        ratio: cacheStats.hits + cacheStats.misses > 0
            ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)
            : '0'
    };

    const transformEvents = events.filter((e: any) => e.name === 'transform:start' || e.name === 'transform:end');
    const transformStarts = new Map();

    transformEvents.forEach((e: any) => {
        if (e.name === 'transform:start') {
            transformStarts.set(e.id, e.timestamp);
        } else {
            const start = transformStarts.get(e.id);
            if (start) {
                const duration = e.timestamp - start;
                moduleTimings.set(e.id, (moduleTimings.get(e.id) || 0) + duration);
            }
        }
    });

    analysisData.bottlenecks = Array.from(moduleTimings.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, duration]) => ({ id, duration }));

    if (jsonOnly) {
        console.log(JSON.stringify(analysisData, null, 2));
        return;
    }

    // Console Report
    console.log('\n📊 Bundle Composition Analysis');
    console.log('='.repeat(40));

    for (const chunk of analysisData.chunks) {
        console.log(`\n📦 Chunk: ${chunk.fileName} (${(chunk.size / 1024).toFixed(2)} KB) [${chunk.target}]`);

        // Sort modules by size
        const sortedModules = [...chunk.modules].sort((a, b) => b.size - a.size);
        const topModules = sortedModules.slice(0, 10);

        const tableData = topModules.map(m => ({
            Module: m.id.length > 50 ? '...' + m.id.slice(-47) : m.id,
            'Size (KB)': (m.size / 1024).toFixed(2),
            '%': ((m.size / chunk.size) * 100).toFixed(1) + '%'
        }));

        if (tableData.length > 0) {
            console.table(tableData);
        } else {
            console.log('  (No module breakdown available)');
        }

        if (sortedModules.length > 10) {
            console.log(`  ... and ${sortedModules.length - 10} more modules`);
        }
    }

    console.log('\n' + '='.repeat(40));
    console.log(`Total Bundle Size: ${(analysisData.totalSize / 1024).toFixed(2)} KB`);

    if (analysisData.bottlenecks && analysisData.bottlenecks.length > 0) {
        console.log('\n🐢 Top Transformation Bottlenecks');
        console.log('='.repeat(40));
        const bottleneckTable = analysisData.bottlenecks.map((b: any) => ({
            Module: b.id.length > 60 ? '...' + b.id.slice(-57) : b.id,
            'Time (ms)': b.duration.toFixed(2)
        }));
        console.table(bottleneckTable);
    }

    // Generate HTML Report
    await generateHtmlReport(analysisData);

    // Generate Chrome Trace for Flamegraphs (Phase 4.1)
    await generateChromeTrace(events);
}

async function generateChromeTrace(events: any[]) {
    const traceEvents = events
        .filter(e => e.timestamp)
        .map(e => ({
            name: e.name || e.reason,
            cat: e.stage,
            ph: e.name?.endsWith(':start') ? 'B' : e.name?.endsWith(':end') ? 'E' : 'i',
            ts: e.timestamp * 1000, // Chrome expects microseconds
            pid: 1,
            tid: 1,
            args: e.data || {}
        }));

    const tracePath = path.join(process.cwd(), 'nexxo-trace.json');
    await fs.writeFile(tracePath, JSON.stringify(traceEvents));
    log.success(`Chrome Trace generated at: ${tracePath} (Open in Chrome DevTools -> Performance)`);
}

async function generateHtmlReport(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Nexxo Bundle Analyzer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 1rem; margin-bottom: 2rem; }
        .chunk-card { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .chunk-header { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: bold; font-size: 1.25rem; color: #38bdf8; }
        .module-list { width: 100%; border-collapse: collapse; }
        .module-list th { text-align: left; padding: 0.5rem; border-bottom: 1px solid #334155; color: #94a3b8; }
        .module-list td { padding: 0.5rem; border-bottom: 1px solid #334155; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875rem; }
        .size-bar { height: 4px; background: #38bdf8; border-radius: 2px; }
        .badge { background: #334155; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nexxo Analyze</h1>
            <div style="text-align: right">
                <div>Total Size: ${(data.totalSize / 1024).toFixed(2)} KB</div>
                <div style="color: #10b981; font-size: 0.875rem">Cache Efficiency: ${data.cache?.ratio}% (${data.cache?.hits} hits)</div>
            </div>
        </div>

        ${data.bottlenecks && data.bottlenecks.length > 0 ? `
            <div class="chunk-card">
                <div class="chunk-header" style="color: #fbbf24">🐢 Performance Bottlenecks</div>
                <table class="module-list">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th style="width: 150px">Duration (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.bottlenecks.map((b: any) => `
                            <tr>
                                <td title="${b.id}">${b.id.split('/').pop()}</td>
                                <td>${b.duration.toFixed(2)} ms</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        ${data.chunks.map((chunk: any) => `
            <div class="chunk-card">
                <div class="chunk-header">
                    <span>📦 ${chunk.fileName}</span>
                    <span class="badge">${chunk.target}</span>
                    <span>${(chunk.size / 1024).toFixed(2)} KB</span>
                </div>
                <table class="module-list">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th style="width: 100px">Size</th>
                            <th style="width: 200px">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chunk.modules.sort((a: any, b: any) => b.size - a.size).map((m: any) => `
                            <tr>
                                <td title="${m.id}">${m.id.split('/').pop()}</td>
                                <td>${(m.size / 1024).toFixed(2)} KB</td>
                                <td>
                                    <div class="size-bar" style="width: ${(m.size / chunk.size * 100).toFixed(1)}%"></div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;

    const reportPath = path.join(process.cwd(), 'nexxo-report.html');
    await fs.writeFile(reportPath, html);
    log.success(`Report generated at: ${reportPath}`);
}
