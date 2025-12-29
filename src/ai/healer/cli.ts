import { ErrorParser } from './parser.js';
import { FixGenerator } from './fixer.js';
import { log } from '../../utils/logger.js';
import { createInterface } from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class HealerCLI {
    static async handle(error: Error) {
        const parsed = ErrorParser.parse(error.message);
        log.error(`Build Failed: ${parsed.message}`, { category: 'ai' });

        const fixes = FixGenerator.generate(parsed);
        if (fixes.length === 0) return;

        console.log('\n🤖 AI Self-Healer Suggestions:');
        fixes.forEach((fix, i) => {
            log.info(`[${Math.round(fix.confidence * 100)}%] ${fix.description}`, { category: 'ai' });
            if (fix.command) log.info(`   Command: ${fix.command}`, { category: 'ai' });
        });

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise<string>(resolve => {
            rl.question('\nApply fix? (number/n): ', resolve);
        });
        rl.close();

        const choice = parseInt(answer);
        if (!isNaN(choice) && choice > 0 && choice <= fixes.length) {
            const fix = fixes[choice - 1];
            if (fix.type === 'SHELL_COMMAND' && fix.command) {
                log.info(`Executing: ${fix.command}`, { category: 'ai' });
                try {
                    await execAsync(fix.command);
                    log.success('Fix applied! Try running build again.', { category: 'ai' });
                } catch (e) {
                    log.error('Failed to apply fix', { error: e });
                }
            } else {
                log.info('Please apply this fix manually.', { category: 'ai' });
            }
        }
    }
}
