
import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { explainReporter } from '../core/engine/events.js';

export class DevWatcher extends EventEmitter {
    private watcher: chokidar.FSWatcher;
    private batch: Set<string> = new Set();
    private timer: NodeJS.Timeout | null = null;

    constructor(private rootDir: string, private debounceMs: number = 50) {
        super();
        this.watcher = chokidar.watch(this.rootDir, {
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/.urja/**'
            ],
            ignoreInitial: true
        });

        this.watcher.on('all', (event, path) => {
            if (event === 'add' || event === 'change' || event === 'unlink') {
                this.addToBatch(path);
            }
        });
    }

    private addToBatch(filePath: string) {
        this.batch.add(filePath);
        if (this.timer) clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            const sortedBatch = Array.from(this.batch).sort();
            this.batch.clear();
            explainReporter.report('watcher', 'batch', `Batched ${sortedBatch.length} changes`);
            this.emit('change', sortedBatch);
        }, this.debounceMs);
    }

    close() {
        this.watcher.close();
    }
}
