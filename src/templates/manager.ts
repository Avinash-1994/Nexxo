/**
 * Template Manager (Day 46)
 * 
 * Manages production-ready starter templates for Nexxo.
 * Handles scaffolding, variable replacement, and initial setup.
 */

import fs from 'fs';
import path from 'path';

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    framework: 'react' | 'vue' | 'svelte' | 'solid' | 'angular' | 'vanilla';
    type: 'spa' | 'ssr' | 'edge' | 'monorepo' | 'fintech';
    files: Record<string, string>; // virtual file system for the template
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

import { reactSpaTemplate } from './starters/react-spa.js';
import { vueSpaTemplate } from './starters/vue-spa.js';
import { svelteSpaTemplate } from './starters/svelte-spa.js';
import { solidSpaTemplate } from './starters/solid-spa.js';
import { reactSsrTemplate } from './starters/react-ssr.js';
import { edgeTemplate } from './starters/edge.js';

export class TemplateManager {
    private templates: Map<string, TemplateConfig> = new Map();

    constructor() {
        this.register(reactSpaTemplate);
        this.register(vueSpaTemplate);
        this.register(svelteSpaTemplate);
        this.register(solidSpaTemplate);
        this.register(reactSsrTemplate);
        this.register(edgeTemplate);
    }

    register(template: TemplateConfig): void {
        this.templates.set(template.id, template);
    }

    get(id: string): TemplateConfig | undefined {
        return this.templates.get(id);
    }

    getAll(): TemplateConfig[] {
        return Array.from(this.templates.values());
    }

    /**
     * Scaffolds a template into a target directory
     */
    async scaffold(templateId: string, targetDir: string, projectName: string): Promise<void> {
        const template = this.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        console.log(`🚀 Scaffolding ${template.name} into ${targetDir}...`);

        // Create directory
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Generate files
        for (const [filePath, content] of Object.entries(template.files)) {
            const fullPath = path.join(targetDir, filePath);
            const dir = path.dirname(fullPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Replace variables
            const processedContent = content.replace(/{{PROJECT_NAME}}/g, projectName);
            fs.writeFileSync(fullPath, processedContent);
        }

        // Generate package.json
        const packageJson = {
            name: projectName,
            version: '0.0.1',
            private: true,
            type: 'module',
            scripts: {
                "dev": "nexxo dev",
                "build": "nexxo build",
                "preview": "nexxo preview",
                "test": "nexxo test",
                "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
                "check": "tsc --noEmit"
            },
            dependencies: template.dependencies,
            devDependencies: {
                ...template.devDependencies,
                "nexxo": "^2.0.0",
                "typescript": "^5.0.0",
                "@types/node": "^20.0.0"
            }
        };

        fs.writeFileSync(
            path.join(targetDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Generate tsconfig.json (Production Best Practices)
        const tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "useDefineForClassFields": true,
                "module": "ESNext",
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "skipLibCheck": true,
                "moduleResolution": "bundler",
                "allowImportingTsExtensions": true,
                "resolveJsonModule": true,
                "isolatedModules": true,
                "noEmit": true,
                "jsx": "react-jsx", // Dynamic based on framework in real impl
                "strict": true,
                "noUnusedLocals": true,
                "noUnusedParameters": true,
                "noFallthroughCasesInSwitch": true
            },
            "include": ["src"],
            "references": [{ "path": "./tsconfig.node.json" }]
        };

        if (template.framework === 'vue') {
            tsconfig.compilerOptions.jsx = 'preserve';
        } else if (template.framework === 'svelte') {
            // Svelte specific config
        }

        fs.writeFileSync(
            path.join(targetDir, 'tsconfig.json'),
            JSON.stringify(tsconfig, null, 2)
        );

        // Generate tsconfig.node.json
        const tsconfigNode = {
            "compilerOptions": {
                "composite": true,
                "skipLibCheck": true,
                "module": "ESNext",
                "moduleResolution": "bundler",
                "allowSyntheticDefaultImports": true
            },
            "include": ["nexxo.config.ts"]
        };

        fs.writeFileSync(
            path.join(targetDir, 'tsconfig.node.json'),
            JSON.stringify(tsconfigNode, null, 2)
        );

        // Create README.md
        const readme = `# ${projectName}

Created with Nexxo - The High-Performance Build System.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`dev\`: Start development server (HMR enabled)
- \`build\`: Build for production
- \`preview\`: Preview production build
- \`test\`: Run tests
`;
        fs.writeFileSync(path.join(targetDir, 'README.md'), readme);

        // Create .gitignore
        const gitignore = `node_modules
dist
.nexxo
.env
.DS_Store
coverage
`;
        fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignore);

        console.log(`✅ ${template.name} created successfully! by Nexxo`);
    }
}

export const templateManager = new TemplateManager();
