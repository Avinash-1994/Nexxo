
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

    const tracePath = path.join(process.cwd(), 'lunx-trace.json');
    await fs.writeFile(tracePath, JSON.stringify(traceEvents));
    log.success(`Chrome Trace generated at: ${tracePath} (Open in Chrome DevTools -> Performance)`);
}

async function generateHtmlReport(data: any) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lunx Premium Bundle Analyzer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b0f1a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border: rgba(51, 65, 85, 0.5);
            --primary: #38bdf8;
            --secondary: #818cf8;
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --success: #10b981;
            --warning: #fbbf24;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            padding: 3rem;
            line-height: 1.5;
            background-image: 
                radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(129, 140, 248, 0.05) 0px, transparent 50%);
        }
        .container { max-width: 1100px; margin: 0 auto; }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
            margin-bottom: 3rem; 
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border);
        }
        h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.025em; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stats { display: flex; gap: 2rem; text-align: right; }
        .stat-label { font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); font-weight: 600; margin-bottom: 0.25rem; }
        .stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text); }
        .card { 
            background: var(--card-bg); 
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            border-radius: 16px; 
            padding: 2rem; 
            margin-bottom: 2rem; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
        }
        .card-title { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 1.5rem; 
            font-weight: 700; 
            font-size: 1.125rem; 
        }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1rem 0.5rem; border-bottom: 1px solid var(--border); color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; font-weight: 600; }
        td { padding: 1rem 0.5rem; border-bottom: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .module-name { color: var(--text); font-weight: 500; }
        .module-path { color: var(--text-dim); font-size: 0.75rem; }
        .size-bar-container { width: 100%; height: 6px; background: rgba(51, 65, 85, 0.3); border-radius: 3px; overflow: hidden; margin-top: 4px; }
        .size-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; }
        .badge { background: rgba(56, 189, 248, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.2); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <div class="stat-label">Project Report</div>
                <h1>Lunx Analyze</h1>
            </div>
            <div class="stats">
                <div>
                    <div class="stat-label">Total Size</div>
                    <div class="stat-value">${(data.totalSize / 1024).toFixed(2)} KB</div>
                </div>
                <div>
                    <div class="stat-label">Cache Hit Rate</div>
                    <div class="stat-value" style="color: var(--success)">${data.cache?.ratio}%</div>
                </div>
            </div>
        </div>

        ${data.bottlenecks && data.bottlenecks.length > 0 ? `
            <div class="card">
                <div class="card-title" style="color: var(--warning)">
                    <span>🐢 Performance Bottlenecks</span>
                    <span class="badge" style="background: rgba(251, 191, 36, 0.1); color: var(--warning); border-color: rgba(251, 191, 36, 0.2)">High Latency</span>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Transformation Module</th>
                                <th style="width: 150px">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.bottlenecks.map((b: any) => `
                                <tr>
                                    <td title="${b.id}">
                                        <div class="module-name">${b.id.split('/').pop()}</div>
                                        <div class="module-path">${b.id.length > 60 ? '...' + b.id.slice(-57) : b.id}</div>
                                    </td>
                                    <td style="color: var(--warning)">${b.duration.toFixed(2)} ms</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}

        ${data.chunks.map((chunk: any) => `
            <div class="card">
                <div class="card-title">
                    <span>📦 ${chunk.fileName}</span>
                    <div style="display: flex; gap: 0.5rem; align-items: center">
                        <span class="badge" style="text-transform: capitalize">${chunk.target}</span>
                        <span style="font-size: 0.875rem; color: var(--text-dim)">${(chunk.size / 1024).toFixed(2)} KB</span>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Module Dependency</th>
                                <th style="width: 120px">Size</th>
                                <th style="width: 200px">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${chunk.modules.sort((a: any, b: any) => b.size - a.size).map((m: any) => {
        const relPath = m.id.includes('node_modules') ? m.id.split('node_modules/')[1] : (m.id.startsWith('/') ? m.id.split('/').pop() : m.id);
        return `
                                <tr>
                                    <td title="${m.id}">
                                        <div class="module-name">${relPath}</div>
                                        <div class="module-path">${m.id.length > 70 ? '...' + m.id.slice(-67) : m.id}</div>
                                    </td>
                                    <td>${(m.size / 1024).toFixed(2)} KB</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px">
                                            <div class="size-bar-container">
                                                <div class="size-bar" style="width: ${(m.size / chunk.size * 100).toFixed(1)}%"></div>
                                            </div>
                                            <span style="font-size: 0.7rem; color: var(--text-dim); min-width: 40px">${(m.size / chunk.size * 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;

    const reportPath = path.join(process.cwd(), 'lunx-report.html');
    await fs.writeFile(reportPath, html);
    log.success(`Premium Report generated at: ${reportPath}`);
}
