import { Telemetry } from '../telemetry.js';
import { log } from '../../utils/logger.js';

export class DashboardCLI {
    static async show(root: string) {
        const sessions = await Telemetry.getSessions(root, 10);

        if (sessions.length === 0) {
            log.info('No build history found.', { category: 'ai' });
            return;
        }

        console.log('\n📊 Build History (Last 10)\n');

        // Header
        console.log(
            'ID'.padEnd(10) +
            'Date'.padEnd(25) +
            'Duration'.padEnd(15) +
            'Status'.padEnd(10) +
            'Modules'
        );
        console.log('-'.repeat(70));

        // Rows
        for (const s of sessions) {
            const date = new Date(s.timestamp).toLocaleString();
            const duration = (s.duration / 1000).toFixed(2) + 's';
            const status = s.success ? '✅ PASS' : '❌ FAIL';
            const modules = s.metrics?.modules?.toString() || '-';

            console.log(
                s.id.substring(0, 8).padEnd(10) +
                date.padEnd(25) +
                duration.padEnd(15) +
                status.padEnd(10) +
                modules
            );
        }
        console.log('');
    }
}
