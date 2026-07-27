/**
 * Comparison Chart Generator
 * Generates ASCII charts to visualize performance metrics
 */

export class ChartGenerator {
    /**
     * Generate detailed comparison chart
     */
    generateComparison(
        metric: string,
        lunxValue: number,
        rivals: Record<string, number>,
        unit: string = 'ms'
    ): string {
        const maxLabelLength = Math.max('Lunx'.length, ...Object.keys(rivals).map(k => k.length));
        const maxValue = Math.max(lunxValue, ...Object.values(rivals));
        const chartWidth = 40;

        let output = `\n📊 ${metric} Comparison:\n`;
        output += '─'.repeat(chartWidth + maxLabelLength + 15) + '\n';

        // Add Lunx
        output += this.createBar('Lunx', lunxValue, maxValue, maxLabelLength, chartWidth, unit, true);

        // Add Rivals
        for (const [name, value] of Object.entries(rivals)) {
            output += this.createBar(name, value, maxValue, maxLabelLength, chartWidth, unit, false);
        }

        output += '─'.repeat(chartWidth + maxLabelLength + 15) + '\n';
        return output;
    }

    private createBar(
        label: string,
        value: number,
        maxValue: number,
        labelWidth: number,
        chartWidth: number,
        unit: string,
        isHighlight: boolean
    ): string {
        const barLength = Math.max(1, Math.round((value / maxValue) * chartWidth));
        const barChar = isHighlight ? '█' : '░';
        const paddedLabel = label.padEnd(labelWidth);

        return `${isHighlight ? '🚀' : '  '} ${paddedLabel} │ ${barChar.repeat(barLength)} ${value}${unit}\n`;
    }
}
