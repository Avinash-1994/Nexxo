import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const fwPath = path.resolve(__dirname, '../src/init/framework-templates.ts');
  let content = await fs.readFile(fwPath, 'utf8');

  // We want to create src/utils/templates.ts which contains ALL the constants from framework-templates.ts
  // AND the TEMPLATES record pointing to those constants.
  
  // Since we also want to preserve the COMMON_FILES and the Type definitions, 
  // Let's copy framework-templates.ts entirely into src/utils/templates.ts,
  // and append the TEMPLATES object at the end of it!
  
  const templatesObjectStr = `
export interface TemplateFile {
    path: string;
    content: string;
}

export interface TemplateDef {
    id: string;
    name: string;
    description: string;
    files: TemplateFile[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

const COMMON_FILES: TemplateFile[] = [
    {
        path: 'lunx.config.json',
        content: \`{\n  "mode": "development"\n}\`
    },
    {
        path: 'tsconfig.json',
        content: \`{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "preserve"
    }
}\`
    }
];

export const TEMPLATES: Record<string, TemplateDef> = {
    'react-ts': {
        id: 'react-ts',
        name: 'React TypeScript',
        description: 'React 19 + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: reactTemplateHtml },
            { path: 'src/main.tsx', content: reactTemplateMain },
            { path: 'src/App.tsx', content: getReactTemplateApp('#61dafb') },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3b8cfd', hexRgbMap: '59, 140, 253', buttonColor: '#3b8cfd', shadowHex: 'rgba(59, 140, 253, 0.4)', frameworkLogoHex: '#61dafb' }) }
        ],
        dependencies: { "react": "^19.2.3", "react-dom": "^19.2.3" },
        devDependencies: { "@types/react": "^19.2.3", "@types/react-dom": "^19.2.3", "typescript": "^5.0.0" }
    },
    'vue-ts': {
        id: 'vue-ts',
        name: 'Vue TypeScript',
        description: 'Vue 3 + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: vueTemplateHtml },
            { path: 'src/main.ts', content: vueTemplateMain },
            { path: 'src/App.vue', content: getVueTemplateApp('#42b883') },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#42b883', hexRgbMap: '66, 184, 131', buttonColor: '#42b883', shadowHex: 'rgba(66, 184, 131, 0.4)', frameworkLogoHex: '#42b883' }) }
        ],
        dependencies: { "vue": "^3.3.0" },
        devDependencies: { "typescript": "^5.0.0" }
    },
    'svelte-ts': {
        id: 'svelte-ts',
        name: 'Svelte TypeScript',
        description: 'Svelte 4 + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: svelteTemplateHtml },
            { path: 'src/main.ts', content: svelteTemplateMain },
            { path: 'src/App.svelte', content: getSvelteTemplateApp('#ff3e00') },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#ff3e00', hexRgbMap: '255, 62, 0', buttonColor: '#ff3e00', shadowHex: 'rgba(255, 62, 0, 0.4)', frameworkLogoHex: '#ff3e00' }) }
        ],
        dependencies: { "svelte": "^4.2.0" },
        devDependencies: { "typescript": "^5.0.0" }
    },
    'solid-ts': {
        id: 'solid-ts',
        name: 'Solid TypeScript',
        description: 'SolidJS + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: solidTemplateHtml },
            { path: 'src/index.tsx', content: solidTemplateMain },
            { path: 'src/App.tsx', content: getSolidTemplateApp('#446b9e') },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#446b9e', hexRgbMap: '68, 107, 158', buttonColor: '#446b9e', shadowHex: 'rgba(68, 107, 158, 0.4)', frameworkLogoHex: '#446b9e' }) }
        ],
        dependencies: { "solid-js": "^1.8.17" },
        devDependencies: { "babel-preset-solid": "^1.8.17", "@babel/core": "^7.24.0", "typescript": "^5.0.0" }
    },
    'preact-ts': {
        id: 'preact-ts',
        name: 'Preact TypeScript',
        description: 'Preact + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: preactTemplateHtml },
            { path: 'src/main.tsx', content: preactTemplateMain },
            { path: 'src/App.tsx', content: getPreactTemplateApp('#673ab7') },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#673ab7', hexRgbMap: '103, 58, 183', buttonColor: '#673ab7', shadowHex: 'rgba(103, 58, 183, 0.4)', frameworkLogoHex: '#673ab7' }) }
        ],
        dependencies: { "preact": "^10.19.0" },
        devDependencies: { "typescript": "^5.0.0" }
    },
    'qwik-ts': {
        id: 'qwik-ts',
        name: 'Qwik TypeScript',
        description: 'Qwik + TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: qwikTemplateHtml },
            { path: 'src/root.tsx', content: qwikTemplateMainTSX },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#18B6F6', hexRgbMap: '24, 182, 246', buttonColor: '#18B6F6', shadowHex: 'rgba(24, 182, 246, 0.4)', frameworkLogoHex: '#18B6F6' }) }
        ],
        dependencies: { "@builder.io/qwik": "^1.4.3" },
        devDependencies: { "typescript": "^5.0.0" }
    },
    'lit-ts': {
        id: 'lit-ts',
        name: 'Lit TypeScript',
        description: 'Lit Web Components + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: litTemplateHtml },
            { path: 'src/main.ts', content: litTemplateMain },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3b8cfd', hexRgbMap: '59, 140, 253', buttonColor: '#308cfd', shadowHex: 'rgba(48, 140, 253, 0.4)', frameworkLogoHex: '#3b8cfd' }) }
        ],
        dependencies: { "lit": "^3.1.2" },
        devDependencies: { "typescript": "^5.0.0" }
    },
    'alpine': {
        id: 'alpine',
        name: 'Alpine.js',
        description: 'Alpine.js + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: alpineTemplateHtml },
            { path: 'src/main.js', content: "import Alpine from 'alpinejs';\\nwindow.Alpine = Alpine;\\nAlpine.start();" },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#77C1D2', hexRgbMap: '119, 193, 210', buttonColor: '#77C1D2', shadowHex: 'rgba(119, 193, 210, 0.4)', frameworkLogoHex: '#77C1D2' }) }
        ],
        dependencies: { "alpinejs": "^3.13.3" },
        devDependencies: {}
    },
    'mithril': {
        id: 'mithril',
        name: 'Mithril.js',
        description: 'Mithril.js + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: mithrilTemplateHtml },
            { path: 'src/main.js', content: mithrilTemplateMain },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3e3e3e', hexRgbMap: '62, 62, 62', buttonColor: '#3e3e3e', shadowHex: 'rgba(62, 62, 62, 0.4)', frameworkLogoHex: '#3e3e3e' }) }
        ],
        dependencies: { "mithril": "^2.2.2" },
        devDependencies: {}
    },
    'vanilla': {
        id: 'vanilla',
        name: 'Vanilla JS',
        description: 'Vanilla TypeScript + Stunning UI',
        files: [
            ...COMMON_FILES,
            { path: 'index.html', content: vanillaTemplateHtml },
            { path: 'src/main.js', content: 'console.log("Hello from Lunx Vanilla!");' },
            { path: 'src/index.css', content: getPremiumCss({ hexBase: '#f59f00', hexRgbMap: '245, 159, 0', buttonColor: '#f59f00', shadowHex: 'rgba(245, 159, 0, 0.4)', frameworkLogoHex: '#f59f00' }) }
        ],
        dependencies: {},
        devDependencies: {}
    }
};
`;

  const newContent = content + '\n' + templatesObjectStr;
  
  await fs.mkdir(path.resolve(__dirname, '../src/utils'), {recursive: true});
  await fs.writeFile(path.resolve(__dirname, '../src/utils/templates.ts'), newContent);
  console.log('Merged templates successfully into src/utils/templates.ts');
}

run().catch(console.error);
