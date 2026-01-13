
/**
 * Nexxo Marketplace Database
 * Implementation: SQLite (via better-sqlite3) for Local Registry
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('.nexxo-marketplace.db');

export interface PluginRecord {
    name: string;
    version: string;
    description: string;
    author: string;
    hash: string;
    signature: string;
    public_key: string;
    permissions_json: string;
    created_at: string;
}

export class MarketplaceDB {
    private db: Database.Database;

    constructor(dbPath: string = DB_PATH) {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS plugins (
                name TEXT NOT NULL,
                version TEXT NOT NULL,
                description TEXT,
                author TEXT NOT NULL,
                hash TEXT NOT NULL,
                signature TEXT NOT NULL,
                public_key TEXT NOT NULL,
                permissions_json TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (name, version)
            )
        `);
    }

    publish(plugin: PluginRecord): void {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO plugins 
            (name, version, description, author, hash, signature, public_key, permissions_json)
            VALUES (@name, @version, @description, @author, @hash, @signature, @public_key, @permissions_json)
        `);
        stmt.run(plugin);
    }

    search(query: string): PluginRecord[] {
        const stmt = this.db.prepare(`
            SELECT * FROM plugins 
            WHERE name LIKE @q OR description LIKE @q OR author LIKE @q
            LIMIT 50
        `);
        return stmt.all({ q: `%${query}%` }) as PluginRecord[];
    }

    get(name: string, version?: string): PluginRecord | undefined {
        if (version) {
            const stmt = this.db.prepare('SELECT * FROM plugins WHERE name = ? AND version = ?');
            return stmt.get(name, version) as PluginRecord | undefined;
        } else {
            // Get latest
            const stmt = this.db.prepare('SELECT * FROM plugins WHERE name = ? ORDER BY created_at DESC LIMIT 1');
            return stmt.get(name) as PluginRecord | undefined;
        }
    }
}

export const marketplaceDB = new MarketplaceDB();
