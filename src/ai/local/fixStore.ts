import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { LearnedError } from '../core/errorMemory.js';
import { FixAction } from '../healer/fixer.js';

export class FixStore {
    private db: Database.Database;

    constructor(rootDir: string) {
        const dbDir = path.join(rootDir, '.nexxo');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        this.db = new Database(path.join(dbDir, 'ai-fixes.db'));
        this.init();
    }

    private init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS errors (
                id TEXT PRIMARY KEY,
                signature TEXT,
                type TEXT,
                context TEXT,
                timestamp INTEGER
            );
            CREATE TABLE IF NOT EXISTS fixes (
                id TEXT PRIMARY KEY,
                error_id TEXT,
                recipe TEXT,
                success_count INTEGER DEFAULT 0,
                fail_count INTEGER DEFAULT 0,
                last_used INTEGER,
                FOREIGN KEY(error_id) REFERENCES errors(id)
            );
        `);
    }

    saveError(error: LearnedError) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO errors (id, signature, type, context, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(error.id, error.signature, error.type, JSON.stringify(error.context), error.timestamp);
    }

    saveFix(errorId: string, fix: FixAction) {
        const fixId = this.generateFixId(errorId, fix);
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO fixes (id, error_id, recipe, last_used)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(fixId, errorId, JSON.stringify(fix), Date.now());
        return fixId;
    }

    findFixes(errorId: string): FixAction[] {
        // Score = (success / (success + fail + 1)) * log(last_used)
        // This favors successful fixes, but also gives a slight boost to recently used ones
        const stmt = this.db.prepare(`
            SELECT recipe, success_count, fail_count 
            FROM fixes 
            WHERE error_id = ? 
        `);
        const rows = stmt.all(errorId) as { recipe: string, success_count: number, fail_count: number }[];

        return rows.sort((a, b) => {
            const scoreA = this.calculateScore(a.success_count, a.fail_count);
            const scoreB = this.calculateScore(b.success_count, b.fail_count);
            return scoreB - scoreA;
        }).map(row => JSON.parse(row.recipe));
    }

    private calculateScore(success: number, fail: number): number {
        const total = success + fail;
        if (total === 0) return 0;
        return success / total; // Simple ratio for now
    }

    recordOutcome(fixId: string, success: boolean) {
        const stmt = this.db.prepare(`
            UPDATE fixes 
            SET success_count = success_count + ?,
                fail_count = fail_count + ?,
                last_used = ?
            WHERE id = ?
        `);
        stmt.run(success ? 1 : 0, success ? 0 : 1, Date.now(), fixId);
    }

    private generateFixId(errorId: string, fix: FixAction): string {
        // Simple hash of errorId + fix content
        const content = errorId + JSON.stringify(fix);
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    getStats() {
        const errorCount = this.db.prepare('SELECT COUNT(*) as c FROM errors').get() as { c: number };
        const fixCount = this.db.prepare('SELECT COUNT(*) as c FROM fixes').get() as { c: number };
        const successCount = this.db.prepare('SELECT SUM(success_count) as c FROM fixes').get() as { c: number };

        return {
            errors: errorCount.c,
            fixes: fixCount.c,
            successfulFixes: successCount.c || 0
        };
    }

    deleteError(errorId: string) {
        this.db.prepare('DELETE FROM fixes WHERE error_id = ?').run(errorId);
        this.db.prepare('DELETE FROM errors WHERE id = ?').run(errorId);
    }
}
