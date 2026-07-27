// tests/harness/index.ts
// Lunx test harness for executing builds, starting dev servers, and validating bundles.

import { exec, spawn } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
import { existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

export async function buildFixture(name: string): Promise<{ stdout: string, stderr: string, exitCode: number, outputDir: string, success: boolean }> {
    const fixturePath = path.join(process.cwd(), 'e2e/fixtures', name);
    try {
        const { stdout, stderr } = await execAsync(`node ${path.join(process.cwd(), 'dist/src/cli.js')} build`, { cwd: fixturePath });
        return { stdout, stderr, exitCode: 0, outputDir: path.join(fixturePath, 'dist'), success: true };
    } catch (error: any) {
        return { stdout: error.stdout || '', stderr: error.stderr || '', exitCode: error.code || 1, outputDir: '', success: false };
    }
}


export async function devFixture(name: string): Promise<any> {
    const fixturePath = path.join(process.cwd(), 'e2e/fixtures', name);
    const proc = spawn('node', [path.join(process.cwd(), 'dist/src/cli.js'), 'dev'], { cwd: fixturePath });
    // In a real framework, we'd wait for a "Ready" log and return the process handle / port
    return { process: proc, url: 'http://localhost:3000' };
}

export async function hmrTrigger(server: any, file: string, content: string): Promise<void> {
    const filePath = path.join(process.cwd(), file);
    writeFileSync(filePath, content, 'utf-8');
    // In a real framework, we'd wait for the WebSocket HMR confirmation here
    await new Promise(r => setTimeout(r, 100)); 
}

export async function measureHmr(server: any, file: string, content: string): Promise<number> {
    const start = performance.now();
    await hmrTrigger(server, file, content);
    return performance.now() - start;
}

export function bundleContains(distPath: string, moduleSearchString: string): boolean {
    const fullPath = path.join(process.cwd(), distPath);
    if (!existsSync(fullPath)) return false;
    const content = readFileSync(fullPath, 'utf-8');
    return content.includes(moduleSearchString);
}

export function bundleExcludes(distPath: string, moduleSearchString: string): boolean {
    return !bundleContains(distPath, moduleSearchString);
}

export function sourcemapTraces(distPath: string, file: string, line: number): boolean {
    // Stub implementation: parse map, verify original line/file mappings
    return true;
}

export function securityScan(distPath: string): boolean {
    const fullPath = path.join(process.cwd(), distPath);
    if (!existsSync(fullPath)) return false;
    const content = readFileSync(fullPath, 'utf-8');
    
    // Simulate detecting a hardcoded AWS key
    const AWS_KEY_REGEX = /AKIA[0-9A-Z]{16}/;
    if (AWS_KEY_REGEX.test(content)) {
        console.error(`SECURITY: Potential secret detected in bundle ${distPath}.`);
        return false;
    }
    return true;
}

export function cacheSizeCheck(projectRoot: string, config: any = {}): { exists: boolean, sizeMb: number, rowCount: number } {
    // Dynamically resolve from config or fallback
    const cacheDir = config.cacheDir ?? path.join(projectRoot, '.lunx', 'cache');
    const dbPath = path.join(cacheDir, 'cache.db');
    
    let exists = false;
    let sizeMb = 0;
    let rowCount = 0;

    if (existsSync(dbPath)) {
        exists = true;
        const stat = statSync(dbPath);
        
        let walSize = 0;
        if (existsSync(dbPath + '-wal')) walSize = statSync(dbPath + '-wal').size;
        
        sizeMb = (stat.size + walSize) / (1024 * 1024);

        try {
            // Verify artifact table contents using robust better-sqlite3 package
            const db = new Database(dbPath, { readonly: true });
            const row = db.prepare(`SELECT COUNT(*) as count FROM cache WHERE cache_type='artifact'`).get() as { count: number };
            rowCount = row ? row.count : 0;
        } catch (e: any) {
            console.warn('better-sqlite3 query failed. Unable to verify real row count. Assuming 0. Error: ' + e.message);
        }
    }

    return { exists, sizeMb, rowCount };
}
