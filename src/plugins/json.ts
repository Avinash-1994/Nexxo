
import { LunxPlugin } from '../core/plugins/types.js';
import path from 'path';
import fs from 'fs/promises';

export function createJsonPlugin(): LunxPlugin {
    return {
        manifest: {
            name: 'lunx:json',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['load'],
            permissions: { fs: 'read' }
        },
        id: 'lunx:json',
        async runHook(hook, input, context) {
            if (hook === 'load') {
                if (input.path.endsWith('.json')) {
                    const content = await fs.readFile(input.path, 'utf-8');
                    try {
                        // Verify it's valid JSON
                        JSON.parse(content);
                        return {
                            code: `module.exports = ${content};`,
                            loader: 'js'
                        };
                    } catch (e) {
                        // If it's invalid JSON, maybe let someone else handle it or just load as is
                        return null;
                    }
                }
            }
            return null;
        }
    };
}
