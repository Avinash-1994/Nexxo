import fs from 'fs/promises';
import path from 'path';
import { FixAction } from './fixer.js';
import { log } from '../../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FixStore } from '../local/fixStore.js';

const execAsync = promisify(exec);

export class FixApplier {
    private store: FixStore;

    constructor(private root: string) {
        this.store = new FixStore(root);
    }

    async apply(fix: FixAction, fixId?: string): Promise<boolean> {
        log.info(`Applying fix: ${fix.description}`, { category: 'ai' });

        // 1. Backup
        const backupFiles: string[] = [];
        if (fix.type === 'FILE_EDIT' && fix.file) {
            const filePath = path.join(this.root, fix.file);
            await this.backup(filePath);
            backupFiles.push(filePath);
        }

        try {
            // 2. Apply
            let success = false;
            if (fix.type === 'SHELL_COMMAND' && fix.command) {
                await execAsync(fix.command, { cwd: this.root });
                success = true; // Command ran without error
            } else if (fix.type === 'FILE_EDIT' && fix.file && fix.diff) {
                // TODO: Real patch application. For now, we assume success if we could write
                log.warn('File edit application not fully implemented yet', { category: 'ai' });
                success = false;
            }

            // 3. Verify (Optional: could run build here)
            // For Phase 1, we assume if the command/edit succeeded, the fix is "applied". 
            // Real verification happens on the NEXT build.

            if (success && fixId) {
                this.store.recordOutcome(fixId, true);
            }

            return success;

        } catch (e) {
            log.error('Failed to apply fix', { error: e });

            // 4. Rollback
            for (const file of backupFiles) {
                await this.rollback(file);
            }

            if (fixId) {
                this.store.recordOutcome(fixId, false);
            }

            return false;
        }
    }

    private async backup(filePath: string) {
        try {
            const content = await fs.readFile(filePath);
            await fs.writeFile(`${filePath}.bak`, content);
        } catch (e) {
            // Ignore if file doesn't exist
        }
    }

    async rollback(filePath: string) {
        try {
            const bakPath = `${filePath}.bak`;
            await fs.copyFile(bakPath, filePath);
            await fs.unlink(bakPath);
            log.info(`Rolled back ${path.basename(filePath)}`, { category: 'ai' });
        } catch (e) {
            log.error('Rollback failed', { error: e });
        }
    }
}
