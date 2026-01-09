import { BuildSession, ProjectProfile } from './schema.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { log } from '../utils/logger.js';

export class Telemetry {
    private session: BuildSession;
    private telemetryDir: string;

    constructor(rootDir: string) {
        this.telemetryDir = path.join(rootDir, '.nexxo', 'telemetry');
        this.session = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            duration: 0,
            success: false,
            metrics: {}
        };
    }

    async init() {
        await fs.mkdir(this.telemetryDir, { recursive: true });
    }

    start() {
        this.session.timestamp = Date.now();
    }

    async stop(success: boolean, metrics: BuildSession['metrics'] = {}, errors: string[] = []) {
        this.session.duration = Date.now() - this.session.timestamp;
        this.session.success = success;
        this.session.metrics = metrics;
        this.session.errors = errors;
        await this.save();
    }

    private async save() {
        try {
            const filename = `session-${this.session.timestamp}.json`;
            const filePath = path.join(this.telemetryDir, filename);
            await fs.writeFile(filePath, JSON.stringify(this.session, null, 2));
            log.debug(`Telemetry saved to ${filename}`, { category: 'ai' });
        } catch (e) {
            log.warn('Failed to save telemetry', { error: e });
        }
    }

    // Helper to anonymize paths
    static anonymize(text: string, root: string): string {
        return text.replace(new RegExp(root, 'g'), '<PROJECT_ROOT>');
    }

    static async getLatestSession(rootDir: string): Promise<BuildSession | null> {
        const telemetryDir = path.join(rootDir, '.nexxo', 'telemetry');
        try {
            const files = await fs.readdir(telemetryDir);
            if (files.length === 0) return null;

            // Sort by timestamp (filename has timestamp)
            files.sort().reverse();
            const latest = files[0];

            const content = await fs.readFile(path.join(telemetryDir, latest), 'utf-8');
            return JSON.parse(content);
        } catch (e) {
            return null;
        }
    }

    static async getSessions(rootDir: string, limit: number = 10): Promise<BuildSession[]> {
        const telemetryDir = path.join(rootDir, '.nexxo', 'telemetry');
        try {
            const files = await fs.readdir(telemetryDir);
            if (files.length === 0) return [];

            // Sort by timestamp (filename has timestamp)
            files.sort().reverse();
            const recent = files.slice(0, limit);

            const sessions: BuildSession[] = [];
            for (const file of recent) {
                const content = await fs.readFile(path.join(telemetryDir, file), 'utf-8');
                sessions.push(JSON.parse(content));
            }
            return sessions;
        } catch (e) {
            return [];
        }
    }
    static async getTrends(rootDir: string, currentSession: BuildSession): Promise<any> {
        const sessions = await Telemetry.getSessions(rootDir, 5);
        if (sessions.length === 0) return null;

        // Filter out the current session if it's in the list (unlikely if we just started, but good safety)
        const previousSessions = sessions.filter(s => s.id !== currentSession.id);
        if (previousSessions.length === 0) return null;

        const last = previousSessions[0];

        return {
            durationDelta: currentSession.duration - last.duration,
            sizeDelta: (currentSession.metrics?.bundleSize || 0) - (last.metrics?.bundleSize || 0),
            modulesDelta: (currentSession.metrics?.modules || 0) - (last.metrics?.modules || 0),
            successRate: previousSessions.filter(s => s.success).length / previousSessions.length
        };
    }
}
