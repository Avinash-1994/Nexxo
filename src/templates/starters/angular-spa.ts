/**
 * Angular SPA Starter Template
 * Modern Angular (Standalone) setup with TypeScript
 */

import { TemplateConfig } from '../manager.js';

export const angularSpaTemplate: TemplateConfig = {
    id: 'angular-spa',
    name: 'Angular SPA (Modern)',
    description: 'Modern Angular 17+ Application with Standalone Components',
    framework: 'angular',
    type: 'spa',
    dependencies: {
        "@angular/animations": "^17.0.0",
        "@angular/common": "^17.0.0",
        "@angular/compiler": "^17.0.0",
        "@angular/core": "^17.0.0",
        "@angular/forms": "^17.0.0",
        "@angular/platform-browser": "^17.0.0",
        "@angular/router": "^17.0.0",
        "rxjs": "~7.8.0",
        "tslib": "^2.3.0",
        "zone.js": "~0.14.0"
    },
    devDependencies: {
        "@angular/cli": "^17.0.0",
        "@angular/compiler-cli": "^17.0.0",
        "typescript": "~5.2.0",
        "@nexxo/plugin-angular": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import angular from '@nexxo/plugin-angular';

export default defineConfig({
    plugins: [angular()],
    server: {
        port: 4200
    }
});
`,
        'src/main.ts': `
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
`,
        'src/app/app.config.ts': `
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
`,
        'src/app/app.routes.ts': `
import { Routes } from '@angular/router';

export const routes: Routes = [];
`,
        'src/app/app.component.ts': `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'nexxo-angular';
}
`,
        'src/app/app.component.html': `
<main class="main">
  <div class="content">
    <h1>Nexxo + Angular 17</h1>
    <p>Build with speed.</p>
  </div>
</main>
<router-outlet></router-outlet>
`,
        'src/app/app.component.css': `
.main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Inter', sans-serif;
}
h1 {
  color: #c3002f;
}
`,
        'src/index.html': `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{PROJECT_NAME}}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`,
        'tsconfig.json': `
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`
    }
};
