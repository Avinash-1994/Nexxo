
import alias from '@rollup/plugin-alias';
import { createRollupAdapter } from '../../dist/plugins/compat/rollup.js';
import path from 'path';

export default {
    entry: ['src/main.js'],
    outDir: 'build_output',
    build: { minify: false },
    plugins: [
        createRollupAdapter(alias({
            entries: [
                { find: '@utils', replacement: path.resolve(process.cwd(), 'src/utils') }
            ]
        }))
    ]
};
