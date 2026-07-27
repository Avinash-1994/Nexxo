/**
 * Report Generator - Creates comprehensive HTML and Markdown reports
 */

import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkResult, BuildTool } from './benchmark-runner';

export interface ComparisonData {
    metric: string;
    tools: Record<BuildTool, number | null>;
    winner: BuildTool;
    unit: string;
}

export interface GapAnalysis {
    category: string;
    gaps: Array<{
        issue: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        recommendation: string;
    }>;
}

export class ReportGenerator {
    constructor(private outputDir: string = './tests/comprehensive/reports') {
        this.ensureOutputDir();
    }

    private ensureOutputDir(): void {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Generate comprehensive comparison report
     */
    generateComparisonReport(
        results: BenchmarkResult[],
        outputName: string = 'comparison-report'
    ): void {
        const comparisons = this.buildComparisonMatrix(results);
        const gapAnalysis = this.analyzeGaps(comparisons);
        const recommendations = this.generateRecommendations(gapAnalysis);

        // Generate Markdown report
        const markdown = this.generateMarkdownReport(comparisons, gapAnalysis, recommendations);
        fs.writeFileSync(
            path.join(this.outputDir, `${outputName}.md`),
            markdown
        );

        // Generate HTML report
        const html = this.generateHTMLReport(comparisons, gapAnalysis, recommendations);
        fs.writeFileSync(
            path.join(this.outputDir, `${outputName}.html`),
            html
        );

        // Generate JSON data
        fs.writeFileSync(
            path.join(this.outputDir, `${outputName}.json`),
            JSON.stringify({ comparisons, gapAnalysis, recommendations }, null, 2)
        );

        console.log(`\n✅ Reports generated in ${this.outputDir}/`);
    }

    /**
     * Build comparison matrix from results
     */
    private buildComparisonMatrix(results: BenchmarkResult[]): ComparisonData[] {
        const metrics = new Map<string, Map<BuildTool, number>>();

        // Group results by metric
        for (const result of results) {
            if (!metrics.has(result.metric)) {
                metrics.set(result.metric, new Map());
            }
            metrics.get(result.metric)!.set(result.tool, result.value);
        }

        // Build comparison data
        const comparisons: ComparisonData[] = [];
        for (const [metric, toolData] of metrics) {
            const tools: Record<string, number | null> = {};
            let winner: BuildTool = 'lunx';
            let bestValue = Infinity;

            // Determine if lower is better (most metrics)
            const lowerIsBetter = !metric.includes('score');

            for (const tool of this.getAllTools()) {
                const value = toolData.get(tool) || null;
                tools[tool] = value;

                if (value !== null) {
                    if (lowerIsBetter && value < bestValue) {
                        bestValue = value;
                        winner = tool;
                    } else if (!lowerIsBetter && value > bestValue) {
                        bestValue = value;
                        winner = tool;
                    }
                }
            }

            comparisons.push({
                metric,
                tools: tools as Record<BuildTool, number | null>,
                winner,
                unit: this.getUnitForMetric(metric),
            });
        }

        return comparisons;
    }

    /**
     * Analyze gaps and weaknesses
     */
    private analyzeGaps(comparisons: ComparisonData[]): GapAnalysis[] {
        const analysis: GapAnalysis[] = [];

        // Performance gaps
        const perfGaps: GapAnalysis['gaps'] = [];
        for (const comp of comparisons) {
            const lunxValue = comp.tools.lunx;
            if (lunxValue === null) continue;

            const winnerValue = comp.tools[comp.winner];
            if (winnerValue === null || comp.winner === 'lunx') continue;

            const diff = ((lunxValue - winnerValue) / winnerValue) * 100;

            if (diff > 50) {
                perfGaps.push({
                    issue: `${comp.metric}: Lunx is ${diff.toFixed(0)}% slower than ${comp.winner}`,
                    severity: diff > 100 ? 'critical' : 'high',
                    recommendation: `Optimize ${comp.metric} to match ${comp.winner}'s performance`,
                });
            } else if (diff > 20) {
                perfGaps.push({
                    issue: `${comp.metric}: Lunx is ${diff.toFixed(0)}% slower than ${comp.winner}`,
                    severity: 'medium',
                    recommendation: `Consider optimizing ${comp.metric}`,
                });
            }
        }

        if (perfGaps.length > 0) {
            analysis.push({
                category: 'Performance',
                gaps: perfGaps,
            });
        }

        return analysis;
    }

    /**
     * Generate actionable recommendations
     */
    private generateRecommendations(gapAnalysis: GapAnalysis[]): string[] {
        const recommendations: string[] = [];

        for (const analysis of gapAnalysis) {
            const criticalGaps = analysis.gaps.filter(g => g.severity === 'critical');
            const highGaps = analysis.gaps.filter(g => g.severity === 'high');

            if (criticalGaps.length > 0) {
                recommendations.push(
                    `🚨 CRITICAL (${analysis.category}): ${criticalGaps.map(g => g.recommendation).join(', ')}`
                );
            }

            if (highGaps.length > 0) {
                recommendations.push(
                    `⚠️  HIGH (${analysis.category}): ${highGaps.map(g => g.recommendation).join(', ')}`
                );
            }
        }

        return recommendations;
    }

    /**
     * Generate Markdown report
     */
    private generateMarkdownReport(
        comparisons: ComparisonData[],
        gapAnalysis: GapAnalysis[],
        recommendations: string[]
    ): string {
        const timestamp = new Date().toISOString();

        let md = `# 🧪 Lunx Comprehensive Test Report\n\n`;
        md += `**Generated:** ${timestamp}\n`;
        md += `**Environment:** ${process.platform}, Node ${process.version}\n\n`;
        md += `---\n\n`;

        // Executive Summary
        md += `## 📊 Executive Summary\n\n`;
        const wins = comparisons.filter(c => c.winner === 'lunx').length;
        const total = comparisons.length;
        md += `- **Winning Metrics:** ${wins}/${total} (${((wins / total) * 100).toFixed(0)}%)\n`;
        md += `- **Critical Gaps:** ${gapAnalysis.reduce((sum, a) => sum + a.gaps.filter(g => g.severity === 'critical').length, 0)}\n`;
        md += `- **High Priority Gaps:** ${gapAnalysis.reduce((sum, a) => sum + a.gaps.filter(g => g.severity === 'high').length, 0)}\n\n`;

        // Performance Comparison Table
        md += `## 🏆 Performance Comparison\n\n`;
        md += `| Metric | Lunx | Vite | Webpack | Rspack | esbuild | Turbopack | Parcel | Winner |\n`;
        md += `|--------|-------|------|---------|--------|---------|-----------|--------|--------|\n`;

        for (const comp of comparisons) {
            const row = [
                comp.metric,
                this.formatValue(comp.tools.lunx, comp.unit, comp.winner === 'lunx'),
                this.formatValue(comp.tools.vite, comp.unit, comp.winner === 'vite'),
                this.formatValue(comp.tools.webpack, comp.unit, comp.winner === 'webpack'),
                this.formatValue(comp.tools.rspack, comp.unit, comp.winner === 'rspack'),
                this.formatValue(comp.tools.esbuild, comp.unit, comp.winner === 'esbuild'),
                this.formatValue(comp.tools.turbopack, comp.unit, comp.winner === 'turbopack'),
                this.formatValue(comp.tools.parcel, comp.unit, comp.winner === 'parcel'),
                `**${comp.winner}**`,
            ];
            md += `| ${row.join(' | ')} |\n`;
        }
        md += `\n`;

        // Where We're Winning
        md += `## ✅ Where We're Winning\n\n`;
        const winningMetrics = comparisons.filter(c => c.winner === 'lunx');
        if (winningMetrics.length > 0) {
            for (const metric of winningMetrics) {
                const secondBest = this.getSecondBest(metric);
                const improvement = secondBest ? this.calculateImprovement(metric.tools.lunx!, secondBest.value) : 0;
                md += `- **${metric.metric}**: ${metric.tools.lunx}${metric.unit}`;
                if (secondBest) {
                    md += ` (${improvement.toFixed(0)}% better than ${secondBest.tool})`;
                }
                md += `\n`;
            }
        } else {
            md += `*No metrics where Lunx is currently winning*\n`;
        }
        md += `\n`;

        // Where We're Lagging
        md += `## ⚠️  Where We're Lagging\n\n`;
        const laggingMetrics = comparisons.filter(c => c.winner !== 'lunx' && c.tools.lunx !== null);
        if (laggingMetrics.length > 0) {
            for (const metric of laggingMetrics) {
                const winnerValue = metric.tools[metric.winner]!;
                const lunxValue = metric.tools.lunx!;
                const gap = this.calculateGap(lunxValue, winnerValue);
                md += `- **${metric.metric}**: ${lunxValue}${metric.unit} vs ${metric.winner} ${winnerValue}${metric.unit} (${gap.toFixed(0)}% slower)\n`;
            }
        } else {
            md += `*Lunx is winning or competitive in all tested metrics!*\n`;
        }
        md += `\n`;

        // Gap Analysis
        if (gapAnalysis.length > 0) {
            md += `## 🔍 Gap Analysis\n\n`;
            for (const analysis of gapAnalysis) {
                md += `### ${analysis.category}\n\n`;
                for (const gap of analysis.gaps) {
                    const emoji = gap.severity === 'critical' ? '🚨' : gap.severity === 'high' ? '⚠️' : '📝';
                    md += `${emoji} **${gap.severity.toUpperCase()}**: ${gap.issue}\n`;
                    md += `   - *Recommendation:* ${gap.recommendation}\n\n`;
                }
            }
        }

        // Recommendations
        if (recommendations.length > 0) {
            md += `## 🎯 Priority Recommendations\n\n`;
            for (const rec of recommendations) {
                md += `${rec}\n\n`;
            }
        }

        // Detailed Metrics
        md += `## 📈 Detailed Metrics\n\n`;
        md += `\`\`\`json\n`;
        md += JSON.stringify(comparisons, null, 2);
        md += `\n\`\`\`\n`;

        return md;
    }

    /**
     * Generate HTML report
     */
    private generateHTMLReport(
        comparisons: ComparisonData[],
        gapAnalysis: GapAnalysis[],
        recommendations: string[]
    ): string {
        const timestamp = new Date().toISOString();
        const wins = comparisons.filter(c => c.winner === 'lunx').length;
        const total = comparisons.length;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lunx Comprehensive Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: #333;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .subtitle { opacity: 0.9; font-size: 1.1rem; }
    .content { padding: 2rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .stat-label { color: #666; font-size: 0.9rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      font-size: 0.9rem;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f5f7fa;
      font-weight: 600;
      color: #667eea;
    }
    tr:hover { background: #f9f9f9; }
    .winner { background: #d4edda; font-weight: bold; }
    .medal { font-size: 1.2rem; }
    .section {
      margin: 3rem 0;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 12px;
    }
    .section h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
    }
    .gap-item {
      background: white;
      padding: 1rem;
      margin: 1rem 0;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
    .gap-item.critical { border-left-color: #dc3545; }
    .gap-item.high { border-left-color: #ff9800; }
    .gap-item.medium { border-left-color: #ffc107; }
    .gap-item.low { border-left-color: #28a745; }
    .recommendation {
      background: #e3f2fd;
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }
    .chart {
      margin: 2rem 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧪 Lunx Comprehensive Test Report</h1>
      <p class="subtitle">Generated: ${timestamp}</p>
      <p class="subtitle">Environment: ${process.platform}, Node ${process.version}</p>
    </header>
    
    <div class="content">
      <div class="summary">
        <div class="stat-card">
          <div class="stat-value">${wins}/${total}</div>
          <div class="stat-label">Winning Metrics</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${((wins / total) * 100).toFixed(0)}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gapAnalysis.reduce((sum, a) => sum + a.gaps.filter(g => g.severity === 'critical').length, 0)}</div>
          <div class="stat-label">Critical Gaps</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gapAnalysis.reduce((sum, a) => sum + a.gaps.filter(g => g.severity === 'high').length, 0)}</div>
          <div class="stat-label">High Priority Gaps</div>
        </div>
      </div>
      
      <div class="section">
        <h2>🏆 Performance Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Lunx</th>
              <th>Vite</th>
              <th>Webpack</th>
              <th>Rspack</th>
              <th>esbuild</th>
              <th>Turbopack</th>
              <th>Parcel</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            ${comparisons.map(comp => `
              <tr>
                <td><strong>${comp.metric}</strong></td>
                <td class="${comp.winner === 'lunx' ? 'winner' : ''}">${this.formatValue(comp.tools.lunx, comp.unit, comp.winner === 'lunx')}</td>
                <td class="${comp.winner === 'vite' ? 'winner' : ''}">${this.formatValue(comp.tools.vite, comp.unit, comp.winner === 'vite')}</td>
                <td class="${comp.winner === 'webpack' ? 'winner' : ''}">${this.formatValue(comp.tools.webpack, comp.unit, comp.winner === 'webpack')}</td>
                <td class="${comp.winner === 'rspack' ? 'winner' : ''}">${this.formatValue(comp.tools.rspack, comp.unit, comp.winner === 'rspack')}</td>
                <td class="${comp.winner === 'esbuild' ? 'winner' : ''}">${this.formatValue(comp.tools.esbuild, comp.unit, comp.winner === 'esbuild')}</td>
                <td class="${comp.winner === 'turbopack' ? 'winner' : ''}">${this.formatValue(comp.tools.turbopack, comp.unit, comp.winner === 'turbopack')}</td>
                <td class="${comp.winner === 'parcel' ? 'winner' : ''}">${this.formatValue(comp.tools.parcel, comp.unit, comp.winner === 'parcel')}</td>
                <td><strong>${comp.winner}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      ${gapAnalysis.length > 0 ? `
      <div class="section">
        <h2>🔍 Gap Analysis</h2>
        ${gapAnalysis.map(analysis => `
          <h3>${analysis.category}</h3>
          ${analysis.gaps.map(gap => `
            <div class="gap-item ${gap.severity}">
              <strong>${gap.severity.toUpperCase()}:</strong> ${gap.issue}<br>
              <em>Recommendation: ${gap.recommendation}</em>
            </div>
          `).join('')}
        `).join('')}
      </div>
      ` : ''}
      
      ${recommendations.length > 0 ? `
      <div class="section">
        <h2>🎯 Priority Recommendations</h2>
        ${recommendations.map(rec => `
          <div class="recommendation">${rec}</div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
    }

    /**
     * Helper methods
     */
    private getAllTools(): BuildTool[] {
        return ['lunx', 'vite', 'webpack', 'rspack', 'esbuild', 'turbopack', 'parcel'];
    }

    private getUnitForMetric(metric: string): string {
        if (metric.includes('time') || metric.includes('start') || metric.includes('latency')) return 'ms';
        if (metric.includes('size')) return 'KB';
        if (metric.includes('memory')) return 'MB';
        if (metric.includes('count')) return '';
        return '';
    }

    private formatValue(value: number | null, unit: string, isWinner: boolean): string {
        if (value === null) return 'N/A';
        const formatted = value.toFixed(value < 10 ? 2 : 0);
        const medal = isWinner ? ' 🥇' : '';
        return `${formatted}${unit}${medal}`;
    }

    private getSecondBest(comp: ComparisonData): { tool: BuildTool; value: number } | null {
        const values = Object.entries(comp.tools)
            .filter(([tool, value]) => tool !== 'lunx' && value !== null)
            .map(([tool, value]) => ({ tool: tool as BuildTool, value: value as number }))
            .sort((a, b) => a.value - b.value);

        return values[0] || null;
    }

    private calculateImprovement(lunxValue: number, otherValue: number): number {
        return ((otherValue - lunxValue) / otherValue) * 100;
    }

    private calculateGap(lunxValue: number, winnerValue: number): number {
        return ((lunxValue - winnerValue) / winnerValue) * 100;
    }
}
