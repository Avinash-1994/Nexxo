import { build } from '../dist/build/bundler.js';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

async function test() {
    const root = process.cwd();
    const outDir = 'dist_plugin_test';
    const entry = 'src/plugin_entry.ts';

    await fs.writeFile(path.join(root, entry), 'export const v = "__VERSION__";');

    const plugin = {
        name: 'test-plugin',
        transform: (code, id) => {
            console.log('Plugin transform called for:', id);
            return code.replace('__VERSION__', '1.2.3');
        }
    };

    const cfg = {
        root,
        entry: [entry],
        mode: 'production',
        outDir,
        plugins: [plugin]
    };

    try {
        await build(cfg);

        // Check output
        // The bundler names entry points as entry0, entry1, etc.
        const outFile = path.join(root, outDir, 'entry0.js');
        const content = await fs.readFile(outFile, 'utf-8');

        console.log('Output:', content);
        assert.ok(content.includes('1.2.3'), 'Plugin should transform code');
        console.log('PASS: Plugin system works');
    } catch (e) {
        console.error('FAIL:', e);
        process.exit(1);
    } finally {
        // Cleanup
        await fs.rm(path.join(root, outDir), { recursive: true, force: true }).catch(() => { });
        await fs.unlink(path.join(root, entry)).catch(() => { });
    }
}

test();
