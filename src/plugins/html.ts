
import fs from 'fs/promises';
import path from 'path';
import { LunxPlugin } from '../core/plugins/types.js';

export function createHtmlPlugin(rootDir: string, outDir: string): LunxPlugin {
    return {
        manifest: {
            name: 'lunx:html',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['buildEnd'],
            permissions: { fs: 'read' }
        },
        id: 'lunx:html',
        async runHook(hook, data) {
            if (hook !== 'buildEnd') return data;

            const { artifacts } = data;
            const jsArtifacts = artifacts.filter((a: any) => a.type === 'js' && !a.fileName.includes('remoteEntry'));
            const cssArtifacts = artifacts.filter((a: any) => a.type === 'css');

            const scripts = jsArtifacts.map((a: any) => `<script type="module" src="/${a.fileName}"></script>`).join('\n    ');
            const links = cssArtifacts.map((a: any) => `<link rel="stylesheet" href="/${a.fileName}">`).join('\n    ');

            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lunx Build</title>
    ${links}
</head>
<body>
    <div id="root"></div>
    <div id="app"></div>
    ${scripts}
</body>
</html>`;

            return {
                ...data,
                artifacts: [
                    ...artifacts,
                    {
                        id: 'index-html',
                        type: 'asset',
                        fileName: 'index.html',
                        source: htmlContent,
                        dependencies: []
                    }
                ]
            };
        }
    };
}
