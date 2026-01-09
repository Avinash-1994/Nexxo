import { log } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface AIConfig {
    provider: 'openai' | 'groq' | 'anthropic' | 'local';
    apiKey?: string;
    model?: string;
    localEndpoint?: string;
}

export class AIClient {
    private config: AIConfig;
    private cacheDir: string;

    constructor(config: AIConfig, rootDir: string) {
        this.config = config;
        this.cacheDir = path.join(rootDir, '.nexxo', 'ai-cache');
    }

    async init() {
        await fs.mkdir(this.cacheDir, { recursive: true });
    }

    async complete(prompt: string, systemPrompt?: string): Promise<string> {
        const cacheKey = this.getCacheKey(prompt, systemPrompt);
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            log.debug('AI Cache hit', { category: 'ai' });
            return cached;
        }

        log.info('Querying AI Model...', { category: 'ai' });

        let response = '';
        try {
            if (this.config.provider === 'local') {
                response = await this.mockLocalInference(prompt);
            } else {
                // Placeholder for real API calls
                // await this.callProvider(prompt, systemPrompt);
                response = `[Mock AI Response] Analysis of: ${prompt.substring(0, 50)}...`;
            }

            await this.saveToCache(cacheKey, response);
            return response;
        } catch (e) {
            log.error('AI Request failed', { error: e });
            throw e;
        }
    }

    private getCacheKey(prompt: string, system?: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(prompt);
        if (system) hash.update(system);
        hash.update(this.config.model || 'default');
        return hash.digest('hex');
    }

    private async getFromCache(key: string): Promise<string | null> {
        try {
            return await fs.readFile(path.join(this.cacheDir, key), 'utf-8');
        } catch {
            return null;
        }
    }

    private async saveToCache(key: string, content: string) {
        try {
            await fs.writeFile(path.join(this.cacheDir, key), content);
        } catch (e) {
            // Ignore cache write errors
        }
    }

    private async mockLocalInference(prompt: string): Promise<string> {
        // Simulate latency
        await new Promise(r => setTimeout(r, 500));
        return "Local AI: I see you're trying to build something cool. Here is a suggestion...";
    }
}
