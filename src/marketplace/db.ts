
/**
 * Lunx Marketplace Database
 * Implementation: SQLite (via better-sqlite3) for Local Registry
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('.lunx-marketplace.db');
const ARTIFACT_ROOT = path.resolve('.lunx-marketplace-artifacts');

export interface PluginRecord {
    name: string;
    version: string;
    description: string;
    author: string;
    hash: string;
    signature: string;
    public_key: string;
    permissions_json: string;
    artifact_path?: string;
    created_at: string;
}

export class MarketplaceDB {
    private db: Database.Database;

    constructor(dbPath: string = DB_PATH) {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        fs.mkdirSync(ARTIFACT_ROOT, { recursive: true });

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
                artifact_path TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (name, version)
            )
        `);

        try {
            this.db.exec('ALTER TABLE plugins ADD COLUMN artifact_path TEXT');
        } catch {
            // Column already exists or SQLite older version; ignore.
        }
    }

    private ensureArtifactDirectory(name: string, version: string) {
        const pluginDir = path.join(ARTIFACT_ROOT, name, version);
        fs.mkdirSync(pluginDir, { recursive: true });
        return pluginDir;
    }

    publish(plugin: PluginRecord, artifactBuffer?: Buffer): void {
        if (artifactBuffer) {
            const artifactDir = this.ensureArtifactDirectory(plugin.name, plugin.version);
            const artifactPath = path.join(artifactDir, 'plugin.wasm');
            fs.writeFileSync(artifactPath, artifactBuffer);
            plugin.artifact_path = artifactPath;
        }

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO plugins 
            (name, version, description, author, hash, signature, public_key, permissions_json, artifact_path)
            VALUES (@name, @version, @description, @author, @hash, @signature, @public_key, @permissions_json, @artifact_path)
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
            const stmt = this.db.prepare('SELECT * FROM plugins WHERE name = ? ORDER BY datetime(created_at) DESC, version DESC LIMIT 1');
            return stmt.get(name) as PluginRecord | undefined;
        }
    }

    listVersions(name: string): PluginRecord[] {
        const stmt = this.db.prepare('SELECT * FROM plugins WHERE name = ? ORDER BY datetime(created_at) DESC, version DESC');
        return stmt.all(name) as PluginRecord[];
    }

    getArtifact(name: string, version?: string): Buffer | undefined {
        const plugin = this.get(name, version);
        if (!plugin || !plugin.artifact_path) return undefined;
        if (!fs.existsSync(plugin.artifact_path)) return undefined;
        return fs.readFileSync(plugin.artifact_path);
    }
}

export const marketplaceDB = new MarketplaceDB();
