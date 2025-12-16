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
                const scriptBlock = descriptor.script || descriptor.scriptSetup;
                // If scriptSetup, we need to compile it
                if (descriptor.scriptSetup) {
                    const compiledScript = compiler.compileScript(descriptor, { id: scopeId });
                    scriptContent = compiledScript.content;
                } else {
                    // For normal script, simpler handling (naive regex replacing export default)
                    // But compileScript handles both usually if we pass descriptor
                    const compiledScript = compiler.compileScript(descriptor, { id: scopeId });
                    scriptContent = compiledScript.content;
                }
            }

            // Rewrite "export default" to "const script =" so we can attach render
            // But compileScript usually outputs "export default"
            // We need to capture the default export.
            // A simple hack: replace "export default" with "const script ="
            // But this is risky if "export default" is inside a string or comment.
            // Better: Import it.
            // Since we are generating ONE module, we have to massage the code.

            // Actually, correct way:
            // scriptContent usually has imports.
            // We can leave scriptContent as is, but we need to add named exports?
            // If scriptContent has `export default`, we need to append `import { render } ...` and `export default { ...script, render }`.

            // Let's try to rewrite `export default` to `const _sfc_main =`
            // This is fragile but works for simple cases.
            scriptContent = scriptContent.replace('export default', 'const _sfc_main =');


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
            console.error('Vue SFC Compilation Error:', e);
            // Log warning but don't crash
            return;
        }
    }
}
