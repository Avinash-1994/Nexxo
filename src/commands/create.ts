import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// NEW-01: lunx create — interactive project scaffolding

function generateConfig(framework: string, preset: string, ts: boolean): string {
  return `import { defineConfig } from 'lunx';\n\nexport default defineConfig({\n  framework: '${framework}',\n  preset: '${preset}',\n  entry: ['src/main.${ts ? 'tsx' : 'jsx'}'],\n  outDir: 'dist',\n});\n`;
}

function generateIndexHtml(name: string, ts: boolean): string {
  const ext = ts ? 'tsx' : 'jsx';
  return `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.${ext}"></script>\n  </body>\n</html>\n`;
}

function generateMainEntry(framework: string, ts: boolean): string {
  const ext = ts ? 'tsx' : 'jsx';
  if (framework === 'react' || framework === 'vanilla') {
    return `import React from 'react';\nimport ReactDOM from 'react-dom/client';\n\nconst App = () => <h1>Welcome to Lunx + ${framework}!</h1>;\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);\n`;
  }
  if (framework === 'vue') {
    return `import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#root');\n`;
  }
  if (framework === 'svelte' || framework === 'sveltekit') {
    return `import App from './App.svelte';\nconst app = new App({ target: document.getElementById('root')! });\nexport default app;\n`;
  }
  return `// ${framework} entry point\nconsole.log('Lunx + ${framework} ready!');\n`;
}

function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      jsx: 'react-jsx',
      allowImportingTsExtensions: true,
      noEmit: true,
    },
    include: ['src'],
  }, null, 2) + '\n';
}

function buildDeps(framework: string): Record<string, string> {
  const base: Record<string, string> = {};
  if (framework === 'react') { base['react'] = 'latest'; base['react-dom'] = 'latest'; }
  if (framework === 'vue')   { base['vue'] = 'latest'; }
  if (framework === 'svelte') { base['svelte'] = 'latest'; }
  if (framework === 'sveltekit') { base['svelte'] = 'latest'; base['@sveltejs/kit'] = 'latest'; }
  if (framework === 'solid')  { base['solid-js'] = 'latest'; }
  return base;
}

function buildDevDeps(ts: boolean, tailwind: boolean): Record<string, string> {
  const base: Record<string, string> = { lunx: 'latest' };
  if (ts) { base['typescript'] = 'latest'; }
  if (tailwind) { base['tailwindcss'] = 'latest'; base['autoprefixer'] = 'latest'; }
  return base;
}

const FRAMEWORKS = [
  { label: 'React',          value: 'react',          preset: 'spa' },
  { label: 'Vue',            value: 'vue',            preset: 'spa' },
  { label: 'Svelte',         value: 'svelte',         preset: 'spa' },
  { label: 'SvelteKit',      value: 'sveltekit',      preset: 'ssr' },
  { label: 'Nuxt',           value: 'nuxt',           preset: 'ssr' },
  { label: 'Remix',          value: 'remix',          preset: 'ssr' },
  { label: 'Astro',          value: 'astro',          preset: 'ssr' },
  { label: 'SolidJS',        value: 'solid',          preset: 'spa' },
  { label: 'Angular',        value: 'angular',        preset: 'spa' },
  { label: 'Qwik City',      value: 'qwik',           preset: 'ssr' },
  { label: 'TanStack Start', value: 'tanstack-start', preset: 'ssr' },
  { label: 'Waku (RSC)',     value: 'waku',           preset: 'ssr' },
  { label: 'Electron',       value: 'electron',       preset: 'spa' },
  { label: 'Tauri',          value: 'tauri',          preset: 'spa' },
  { label: 'Vanilla JS',     value: 'vanilla',        preset: 'spa' },
];

async function promptText(question: string): Promise<string> {
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function promptSelect(question: string, choices: { label: string; value: string }[]): Promise<{ label: string; value: string }> {
  console.log(`\n  ${question}`);
  choices.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2)}. ${c.label}`));
  const ans = await promptText(`\n  Enter number [1-${choices.length}]: `);
  const idx = parseInt(ans) - 1;
  return choices[Math.max(0, Math.min(idx, choices.length - 1))];
}

async function promptConfirm(question: string, def = true): Promise<boolean> {
  const hint = def ? 'Y/n' : 'y/N';
  const ans = await promptText(`  ${question} (${hint}): `);
  if (!ans) return def;
  return ans.toLowerCase() === 'y';
}

export async function runCreate(
  projectName: string | undefined,
  opts?: { framework?: string; ts?: boolean; tailwind?: boolean }
) {
  const name = projectName ?? await promptText('  Project name: ');
  
  let fw = FRAMEWORKS.find(f => f.value === opts?.framework);
  if (!fw) {
    fw = await promptSelect('Select framework:', FRAMEWORKS) as any;
  }

  const useTs       = opts?.ts       !== undefined ? opts.ts       : await promptConfirm('TypeScript?', true);
  const useTailwind = opts?.tailwind !== undefined ? opts.tailwind : await promptConfirm('Tailwind CSS?', false);

  const targetDir = path.resolve(process.cwd(), name);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });

  // package.json
  const pkg = {
    name, version: '0.0.0', private: true, type: 'module',
    scripts: { dev: 'lunx dev', build: 'lunx build', preview: 'lunx preview' },
    dependencies: buildDeps(fw!.value),
    devDependencies: buildDevDeps(useTs, useTailwind),
  };
  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // lunx.config.ts
  fs.writeFileSync(path.join(targetDir, 'lunx.config.ts'), generateConfig(fw!.value, fw!.preset, useTs));

  // index.html
  fs.writeFileSync(path.join(targetDir, 'index.html'), generateIndexHtml(name, useTs));

  // src/main entry
  const mainExt = useTs ? 'tsx' : 'jsx';
  fs.writeFileSync(path.join(targetDir, 'src', `main.${mainExt}`), generateMainEntry(fw!.value, useTs));

  // tsconfig.json
  if (useTs) {
    fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), generateTsConfig());
  }

  // tailwind.config
  if (useTailwind) {
    fs.writeFileSync(path.join(targetDir, 'tailwind.config.ts'),
      `export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] };\n`);
  }

  const files = fs.readdirSync(targetDir);
  console.log(`\n  ✓ Created ${name}/`);
  console.log(`  Files created: ${files.join(', ')}`);
  console.log(`\n  Next steps:`);
  console.log(`    cd ${name}`);
  console.log(`    npm install`);
  console.log(`    lunx dev\n`);
}
