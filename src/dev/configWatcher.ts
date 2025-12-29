import chokidar from 'chokidar';
import path from 'path';
import { log } from '../utils/logger.js';
import { BuildConfig } from '../config/index.js';

export type ReloadType = 'hot' | 'rebuild' | 'restart';

export class ConfigWatcher {
    private watcher: chokidar.FSWatcher | null = null;

    constructor(
        private root: string,
        private onReload: (type: ReloadType, file: string) => void
    ) { }

    start() {
        const configFiles = [
            'urja.config.ts',
            'urja.config.js',
            'urja.config.json',
            'tailwind.config.js',
            'tsconfig.json',
            '.env',
            '.env.local'
        ];

        this.watcher = chokidar.watch(configFiles.map(f => path.join(this.root, f)), {
            ignoreInitial: true
        });

        this.watcher.on('change', (file) => {
            const filename = path.basename(file);
            const type = this.determineReloadType(filename);

            log.info(`Config changed: ${filename} -> ${type}`, { category: 'server' });
            this.onReload(type, file);
        });
    }

    private determineReloadType(filename: string): ReloadType {
        if (filename.startsWith('.env')) return 'hot';
        if (filename === 'tsconfig.json') return 'rebuild';
        if (filename.includes('tailwind')) return 'rebuild';
        return 'restart'; // urja.config changes usually require restart
    }

    async close() {
        await this.watcher?.close();
    }
}
