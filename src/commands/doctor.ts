import fs from 'fs';
import path from 'path';
import { log } from '../utils/logger.js';
import { loadConfig } from '../config/index.js';
import os from 'os';
import { execSync } from 'child_process';

interface DoctorCheck {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
    fix?: string;
}

export class LunxDoctor {
    private cwd: string;
    private checks: DoctorCheck[] = [];

    constructor(cwd: string) {
        this.cwd = cwd;
    }

    async diagnose(): Promise<void> {
        console.log('\n🩺 Lunx Doctor - Running Diagnostics...\n');

        await this.checkNodeVersion();
        await this.checkPackageJson();
        await this.checkLunxConfig();
        await this.checkDependencies();
        await this.checkGitIgnore();
        await this.checkEnvironment();
        await this.checkDiskSpace();
        await this.checkPortAvailability();
        await this.checkCacheHealth();
        await this.checkPerformance(); // Day 56: Performance diagnostics

        this.printReport();
    }

    private async checkNodeVersion(): Promise<void> {
        const nodeVersion = process.version;
        const major = parseInt(nodeVersion.slice(1).split('.')[0]);

        if (major >= 20) {
            this.addCheck('Node.js Version', 'pass', `${nodeVersion} (recommended)`);
        } else if (major >= 18) {
            this.addCheck('Node.js Version', 'warn', `${nodeVersion} (works, but v20+ recommended)`);
        } else {
            this.addCheck('Node.js Version', 'fail', `${nodeVersion} (unsupported, v18+ required)`, 'Upgrade to Node.js v20+');
        }
    }

    private async checkPackageJson(): Promise<void> {
        const pkgPath = path.join(this.cwd, 'package.json');

        if (!fs.existsSync(pkgPath)) {
            this.addCheck('package.json', 'fail', 'Not found', 'Run `npm init` to create package.json');
            return;
        }

        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

            // Check for lunx in dependencies
            const hasLunx = pkg.dependencies?.lunx || pkg.devDependencies?.lunx;
            if (hasLunx) {
                this.addCheck('package.json', 'pass', `Lunx ${hasLunx} configured`);
            } else {
                this.addCheck('package.json', 'warn', 'Lunx not in dependencies', 'Run `npm install lunx`');
            }

            // Check for scripts
            if (pkg.scripts?.dev || pkg.scripts?.build) {
                this.addCheck('npm scripts', 'pass', 'Build scripts configured');
            } else {
                this.addCheck('npm scripts', 'warn', 'No dev/build scripts', 'Add "dev": "lunx dev" and "build": "lunx build"');
            }
        } catch (e) {
            this.addCheck('package.json', 'fail', 'Invalid JSON', 'Fix JSON syntax errors');
        }
    }

    private async checkLunxConfig(): Promise<void> {
        const configPaths = [
            'lunx.config.ts',
            'lunx.config.js',
            'lunx.config.mjs'
        ];

        const configFile = configPaths.find(p => fs.existsSync(path.join(this.cwd, p)));

        if (configFile) {
            try {
                const config = await loadConfig(this.cwd);
                this.addCheck('Lunx Config', 'pass', `Found ${configFile}`);

                // Validate config
                if (!config.entry || config.entry.length === 0) {
                    this.addCheck('Config Validation', 'warn', 'No entry points defined');
                } else {
                    this.addCheck('Config Validation', 'pass', `${config.entry.length} entry point(s)`);
                }
            } catch (e: any) {
                this.addCheck('Lunx Config', 'fail', `Error loading config: ${e.message}`, 'Check config syntax');
            }
        } else {
            this.addCheck('Lunx Config', 'warn', 'No config file found', 'Run `lunx init` to create one');
        }
    }

    private async checkDependencies(): Promise<void> {
        const nodeModules = path.join(this.cwd, 'node_modules');

        if (!fs.existsSync(nodeModules)) {
            this.addCheck('Dependencies', 'fail', 'node_modules not found', 'Run `npm install`');
            return;
        }

        // Check for common issues
        const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
        const foundLocks = lockFiles.filter(f => fs.existsSync(path.join(this.cwd, f)));

        if (foundLocks.length > 1) {
            this.addCheck('Lock Files', 'warn', `Multiple lock files found: ${foundLocks.join(', ')}`, 'Use only one package manager');
        } else if (foundLocks.length === 1) {
            this.addCheck('Lock Files', 'pass', `Using ${foundLocks[0]}`);
        } else {
            this.addCheck('Lock Files', 'warn', 'No lock file found', 'Commit your lock file to version control');
        }
    }

    private async checkGitIgnore(): Promise<void> {
        const gitignorePath = path.join(this.cwd, '.gitignore');

        if (!fs.existsSync(gitignorePath)) {
            this.addCheck('.gitignore', 'warn', 'Not found', 'Create .gitignore to exclude node_modules, dist, etc.');
            return;
        }

        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        const requiredEntries = ['node_modules', 'dist', '.env'];
        const missing = requiredEntries.filter(entry => !gitignore.includes(entry));

        if (missing.length === 0) {
            this.addCheck('.gitignore', 'pass', 'All essential entries present');
        } else {
            this.addCheck('.gitignore', 'warn', `Missing: ${missing.join(', ')}`, `Add ${missing.join(', ')} to .gitignore`);
        }
    }

    private async checkEnvironment(): Promise<void> {
        const envPath = path.join(this.cwd, '.env');
        const envExamplePath = path.join(this.cwd, '.env.example');

        if (fs.existsSync(envPath)) {
            this.addCheck('Environment', 'pass', '.env file found');

            if (!fs.existsSync(envExamplePath)) {
                this.addCheck('Environment Template', 'warn', '.env.example not found', 'Create .env.example for documentation');
            } else {
                this.addCheck('Environment Template', 'pass', '.env.example found');
            }
        } else {
            this.addCheck('Environment', 'pass', 'No .env file (optional)');
        }
    }

    private async checkDiskSpace(): Promise<void> {
        try {
            const stats = fs.statfsSync ? fs.statfsSync(this.cwd) : null;
            if (stats) {
                const freeGB = (stats.bavail * stats.bsize) / (1024 ** 3);
                if (freeGB > 10) {
                    this.addCheck('Disk Space', 'pass', `${freeGB.toFixed(1)} GB available`);
                } else if (freeGB > 1) {
                    this.addCheck('Disk Space', 'warn', `${freeGB.toFixed(1)} GB available (low)`, 'Free up disk space');
                } else {
                    this.addCheck('Disk Space', 'fail', `${freeGB.toFixed(1)} GB available (critical)`, 'Free up disk space immediately');
                }
            } else {
                this.addCheck('Disk Space', 'pass', 'Unable to check (platform limitation)');
            }
        } catch (e) {
            this.addCheck('Disk Space', 'pass', 'Unable to check');
        }
    }

    private async checkPortAvailability(): Promise<void> {
        const defaultPort = 5173;
        try {
            const config = await loadConfig(this.cwd);
            const port = config.port || defaultPort;

            // Simple check - try to see if something is listening
            try {
                const net = await import('net');
                const server = net.createServer();

                await new Promise<void>((resolve, reject) => {
                    server.once('error', (err: any) => {
                        if (err.code === 'EADDRINUSE') {
                            reject(new Error('Port in use'));
                        } else {
                            resolve();
                        }
                    });

                    server.once('listening', () => {
                        server.close();
                        resolve();
                    });

                    server.listen(port);
                });

                this.addCheck('Port Availability', 'pass', `Port ${port} is available`);
            } catch (e: any) {
                if (e.message === 'Port in use') {
                    this.addCheck('Port Availability', 'warn', `Port ${port} is in use`, `Stop the process using port ${port} or use --port flag`);
                } else {
                    this.addCheck('Port Availability', 'pass', 'Unable to check');
                }
            }
        } catch (e) {
            this.addCheck('Port Availability', 'pass', 'Config not loaded, skipping');
        }
    }

    private async checkCacheHealth(): Promise<void> {
        const cacheDir = path.join(this.cwd, 'node_modules', '.lunx');

        if (!fs.existsSync(cacheDir)) {
            this.addCheck('Build Cache', 'pass', 'No cache yet (will be created on first build)');
            return;
        }

        try {
            const stats = fs.statSync(cacheDir);
            const sizeBytes = this.getDirectorySize(cacheDir);
            const sizeMB = sizeBytes / (1024 ** 2);

            if (sizeMB > 1000) {
                this.addCheck('Build Cache', 'warn', `${sizeMB.toFixed(0)} MB (large)`, 'Consider clearing cache with `rm -rf node_modules/.lunx`');
            } else {
                this.addCheck('Build Cache', 'pass', `${sizeMB.toFixed(0)} MB`);
            }
        } catch (e) {
            this.addCheck('Build Cache', 'pass', 'Unable to check cache size');
        }
    }

    private getDirectorySize(dirPath: string): number {
        let size = 0;
        try {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    size += this.getDirectorySize(filePath);
                } else {
                    size += stats.size;
                }
            }
        } catch (e) {
            // Ignore errors
        }
        return size;
    }

    private async checkPerformance(): Promise<void> {
        // Check if build output exists
        const buildDir = path.join(this.cwd, 'build_output');
        const distDir = path.join(this.cwd, 'dist');
        const outputDir = fs.existsSync(buildDir) ? buildDir : fs.existsSync(distDir) ? distDir : null;

        if (!outputDir) {
            this.addCheck('Performance', 'pass', 'No build output yet (run `lunx build` first)');
            return;
        }

        try {
            // Analyze bundle sizes
            const jsFiles = this.findFiles(outputDir, '.js');
            const totalSize = jsFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
            const totalKB = totalSize / 1024;

            if (totalKB < 100) {
                this.addCheck('Bundle Size', 'pass', `${totalKB.toFixed(1)} KB (excellent)`);
            } else if (totalKB < 300) {
                this.addCheck('Bundle Size', 'pass', `${totalKB.toFixed(1)} KB (good)`);
            } else if (totalKB < 500) {
                this.addCheck('Bundle Size', 'warn', `${totalKB.toFixed(1)} KB (consider optimization)`, 'Enable tree-shaking and minification');
            } else {
                this.addCheck('Bundle Size', 'warn', `${totalKB.toFixed(1)} KB (large)`, 'Review dependencies and enable aggressive optimization');
            }

            // Check for source maps
            const mapFiles = this.findFiles(outputDir, '.map');
            if (mapFiles.length > 0) {
                this.addCheck('Source Maps', 'pass', `${mapFiles.length} source map(s) generated`);
            }

            // Check for compression
            const gzFiles = this.findFiles(outputDir, '.gz');
            const brFiles = this.findFiles(outputDir, '.br');
            if (gzFiles.length > 0 || brFiles.length > 0) {
                this.addCheck('Compression', 'pass', `Gzip: ${gzFiles.length}, Brotli: ${brFiles.length}`);
            } else {
                this.addCheck('Compression', 'warn', 'No compressed assets', 'Enable gzip/brotli compression for production');
            }

        } catch (e) {
            this.addCheck('Performance', 'pass', 'Unable to analyze build output');
        }
    }

    private findFiles(dir: string, ext: string): string[] {
        const files: string[] = [];
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    files.push(...this.findFiles(fullPath, ext));
                } else if (item.endsWith(ext)) {
                    files.push(fullPath);
                }
            }
        } catch (e) {
            // Ignore errors
        }
        return files;
    }

    private addCheck(name: string, status: 'pass' | 'warn' | 'fail', message: string, fix?: string): void {
        this.checks.push({ name, status, message, fix });
    }

    private printReport(): void {
        console.log('\n📋 Diagnostic Report\n');
        console.log('='.repeat(80));

        const passed = this.checks.filter(c => c.status === 'pass').length;
        const warnings = this.checks.filter(c => c.status === 'warn').length;
        const failures = this.checks.filter(c => c.status === 'fail').length;

        for (const check of this.checks) {
            const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️ ' : '❌';
            const color = check.status === 'pass' ? '\x1b[32m' : check.status === 'warn' ? '\x1b[33m' : '\x1b[31m';
            const reset = '\x1b[0m';

            console.log(`${icon} ${color}${check.name}${reset}: ${check.message}`);
            if (check.fix) {
                console.log(`   💡 Fix: ${check.fix}`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 Summary: ${passed} passed, ${warnings} warnings, ${failures} failures\n`);

        // System info
        console.log('💻 System Information:');
        console.log(`   OS: ${os.platform()} ${os.release()}`);
        console.log(`   Node: ${process.version}`);
        console.log(`   CPU: ${os.cpus()[0].model} (${os.cpus().length} cores)`);
        console.log(`   Memory: ${(os.totalmem() / (1024 ** 3)).toFixed(1)} GB total, ${(os.freemem() / (1024 ** 3)).toFixed(1)} GB free`);

        // Try to get Lunx version
        try {
            const pkgPath = path.join(this.cwd, 'node_modules', 'lunx', 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                console.log(`   Lunx: v${pkg.version}`);
            }
        } catch (e) {
            // Ignore
        }

        console.log('');

        if (failures > 0) {
            console.log('❌ Critical issues found. Please address the failures above.\n');
            process.exit(1);
        } else if (warnings > 0) {
            console.log('⚠️  Some warnings detected. Consider addressing them for optimal performance.\n');
        } else {
            console.log('✅ All checks passed! Your Lunx project is healthy.\n');
        }
    }
}

export async function runDoctor(cwd: string = process.cwd()): Promise<void> {
    const doctor = new LunxDoctor(cwd);
    await doctor.diagnose();
}
