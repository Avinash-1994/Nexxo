import fs from 'fs/promises';
import path from 'path';
import { loadConfig } from '../config/index.js';
import { startDevServer } from '../dev/devServer.minimal.js';

export async function startWorkspaceOrchestrator(rootDir: string) {
    console.log('\n🚀 Starting Lunx Monorepo Workspace Orchestrator...');
    
    // 1. Auto-discover MFE projects in subdirectories
    async function findProjects(dir: string, depth = 0): Promise<string[]> {
        if (depth > 2) return []; // Limit depth
        let results: string[] = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    const fullPath = path.join(dir, entry.name);
                    try {
                        await fs.access(path.join(fullPath, 'lunx.config.js'));
                        results.push(fullPath);
                    } catch {
                        // Recursively search
                        results.push(...await findProjects(fullPath, depth + 1));
                    }
                }
            }
        } catch { }
        return results;
    }

    const projectPaths = await findProjects(rootDir);

    if (projectPaths.length === 0) {
        console.error('❌ No Lunx projects (with lunx.config.js) found in subdirectories!');
        process.exit(1);
    }

    console.log(`📦 Discovered ${projectPaths.length} micro frontends: \n   - ${projectPaths.map(p => path.relative(rootDir, p)).join('\n   - ')}\n`);

    // 2. Determine architecture roles and assign ports
    let currentRemotePort = 3001;
    const targets = [];

    for (const projPath of projectPaths) {
        try {
            const config = await loadConfig(projPath);
            const isHost = config.federation && config.federation.remotes && Object.keys(config.federation.remotes).length > 0;
            const projectName = config.federation?.name || path.basename(projPath);
            const definedPort = config.server?.port || (isHost ? 3000 : currentRemotePort++);
            
            targets.push({
                path: projPath,
                name: projectName,
                isHost,
                port: definedPort
            });
        } catch (e: any) {
            console.error(`⚠️ Failed to parse config for ${projPath}: ${e.message}`);
        }
    }

    // Sort to start Remotes first, then Host
    targets.sort((a, b) => (a.isHost === b.isHost) ? 0 : a.isHost ? 1 : -1);

    // 3. Boot up the entire cluster sequentially to avoid port allocation races
    for (const target of targets) {
        const role = target.isHost ? '🏠 HOST' : '🔗 REMOTE';
        console.log(`🌀 Booting ${role} [${target.name}] -> Port ${target.port}`);
        
        try {
            await startDevServer({ root: target.path, port: target.port, server: { host: '0.0.0.0' } } as any);
        } catch (e: any) {
            console.error(`❌ [${target.name}] Failed to start: ${e.message}`);
        }
    }

    console.log('\n✅ All Micro Frontends are Live within the unified terminal!\n');
}
