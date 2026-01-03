import { Plugin } from './index.js';
import path from 'path';
import { createRequire } from 'module';

export class VuePlugin implements Plugin {
    name = 'vue-plugin';
    root: string;

    constructor(root: string) {
        this.root = root;
    }

    async transform(code: string, id: string): Promise<string | void> {
        if (!id.endsWith('.vue')) return;
        console.log(`[VuePlugin] Transforming ${id}`);

        try {
            const require = createRequire(path.join(this.root, 'package.json'));
            // Load vue/compiler-sfc from the project's dependencies
            const compiler = require('@vue/compiler-sfc');

            // 1. Parse
            const { descriptor } = compiler.parse(code, { filename: id });
            const shortId = path.basename(id); // distinct-ish
            const scopeId = `data-v-${Math.random().toString(36).substring(2, 9)}`;

            let scriptContent = 'const script = {}; export default script;';

            // 2. Script
            if (descriptor.script || descriptor.scriptSetup) {
                const compiledScript = compiler.compileScript(descriptor, { id: scopeId });
                scriptContent = compiledScript.content;
            }

            // Robustly find and replace the default export with a variable declaration
            // so we can attach the render function later.
            const exportDefaultRegex = /export\s+default\s+/;
            if (exportDefaultRegex.test(scriptContent)) {
                scriptContent = scriptContent.replace(exportDefaultRegex, 'const _sfc_main = ');
            } else {
                // Fallback if no export default is found (though rare in Vue SFC)
                scriptContent += '\nconst _sfc_main = {};';
            }


            // 3. Template
            let templateCode = '';
            if (descriptor.template) {
                const templateResult = compiler.compileTemplate({
                    source: descriptor.template.content,
                    filename: id,
                    id: scopeId,
                    scoped: descriptor.styles.some((s: any) => s.scoped),
                    slotted: false,
                    compilerOptions: {
                        scopeId: descriptor.styles.some((s: any) => s.scoped) ? scopeId : undefined
                    }
                });
                templateCode = templateResult.code.replace('export function render', 'const _sfc_render = function render');
            }

            // 4. Styles
            let cssCode = '';
            for (const style of descriptor.styles) {
                const styleResult = compiler.compileStyle({
                    source: style.content,
                    filename: id,
                    id: scopeId,
                    scoped: style.scoped
                });
                cssCode += styleResult.code;
            }

            // 5. Assemble
            const output = `
                ${scriptContent}
                ${templateCode}

                // Inject CSS
                ${cssCode ? `
                const style = document.createElement('style');
                style.innerHTML = ${JSON.stringify(cssCode)};
                document.head.appendChild(style);
                ` : ''}

                ${descriptor.styles.some((s: any) => s.scoped) ? `_sfc_main.__scopeId = "${scopeId}";` : ''}
                _sfc_main.render = _sfc_render;
                export default _sfc_main;
            `;

            return output;

        } catch (e: any) {
            console.error('[VuePlugin] SFC Compilation Error:', e);
            // Log warning but don't crash
            return;
        }
    }
}
