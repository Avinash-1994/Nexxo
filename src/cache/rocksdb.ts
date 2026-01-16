import { Level } from 'level';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export interface CacheEntry {
    key: string;
    outDir: string;
    files: string[];
    created: number;
}

export class RocksDBCache {
    db: Level<string, CacheEntry>;
    dir: string;

    constructor(base: string) {
        this.dir = path.resolve(base, '.nexxo_rocksdb');
        // LevelDB stores data in a directory
        this.db = new Level(this.dir, { valueEncoding: 'json' });
    }

    async ensure() {
        await this.db.open();
    }

    async close() {
        await this.db.close();
    }

    async keyFromFiles(paths: string[]) {
        const hash = crypto.createHash('sha256');
        for (const p of paths.sort()) {
            try {
                const data = await fs.readFile(p);
                hash.update(data);
            } catch (e) {
                hash.update(p);
            }
        }
        // Configs
        try { const cfg = await fs.readFile('nexxo.config.ts'); hash.update(cfg); } catch (e) { }
        try { const pkg = await fs.readFile('package.json'); hash.update(pkg); } catch (e) { }

        // Env
        hash.update(process.env.NODE_ENV || 'development');

        return hash.digest('hex');
    }

    async has(key: string): Promise<boolean> {
        try {
            await this.db.get(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    async get(key: string): Promise<CacheEntry | null> {
        try {
            return await this.db.get(key);
        } catch (e) {
            return null;
        }
    }

    async put(entry: CacheEntry) {
        await this.db.put(entry.key, entry);
    }
}
