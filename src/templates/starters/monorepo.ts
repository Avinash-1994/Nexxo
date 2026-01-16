/**
 * Monorepo Starter Template
 * PNPM Workspace with Turborepo-like structure
 */

import { TemplateConfig } from '../manager.js';

export const monorepoTemplate: TemplateConfig = {
    id: 'monorepo',
    name: 'Monorepo (PNPM via Nexxo)',
    description: 'High-performance monorepo with apps and shared packages',
    framework: 'react',
    type: 'monorepo',
    dependencies: {},
    devDependencies: {
        "typescript": "^5.0.0",
        "@nexxo/plugin-workspace": "^1.0.0"
    },
    files: {
        'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'packages/*'
`,
        'package.json': `
{
  "name": "{{PROJECT_NAME}}",
  "private": true,
  "scripts": {
    "build": "nexxo build --filter=...",
    "dev": "nexxo dev --parallel",
    "test": "nexxo test",
    "lint": "nexxo lint"
  },
  "devDependencies": {
    "nexxo": "latest",
    "typescript": "^5.0.0"
  }
}
`,
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';

export default defineConfig({
    workspace: {
        packages: ['apps/*', 'packages/*']
    }
});
`,
        // Shared UI Package
        'packages/ui/package.json': `
{
  "name": "@{{PROJECT_NAME}}/ui",
  "version": "0.0.0",
  "main": "./src/index.tsx",
  "types": "./src/index.tsx",
  "dependencies": {
    "react": "^18.0.0"
  }
}
`,
        'packages/ui/src/index.tsx': `
import * as React from "react";

export const Button = ({ children }: { children: React.ReactNode }) => {
  return <button style={{ 
    padding: '10px 20px', 
    background: '#333', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '4px' 
  }}>{children}</button>;
};
`,
        'packages/ui/tsconfig.json': `
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "esnext",
    "moduleResolution": "bundler"
  }
}
`,
        // Web App
        'apps/web/package.json': `
{
  "name": "web",
  "version": "0.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@{{PROJECT_NAME}}/ui": "workspace:*"
  },
  "devDependencies": {
    "@nexxo/plugin-react": "^1.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
`,
        'apps/web/nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import react from '@nexxo/plugin-react';

export default defineConfig({
    plugins: [react()]
});
`,
        'apps/web/src/main.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@{{PROJECT_NAME}}/ui';

export default function App() {
  return (
    <div>
      <h1>Nexxo Monorepo</h1>
      <Button>Shared UI Button</Button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
`,
        'apps/web/index.html': `
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    }
};
