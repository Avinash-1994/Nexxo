import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { log } from '../utils/logger.js';

export interface FileMetadata {
    path: string;
    hash: string;
    size: number;
    mtime: number;
}

export interface BuildManifest {
    version: string;
    timestamp: number;
    files: Record<string, FileMetadata>;
    dependencies: Record<string, string>; // file -> dependencies hash
    outputs: Record<string, string[]>; // input -> output files
}

/**
 * Incremental Build Manager
 * Tracks file changes and determines what needs to be rebuilt
 */
export class IncrementalBuildManager {
    private root: string;
    private cacheDir: string;
    private manifestPath: string;
    private currentManifest: BuildManifest | null = null;
    private previousManifest: BuildManifest | null = null;

    constructor(root: string) {
        this.root = root;
        this.cacheDir = path.join(root, '.urja', 'incremental');
        this.manifestPath = path.join(this.cacheDir, 'build-manifest.json');
    }

    async initialize(): Promise<void> {
        await fs.mkdir(this.cacheDir, { recursive: true });

        // Load previous manifest
        try {
            const data = await fs.readFile(this.manifestPath, 'utf-8');
            this.previousManifest = JSON.parse(data);
            log.debug('Loaded previous build manifest', {
                category: 'cache',
                files: Object.keys(this.previousManifest?.files || {}).length
            });
        } catch (e) {
            log.debug('No previous build manifest found', { category: 'cache' });
        }

        // Initialize current manifest
        this.currentManifest = {
            version: '1.0.0',
            timestamp: Date.now(),
            files: {},
            dependencies: {},
            outputs: {}
        };
    }

    /**
     * Compute hash for a file
     */
    private async hashFile(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath);
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (e) {
            return '';
        }
    }

    /**
     * Get file metadata
     */
    private async getFileMetadata(filePath: string): Promise<FileMetadata | null> {
        try {
            const stats = await fs.stat(filePath);
            const hash = await this.hashFile(filePath);

            return {
                path: filePath,
                hash,
                size: stats.size,
                mtime: stats.mtimeMs
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Check if a file has changed since last build
     */
    async hasFileChanged(filePath: string): Promise<boolean> {
        if (!this.previousManifest) return true;

        const previousMeta = this.previousManifest.files[filePath];
        if (!previousMeta) return true;

        const currentMeta = await this.getFileMetadata(filePath);
        if (!currentMeta) return true;

        // Quick check: mtime and size
        if (currentMeta.mtime !== previousMeta.mtime ||
            currentMeta.size !== previousMeta.size) {
            // Verify with hash
            return currentMeta.hash !== previousMeta.hash;
        }

        return false;
    }

    /**
     * Get list of changed files from a set of input files
     */
    async getChangedFiles(inputFiles: string[]): Promise<{
        changed: string[];
        unchanged: string[];
        new: string[];
        deleted: string[];
    }> {
        const changed: string[] = [];
        const unchanged: string[] = [];
        const newFiles: string[] = [];
        const previousFiles = this.previousManifest ?
            new Set(Object.keys(this.previousManifest.files)) :
            new Set();

        for (const file of inputFiles) {
            const hasChanged = await this.hasFileChanged(file);
            const isNew = !previousFiles.has(file);

            if (isNew) {
                newFiles.push(file);
                changed.push(file);
            } else if (hasChanged) {
                changed.push(file);
            } else {
                unchanged.push(file);
            }

            previousFiles.delete(file);
        }

        // Remaining files in previousFiles are deleted
        const deleted = Array.from(previousFiles) as string[];

        return { changed, unchanged, new: newFiles, deleted };
    }

    /**
     * Track a file in the current build
     */
    async trackFile(filePath: string, dependencies?: string[]): Promise<void> {
        const metadata = await this.getFileMetadata(filePath);
        if (!metadata || !this.currentManifest) return;

        this.currentManifest.files[filePath] = metadata;

        // Track dependencies
        if (dependencies && dependencies.length > 0) {
            const depsHash = crypto.createHash('sha256')
                .update(dependencies.sort().join('|'))
                .digest('hex');
            this.currentManifest.dependencies[filePath] = depsHash;
        }
    }

    /**
     * Track output files for an input file
     */
    trackOutput(inputFile: string, outputFiles: string[]): void {
        if (!this.currentManifest) return;
        this.currentManifest.outputs[inputFile] = outputFiles;
    }

    /**
     * Get cached outputs for an input file (if unchanged)
     */
    async getCachedOutputs(inputFile: string): Promise<string[] | null> {
        if (!this.previousManifest) return null;

        const hasChanged = await this.hasFileChanged(inputFile);
        if (hasChanged) return null;

        return this.previousManifest.outputs[inputFile] || null;
    }

    /**
     * Save the current manifest
     */
    async save(): Promise<void> {
        if (!this.currentManifest) return;

        await fs.writeFile(
            this.manifestPath,
            JSON.stringify(this.currentManifest, null, 2),
            'utf-8'
        );

        log.info('Incremental build manifest saved', {
            category: 'cache',
            files: Object.keys(this.currentManifest.files).length
        });
    }

    /**
     * Get build statistics
     */
    getStats(): {
        totalFiles: number;
        changedFiles: number;
        cacheHitRate: number;
    } {
        if (!this.currentManifest || !this.previousManifest) {
            return {
                totalFiles: 0,
                changedFiles: 0,
                cacheHitRate: 0
            };
        }

        const totalFiles = Object.keys(this.currentManifest.files).length;
        const previousTotal = Object.keys(this.previousManifest.files).length;
        const changedFiles = totalFiles - previousTotal;
        const cacheHitRate = previousTotal > 0 ?
            ((previousTotal - changedFiles) / previousTotal) * 100 : 0;

        return {
            totalFiles,
            changedFiles,
            cacheHitRate
        };
    }

    /**
     * Clear the incremental cache
     */
    async clear(): Promise<void> {
        try {
            await fs.rm(this.cacheDir, { recursive: true, force: true });
            log.info('Incremental cache cleared', { category: 'cache' });
        } catch (e) {
            log.warn('Failed to clear incremental cache', { category: 'cache', error: e });
        }
    }
}
