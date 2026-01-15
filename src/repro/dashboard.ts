import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import type { BuildContext } from '../core/engine/types.js';
import type { RootCauseIssue } from '../visual/root-cause.js';

/**
 * Repro Dashboard
 * Bug reproduction analysis and storage system
 */

export interface ReproCase {
    id: string;
    title: string;
    description: string;
    code: string;
    error?: string;
    stackTrace?: string;
    buildConfig?: any;
    analysis?: ReproAnalysis;
    createdAt: number;
    shareableLink?: string;
}

export interface ReproAnalysis {
    issues: RootCauseIssue[];
    suggestedFixes: string[];
    affectedModules: string[];
    analysisTime: number;
}

export class ReproDashboard {
    private db: Database.Database | null = null;
    private dbPath: string;

    constructor(dbPath: string = ':memory:') {
        this.dbPath = dbPath;
    }

    /**
     * Initialize database
     */
    init(): void {
        this.db = new Database(this.dbPath);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS repros (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                code TEXT NOT NULL,
                error TEXT,
                stack_trace TEXT,
                build_config TEXT,
                analysis TEXT,
                created_at INTEGER NOT NULL,
                shareable_link TEXT
            )
        `);
    }

    /**
     * Submit a bug repro
     */
    submitRepro(repro: Omit<ReproCase, 'id' | 'createdAt' | 'shareableLink'>): string {
        if (!this.db) this.init();

        const id = this.generateReproId(repro.code);
        const createdAt = Date.now();
        const shareableLink = this.generateShareableLink(id);

        const stmt = this.db!.prepare(`
            INSERT INTO repros (id, title, description, code, error, stack_trace, build_config, analysis, created_at, shareable_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            repro.title,
            repro.description || '',
            repro.code,
            repro.error || null,
            repro.stackTrace || null,
            repro.buildConfig ? JSON.stringify(repro.buildConfig) : null,
            repro.analysis ? JSON.stringify(repro.analysis) : null,
            createdAt,
            shareableLink
        );

        return id;
    }

    /**
     * Analyze a repro case
     */
    async analyzeRepro(reproId: string, ctx?: BuildContext): Promise<ReproAnalysis> {
        const startTime = Date.now();

        const repro = this.getRepro(reproId);
        if (!repro) {
            throw new Error(`Repro ${reproId} not found`);
        }

        // Analyze the code for issues
        const issues: RootCauseIssue[] = [];
        const suggestedFixes: string[] = [];
        const affectedModules: string[] = [];

        // Parse error and suggest fixes
        if (repro.error) {
            if (repro.error.includes('Cannot find module')) {
                issues.push({
                    type: 'unused-dep',
                    severity: 'critical',
                    message: 'Module not found',
                    fix: 'Install the missing dependency or check the import path',
                    affectedNodes: []
                });
                suggestedFixes.push('npm install <missing-module>');
            }

            if (repro.error.includes('Unexpected token')) {
                issues.push({
                    type: 'dead-code',
                    severity: 'critical',
                    message: 'Syntax error detected',
                    fix: 'Check for syntax errors in the code',
                    affectedNodes: []
                });
                suggestedFixes.push('Review code syntax');
            }

            if (repro.error.includes('circular dependency')) {
                issues.push({
                    type: 'circular-dep',
                    severity: 'warning',
                    message: 'Circular dependency detected',
                    fix: 'Refactor to remove circular dependency',
                    affectedNodes: []
                });
                suggestedFixes.push('Refactor module structure');
            }
        }

        const analysisTime = Date.now() - startTime;

        const analysis: ReproAnalysis = {
            issues,
            suggestedFixes,
            affectedModules,
            analysisTime
        };

        // Store analysis
        this.updateReproAnalysis(reproId, analysis);

        return analysis;
    }

    /**
     * Get a repro case
     */
    getRepro(id: string): ReproCase | null {
        if (!this.db) this.init();

        const stmt = this.db!.prepare('SELECT * FROM repros WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            error: row.error,
            stackTrace: row.stack_trace,
            buildConfig: row.build_config ? JSON.parse(row.build_config) : undefined,
            analysis: row.analysis ? JSON.parse(row.analysis) : undefined,
            createdAt: row.created_at,
            shareableLink: row.shareable_link
        };
    }

    /**
     * Get all repros
     */
    getAllRepros(): ReproCase[] {
        if (!this.db) this.init();

        const stmt = this.db!.prepare('SELECT * FROM repros ORDER BY created_at DESC');
        const rows = stmt.all() as any[];

        return rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            error: row.error,
            stackTrace: row.stack_trace,
            buildConfig: row.build_config ? JSON.parse(row.build_config) : undefined,
            analysis: row.analysis ? JSON.parse(row.analysis) : undefined,
            createdAt: row.created_at,
            shareableLink: row.shareable_link
        }));
    }

    /**
     * Update repro analysis
     */
    private updateReproAnalysis(id: string, analysis: ReproAnalysis): void {
        if (!this.db) return;

        const stmt = this.db.prepare('UPDATE repros SET analysis = ? WHERE id = ?');
        stmt.run(JSON.stringify(analysis), id);
    }

    /**
     * Generate repro ID
     */
    private generateReproId(code: string): string {
        const hash = createHash('sha256').update(code).digest('hex');
        return `repro-${hash.substring(0, 12)}`;
    }

    /**
     * Generate shareable link
     */
    private generateShareableLink(id: string): string {
        return `https://nexxo.dev/repro/${id}`;
    }

    /**
     * Generate repro template
     */
    generateTemplate(framework: string = 'react'): string {
        const templates: Record<string, string> = {
            react: `import React from 'react';

export default function App() {
  // Your code here
  return <div>Hello World</div>;
}`,
            vue: `<template>
  <div>Hello World</div>
</template>

<script>
export default {
  name: 'App'
}
</script>`,
            svelte: `<script>
  // Your code here
</script>

<div>Hello World</div>`
        };

        return templates[framework] || templates.react;
    }

    /**
     * Replay a repro
     */
    async replayRepro(id: string): Promise<{ success: boolean; error?: string }> {
        const repro = this.getRepro(id);
        if (!repro) {
            return { success: false, error: 'Repro not found' };
        }

        try {
            // Simulate build with repro code
            // In production, this would actually run the build
            await new Promise(resolve => setTimeout(resolve, 100));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Close database connection
     */
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
