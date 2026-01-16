/**
 * Migration Generator (Day 44)
 * 
 * Generates Nexxo project configuration from a MigrationPlan.
 * Creates nexxo.config.ts, updates package.json, and generates migration report.
 */

import fs from 'fs';
import path from 'path';
import { MigrationPlan, ToolchainType, Framework } from './analyzer.js';

export interface GeneratorOptions {
    dryRun?: boolean;
    backup?: boolean;
}

export class MigrationGenerator {
    private plan: MigrationPlan;
    private targetDir: string;
    private options: GeneratorOptions;

    constructor(plan: MigrationPlan, targetDir: string, options: GeneratorOptions = {}) {
        this.plan = plan;
        this.targetDir = path.resolve(targetDir);
        this.options = {
            dryRun: options.dryRun ?? false,
            backup: options.backup ?? true
        };
    }

    async generate(): Promise<{ success: boolean; report: string; files: string[] }> {
        const files: string[] = [];

        // Backup existing files if not dry run
        if (!this.options.dryRun && this.options.backup) {
            this.backupExistingFiles();
        }

        // Generate nexxo.config.ts
        const configContent = this.generateNexxoConfig();
        files.push('nexxo.config.ts');
        if (!this.options.dryRun) {
            fs.writeFileSync(path.join(this.targetDir, 'nexxo.config.ts'), configContent);
        }

        // Update package.json
        const packageJsonUpdates = this.generatePackageJsonUpdates();
        files.push('package.json');
        if (!this.options.dryRun) {
            this.updatePackageJson(packageJsonUpdates);
        }

        // Generate migration report
        const report = this.generateMigrationReport();
        files.push('MIGRATION_REPORT.md');
        if (!this.options.dryRun) {
            fs.writeFileSync(path.join(this.targetDir, 'MIGRATION_REPORT.md'), report);
        }

        return {
            success: true,
            report,
            files
        };
    }

    private backupExistingFiles(): void {
        const backupDir = path.join(this.targetDir, '.nexxo-migration-backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const filesToBackup = ['package.json'];

        // Backup old config files
        const oldConfigs = [
            'vite.config.js', 'vite.config.ts', 'vite.config.mjs',
            'webpack.config.js', 'webpack.config.ts',
            'rollup.config.js', 'rollup.config.ts',
            'angular.json'
        ];

        for (const file of [...filesToBackup, ...oldConfigs]) {
            const srcPath = path.join(this.targetDir, file);
            if (fs.existsSync(srcPath)) {
                const destPath = path.join(backupDir, file);
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    private generateNexxoConfig(): string {
        const { frameworks, cssSetup, projectStructure } = this.plan;
        const primaryFramework = frameworks[0] || 'react';

        // Determine preset
        let preset = 'spa';
        // Could be enhanced to detect SSR/SSG from existing config

        // Build config object
        const config: any = {
            root: '.',
            entry: projectStructure.entryPoints.length > 0
                ? projectStructure.entryPoints
                : ['src/main.ts'],
            mode: 'development',
            outDir: 'dist',
            port: 3000,
            platform: 'browser',
            preset,
        };

        // Add framework if detected
        if (primaryFramework !== 'unknown') {
            config.framework = primaryFramework;
        }

        // Add CSS configuration
        if (cssSetup.hasTailwind || cssSetup.hasSass || cssSetup.hasCSSModules) {
            config.css = {};

            if (cssSetup.hasTailwind) {
                config.css.framework = 'tailwind';
            }

            config.css.purge = true;
            config.css.critical = true;
        }

        // Add build optimizations
        config.build = {
            minify: true,
            sourcemap: 'external',
            splitting: true
        };

        // Generate TypeScript config file
        return `import { defineConfig } from 'nexxo';

export default defineConfig(${JSON.stringify(config, null, 2)});
`;
    }

    private generatePackageJsonUpdates(): any {
        const scripts: Record<string, string> = {
            'dev': 'nexxo dev',
            'build': 'nexxo build',
            'preview': 'nexxo preview',
            'test': 'nexxo test',
            'audit': 'nexxo audit'
        };

        // Mark old scripts as deprecated
        const deprecatedScripts: Record<string, string> = {};

        switch (this.plan.toolchainType) {
            case 'vite':
                deprecatedScripts['dev:vite'] = 'vite # DEPRECATED: Use npm run dev';
                deprecatedScripts['build:vite'] = 'vite build # DEPRECATED: Use npm run build';
                break;
            case 'webpack':
                deprecatedScripts['dev:webpack'] = 'webpack serve # DEPRECATED: Use npm run dev';
                deprecatedScripts['build:webpack'] = 'webpack # DEPRECATED: Use npm run build';
                break;
            case 'angular-cli':
                deprecatedScripts['ng'] = 'ng # DEPRECATED: Use nexxo commands';
                break;
        }

        return {
            scripts: { ...scripts, ...deprecatedScripts },
            devDependencies: {
                'nexxo': '^2.0.0'
            }
        };
    }

    private updatePackageJson(updates: any): void {
        const pkgPath = path.join(this.targetDir, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        // Merge scripts
        pkg.scripts = {
            ...pkg.scripts,
            ...updates.scripts
        };

        // Add Nexxo to devDependencies
        pkg.devDependencies = {
            ...pkg.devDependencies,
            ...updates.devDependencies
        };

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }

    private generateMigrationReport(): string {
        const { toolchainType, frameworks, riskLevel, autoMigrate, manualSteps, cssSetup } = this.plan;

        let report = `# Nexxo Migration Report\n\n`;
        report += `**Generated**: ${new Date().toISOString()}\n\n`;
        report += `## Source Project\n\n`;
        report += `- **Toolchain**: ${toolchainType}\n`;
        report += `- **Frameworks**: ${frameworks.join(', ')}\n`;
        report += `- **Risk Level**: ${riskLevel}\n\n`;

        report += `## CSS Setup\n\n`;
        report += `- Tailwind: ${cssSetup.hasTailwind ? '✅' : '❌'}\n`;
        report += `- Sass/SCSS: ${cssSetup.hasSass ? '✅' : '❌'}\n`;
        report += `- CSS Modules: ${cssSetup.hasCSSModules ? '✅' : '❌'}\n`;
        report += `- CSS-in-JS: ${cssSetup.hasCSSInJS ? `✅ (${cssSetup.cssInJSLibrary})` : '❌'}\n\n`;

        report += `## Auto-Migrated ✅\n\n`;
        report += `The following items have been automatically configured:\n\n`;
        for (const item of autoMigrate) {
            report += `- ${item}\n`;
        }
        report += `\n`;

        report += `## Manual Steps Required ⚠️\n\n`;
        report += `Please complete the following steps manually:\n\n`;
        for (let i = 0; i < manualSteps.length; i++) {
            report += `${i + 1}. ${manualSteps[i]}\n`;
        }
        report += `\n`;

        report += `## Next Steps\n\n`;
        report += `1. Review the generated \`nexxo.config.ts\`\n`;
        report += `2. Install dependencies: \`npm install\`\n`;
        report += `3. Start dev server: \`npm run dev\`\n`;
        report += `4. Test your application thoroughly\n`;
        report += `5. Update CI/CD pipelines to use Nexxo commands\n\n`;

        report += `## Known Limitations\n\n`;
        if (riskLevel === 'HIGH') {
            report += `⚠️ **HIGH RISK**: This project has many customizations. `;
            report += `Expect significant manual work to complete migration.\n\n`;
        } else if (riskLevel === 'MEDIUM') {
            report += `⚠️ **MEDIUM RISK**: Some custom plugins/loaders detected. `;
            report += `Review and test carefully.\n\n`;
        } else {
            report += `✅ **LOW RISK**: Standard project structure. `;
            report += `Migration should be straightforward.\n\n`;
        }

        report += `## Support\n\n`;
        report += `- Documentation: https://nexxo.dev/docs/migration\n`;
        report += `- Issues: https://github.com/nexxo/nexxo/issues\n`;
        report += `- Discord: https://discord.gg/nexxo\n\n`;

        report += `---\n\n`;
        report += `*This report was generated by Nexxo Migration Tool v2.0*\n`;

        return report;
    }
}

// CLI helper
export async function generateMigration(
    plan: MigrationPlan,
    targetDir: string,
    options?: GeneratorOptions
): Promise<{ success: boolean; report: string; files: string[] }> {
    const generator = new MigrationGenerator(plan, targetDir, options);
    return await generator.generate();
}
