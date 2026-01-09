import { AIClient } from '../client.js';
import { Analyzer } from '../optimizer/analyzer.js';
import { log } from '../../utils/logger.js';
import { createInterface } from 'readline';

export class ChatCLI {
    static async start(root: string) {
        const client = new AIClient({ provider: 'local' }, root);
        await client.init();

        const analyzer = new Analyzer(root);
        const profile = await analyzer.analyze();

        console.log('\n🤖 Nexxo AI Chat');
        console.log('Type "exit" to quit.\n');

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const systemPrompt = `You are an expert build tool assistant. 
        Project Context: Framework=${profile.framework}, Language=${profile.language}.
        Answer questions about configuration, errors, and best practices.`;

        const ask = () => {
            rl.question('You: ', async (input) => {
                if (input.toLowerCase() === 'exit') {
                    rl.close();
                    return;
                }

                try {
                    const response = await client.complete(input, systemPrompt);
                    console.log(`\nAI: ${response}\n`);
                } catch (e) {
                    log.error('Chat failed', { error: e });
                }

                ask();
            });
        };

        ask();
    }
}
