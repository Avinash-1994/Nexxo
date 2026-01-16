/**
 * Migration Analyzer Tests - Angular CLI Projects (Day 43)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { MigrationAnalyzer } from '../src/migrate/analyzer.js';
import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/migrate_angular');

describe('Migration Analyzer - Angular CLI', () => {
    beforeAll(async () => {
        // Create Angular CLI fixture
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(path.join(FIXTURE_DIR, 'src/app'), { recursive: true });

        // package.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: 'angular-app',
            dependencies: {
                '@angular/core': '^17.0.0',
                '@angular/common': '^17.0.0',
                '@angular/platform-browser': '^17.0.0',
                '@angular/router': '^17.0.0',
                'rxjs': '^7.8.0',
                'tslib': '^2.6.0',
                'zone.js': '^0.14.0'
            },
            devDependencies: {
                '@angular-devkit/build-angular': '^17.0.0',
                '@angular/cli': '^17.0.0',
                '@angular/compiler-cli': '^17.0.0',
                'typescript': '^5.2.0'
            }
        }, null, 2));

        // angular.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'angular.json'), JSON.stringify({
            "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
            "version": 1,
            "newProjectRoot": "projects",
            "projects": {
                "angular-app": {
                    "projectType": "application",
                    "root": "",
                    "sourceRoot": "src",
                    "architect": {
                        "build": {
                            "builder": "@angular-devkit/build-angular:browser",
                            "options": {
                                "outputPath": "dist/angular-app",
                                "index": "src/index.html",
                                "main": "src/main.ts",
                                "polyfills": ["zone.js"],
                                "tsConfig": "tsconfig.app.json",
                                "assets": ["src/favicon.ico", "src/assets"],
                                "styles": ["src/styles.css"],
                                "scripts": []
                            }
                        },
                        "serve": {
                            "builder": "@angular-devkit/build-angular:dev-server",
                            "options": {
                                "port": 4200
                            }
                        }
                    }
                }
            }
        }, null, 2));

        // tsconfig.app.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'tsconfig.app.json'), JSON.stringify({
            "extends": "./tsconfig.json",
            "compilerOptions": {
                "outDir": "./out-tsc/app",
                "types": []
            },
            "files": ["src/main.ts"],
            "include": ["src/**/*.d.ts"]
        }, null, 2));

        // src/main.ts
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.ts'), `
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
        `);

        // src/app/app.module.ts
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/app/app.module.ts'), `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
        `);

        // src/app/app.component.ts
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/app/app.component.ts'), `
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello Angular</h1>'
})
export class AppComponent { }
        `);

        // src/index.html
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Angular App</title>
    <base href="/">
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
        `);

        // src/styles.css
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/styles.css'), `
body { margin: 0; font-family: Arial, sans-serif; }
        `);
    });

    afterAll(async () => {
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
    });

    it('should detect Angular CLI toolchain', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.toolchainType).toBe('angular-cli');
    });

    it('should detect Angular framework', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.frameworks).toContain('angular');
    });

    it('should have LOW risk level for standard Angular project', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        // Standard Angular CLI project has minimal custom plugins
        expect(plan.riskLevel).toBe('LOW');
    });

    it('should identify Angular-specific manual steps', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.manualSteps.length).toBeGreaterThan(0);
        expect(plan.manualSteps.some(step => step.includes('package.json scripts'))).toBe(true);
    });

    it('should detect main entry point', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.projectStructure.entryPoints).toContain('src/main.ts');
    });

    it('should not detect monorepo for single Angular app', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.projectStructure.isMonorepo).toBe(false);
    });

    it('should auto-migrate framework detection', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.autoMigrate.some(item => item.includes('Framework detection'))).toBe(true);
        expect(plan.autoMigrate.some(item => item.includes('angular'))).toBe(true);
    });
});
