/**
 * Migration CLI Command (Day 44)
 * 
 * CLI interface for nexxo migrate command
 */

import { MigrationAnalyzer } from './analyzer.js';
import { MigrationGenerator } from './generator.js';
import path from 'path';

export interface MigrateCommandOptions {
    dryRun?: boolean;
    backup?: boolean;
}

export async function migrateCommand(projectPath: string, options: MigrateCommandOptions = {}): Promise<void> {
    const resolvedPath = path.resolve(projectPath || process.cwd());

    console.log('🔍 Analyzing project...');
    console.log(`   Path: ${resolvedPath}\n`);

    // Step 1: Analyze
    const analyzer = new MigrationAnalyzer(resolvedPath);
    const plan = await analyzer.analyze();

    console.log('📊 Analysis Results:');
    console.log(`   Toolchain: ${plan.toolchainType}`);
    console.log(`   Frameworks: ${plan.frameworks.join(', ')}`);
    console.log(`   Risk Level: ${plan.riskLevel}`);
    console.log(`   Plugins: ${plan.plugins.length}`);
    console.log(`   Loaders: ${plan.loaders.length}\n`);

    if (plan.toolchainType === 'unknown') {
        console.error('❌ Unable to detect build toolchain.');
        console.error('   Supported: Vite, Webpack, Rollup, Angular CLI\n');
        process.exit(1);
    }

    // Step 2: Generate
    if (options.dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    } else {
        console.log('⚙️  Generating Nexxo configuration...\n');
    }

    const generator = new MigrationGenerator(plan, resolvedPath, {
        dryRun: options.dryRun,
        backup: options.backup ?? true
    });

    const result = await generator.generate();

    if (result.success) {
        console.log('✅ Migration configuration generated!\n');

        console.log('📝 Files created/modified:');
        for (const file of result.files) {
            console.log(`   ${options.dryRun ? '[DRY RUN]' : '✓'} ${file}`);
        }
        console.log('');

        if (!options.dryRun) {
            console.log('📋 Migration Report:');
            console.log('   See MIGRATION_REPORT.md for details\n');

            console.log('🎯 Next Steps:');
            console.log('   1. npm install');
            console.log('   2. npm run dev');
            console.log('   3. Review MIGRATION_REPORT.md for manual steps\n');
        } else {
            console.log('📋 Preview of Migration Report:\n');
            console.log(result.report);
        }
    } else {
        console.error('❌ Migration failed\n');
        process.exit(1);
    }
}
