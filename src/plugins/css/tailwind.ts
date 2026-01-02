import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { log } from '../../utils/logger.js';

const execAsync = promisify(exec);

export class TailwindPlugin {
    name = 'tailwind-plugin';
    private root: string = process.cwd();

    constructor(root?: string) {
        if (root) this.root = root;
    }

    async apply(cwd: string) {
        this.root = cwd;
        log.info('Configuring Tailwind CSS...');

        try {
            // 1. Install dependencies
            log.info('Installing dependencies: tailwindcss, @tailwindcss/postcss, postcss, autoprefixer...');
            await execAsync('npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer', { cwd });

            // 2. Initialize Tailwind config
            const configPath = path.join(cwd, 'tailwind.config.js');
            if (!await this.fileExists(configPath)) {
                // Tailwind v4 doesn't strictly need a config file for basic usage, but we'll keep it for now
                // or we can just let the user create it.
                // For v4, the config format might be different or unnecessary if using CSS imports.
                // But let's stick to the v3-style config for now if it works, or just basic export.
                // Actually, v4 is quite different. But let's just fix the plugin loading first.

                const configContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
                await fs.writeFile(configPath, configContent);
                log.success('Created tailwind.config.js');
            }

            // 3. Create PostCSS config
            const postcssPath = path.join(cwd, 'postcss.config.js');
            if (!await this.fileExists(postcssPath)) {
                const postcssContent = `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`;
                await fs.writeFile(postcssPath, postcssContent);
                log.success('Created postcss.config.js');
            }


            // 4. Create or update CSS entry
            const cssPath = path.join(cwd, 'src/index.css');
            const directives = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;

            if (await this.fileExists(cssPath)) {
                const content = await fs.readFile(cssPath, 'utf-8');
                if (!content.includes('@tailwind')) {
                    await fs.writeFile(cssPath, directives + '\n' + content);
                    log.success('Injected Tailwind directives into src/index.css');
                }
            } else {
                await fs.mkdir(path.dirname(cssPath), { recursive: true });
                await fs.writeFile(cssPath, directives);
                log.success('Created src/index.css with Tailwind directives');
            }

        } catch (error) {
            log.error('Failed to configure Tailwind CSS:', error);
            throw error;
        }
    }

    async transform(code: string, id: string): Promise<string | void> {
        if (!id.endsWith('.css')) return;

        // log.info(`[TailwindPlugin] Transforming ${id}`);

        try {
            // Dynamic import to avoid bundling issues if dependencies aren't present
            const { createRequire } = await import('module');
            const require = createRequire(path.resolve(this.root, 'package.json'));

            const postcss = require('postcss');
            let tailwindcss;
            try {
                tailwindcss = require('@tailwindcss/postcss');
            } catch {
                tailwindcss = require('tailwindcss');
            }
            const autoprefixer = require('autoprefixer');



            // log.info('[TailwindPlugin] Loaded dependencies');

            const processor = postcss([
                tailwindcss({ config: path.join(this.root, 'tailwind.config.js') }),
                autoprefixer
            ]);

            const result = await processor.process(code, { from: id });
            // log.info('[TailwindPlugin] Transformation successful');
            return result.css;
        } catch (e) {
            log.error('[TailwindPlugin] Processing failed:', e);
            // If tailwind/postcss not installed, just return original code
            return code;
        }
    }

    private async fileExists(path: string): Promise<boolean> {
        return fs.access(path).then(() => true).catch(() => false);
    }
}
