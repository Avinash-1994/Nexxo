import { AnonymizedLearning } from './telemetry.js';
import { AIConfig } from '../config.js';
import { log } from '../../utils/logger.js';

export interface CloudResponse {
    success: boolean;
    newPatterns: number;
    improvedAccuracy: string;
    modelVersion: string;
    message?: string;
}

export interface GlobalPattern {
    errorSignature: string;
    fixSignature: string;
    successRate: number;
    usageCount: number;
    framework: string;
    fix: any; // FixAction
}

export class CloudAPI {
    private baseUrl: string;
    private apiKey: string;
    private userId: string;

    constructor(private config: AIConfig) {
        // Production API endpoint
        this.baseUrl = process.env.NEXTGEN_CLOUD_API || 'https://api.nextgen.build';
        this.apiKey = config.apiKey || process.env.NEXTGEN_API_KEY || '';
        this.userId = this.getOrCreateUserId();
    }

    private getOrCreateUserId(): string {
        // Generate anonymous user ID (stored locally)
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.nextgen', 'user.json');

        try {
            if (fs.existsSync(configPath)) {
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return data.userId;
            }
        } catch (e) {
            // Ignore
        }

        // Create new anonymous ID
        const userId = 'anon-' + Math.random().toString(36).substring(2, 15);
        try {
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ userId, createdAt: Date.now() }));
        } catch (e) {
            log.warn('Could not save user ID', { category: 'ai' });
        }

        return userId;
    }

    async uploadLearnings(learnings: AnonymizedLearning[]): Promise<CloudResponse> {
        if (!this.config.enabled || this.config.provider === 'local') {
            return {
                success: false,
                newPatterns: 0,
                improvedAccuracy: '0%',
                modelVersion: 'local',
                message: 'Cloud sync disabled (local mode)'
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/learnings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-User-Id': this.userId
                },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: `session-${Date.now()}`,
                    learnings
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                newPatterns: data.newPatterns || 0,
                improvedAccuracy: data.improvedAccuracy || '0%',
                modelVersion: data.modelVersion || 'v1.0.0'
            };

        } catch (error) {
            log.error('Failed to upload learnings', { error, category: 'ai' });
            return {
                success: false,
                newPatterns: 0,
                improvedAccuracy: '0%',
                modelVersion: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async downloadPatterns(limit: number = 10000): Promise<GlobalPattern[]> {
        if (!this.config.enabled || this.config.provider === 'local') {
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/patterns?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-User-Id': this.userId
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.patterns || [];

        } catch (error) {
            log.error('Failed to download patterns', { error, category: 'ai' });
            return [];
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'X-User-Id': this.userId }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
