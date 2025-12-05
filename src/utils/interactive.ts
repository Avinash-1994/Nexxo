import readline from 'readline';
import { log } from './logger.js';

export async function promptSelect(question: string, options: string[]): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(question);
        options.forEach((opt, i) => {
            console.log(`  [${i + 1}] ${opt}`);
        });

        rl.question('\nSelect an option (number): ', (answer) => {
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < options.length) {
                rl.close();
                resolve(options[index]);
            } else {
                console.log('Invalid selection. Please try again.');
                rl.close();
                resolve(promptSelect(question, options));
            }
        });
    });
}

export async function promptConfirm(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${question} (y/n): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().startsWith('y'));
        });
    });
}
