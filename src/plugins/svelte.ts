import { Plugin } from './index.js';
import path from 'path';
import { createRequire } from 'module';

export class SveltePlugin implements Plugin {
    name = 'svelte-plugin';
    root: string;

    constructor(root: string) {
        this.root = root;
    }

    async transform(code: string, id: string): Promise<string | void> {
        if (!id.endsWith('.svelte')) return;

        try {
            const require = createRequire(path.join(this.root, 'package.json'));
            const svelte = require('svelte/compiler');

            const result = svelte.compile(code, {
                filename: id,
                generate: 'dom', // Client-side DOM
                dev: true,       // Dev mode (better warnings)
                css: 'injected'  // Inject CSS automatically
            });

            return result.js.code;

        } catch (e: any) {
            console.error('Svelte Compilation Error:', e);
            return;
        }
    }
}
