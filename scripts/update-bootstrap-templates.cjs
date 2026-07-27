const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src/init/bootstrap.ts');
let content = fs.readFileSync(srcPath, 'utf8');

// Insert import if needed
if (!content.includes('framework-templates')) {
    content = content.replace(
        "import * as path from 'path';",
        "import * as path from 'path';\nimport * as templates from './framework-templates';"
    );
}

// We want to replace the whole block starting from 'const getPremiumCss = '
// until the end of the vanilla template generation.
const startMarker = 'const getPremiumCss = ';
const endMarker = "let entryScript = template.includes('solid')";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `
    const isTS = template.includes('ts');
    const jsxExt = isTS ? 'tsx' : 'jsx';
    const ext = isTS ? 'ts' : 'js';

    if (template.includes('react')) {
      await fs.writeFile(path.join(cwd, \`src/main.\${jsxExt}\`), templates.reactTemplateMain);
      await fs.writeFile(path.join(cwd, \`src/App.\${jsxExt}\`), templates.getReactTemplateApp('#61dafb'));
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#3b8cfd', hexRgbMap: '59, 140, 253', buttonColor: '#308cfd', shadowHex: 'rgba(48, 140, 253, 0.4)', frameworkLogoHex: '#61dafb'
      }));
    } else if (template.includes('preact')) {
      await fs.writeFile(path.join(cwd, \`src/main.\${jsxExt}\`), templates.preactTemplateMain);
      await fs.writeFile(path.join(cwd, \`src/App.\${jsxExt}\`), templates.getPreactTemplateApp('#673ab7'));
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#673ab7', hexRgbMap: '103, 58, 183', buttonColor: '#673ab7', shadowHex: 'rgba(103, 58, 183, 0.4)', frameworkLogoHex: '#673ab7'
      }));
    } else if (template.includes('vue')) {
      await fs.writeFile(path.join(cwd, 'src/main.ts'), templates.vueTemplateMain);
      await fs.writeFile(path.join(cwd, 'src/App.vue'), templates.getVueTemplateApp('#42b883'));
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#42b883', hexRgbMap: '66, 184, 131', buttonColor: '#42b883', shadowHex: 'rgba(66, 184, 131, 0.4)', frameworkLogoHex: '#42b883'
      }));
    } else if (template.includes('solid')) {
      await fs.writeFile(path.join(cwd, \`src/index.\${jsxExt}\`), templates.solidTemplateMain);
      await fs.writeFile(path.join(cwd, \`src/App.\${jsxExt}\`), templates.getSolidTemplateApp('#446b9e'));
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#446b9e', hexRgbMap: '68, 107, 158', buttonColor: '#446b9e', shadowHex: 'rgba(68, 107, 158, 0.4)', frameworkLogoHex: '#446b9e'
      }));
    } else if (template.includes('svelte')) {
      await fs.writeFile(path.join(cwd, 'src/main.ts'), templates.svelteTemplateMain);
      await fs.writeFile(path.join(cwd, 'src/App.svelte'), templates.getSvelteTemplateApp('#ff3e00'));
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#ff3e00', hexRgbMap: '255, 62, 0', buttonColor: '#ff3e00', shadowHex: 'rgba(255, 62, 0, 0.4)', frameworkLogoHex: '#ff3e00'
      }));
    } else if (template.includes('qwik')) {
      await fs.writeFile(path.join(cwd, \`src/root.\${jsxExt}\`), templates.qwikTemplateMainTSX);
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#18B6F6', hexRgbMap: '24, 182, 246', buttonColor: '#18B6F6', shadowHex: 'rgba(24, 182, 246, 0.4)', frameworkLogoHex: '#18B6F6'
      }));
    } else if (template.includes('lit')) {
      await fs.writeFile(path.join(cwd, \`src/main.\${ext}\`), templates.litTemplateMain);
    } else if (template.includes('alpine')) {
      await fs.writeFile(path.join(cwd, 'index.html'), templates.alpineTemplateHtml);
      await fs.writeFile(path.join(cwd, \`src/main.\${ext}\`), 'import Alpine from \\'alpinejs\\';\\nwindow.Alpine = Alpine;\\nAlpine.start();');
    } else if (template.includes('mithril')) {
      await fs.writeFile(path.join(cwd, \`src/main.\${ext}\`), templates.mithrilTemplateMain);
      await fs.writeFile(path.join(cwd, 'src/index.css'), templates.getPremiumCss({
        hexBase: '#3e3e3e', hexRgbMap: '62, 62, 62', buttonColor: '#3e3e3e', shadowHex: 'rgba(62, 62, 62, 0.4)', frameworkLogoHex: '#3e3e3e'
      }));
    } else {
      await fs.writeFile(path.join(cwd, 'index.html'), templates.vanillaTemplateHtml);
      await fs.writeFile(path.join(cwd, \`src/main.\${ext}\`), 'console.log("Hello from Lunx Vanilla!");');
    }

    if (!template.includes('alpine') && !template.includes('vanilla')) {
        let entryScript = template.includes('solid')
          ? \`/src/index.\${jsxExt}\`
          : template.includes('react') || template.includes('preact')
            ? \`/src/main.\${jsxExt}\`
            : \`/src/main.\${ext}\`;

        if (template.includes('qwik')) {
          entryScript = \`/src/root.\${jsxExt}\`;
        }

        await fs.writeFile(path.join(cwd, 'index.html'), \`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lunx App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="\${entryScript}"></script>
  </body>
</html>\`);
    }

    let adapter = 'vanilla';
    let entryFile = \`src/main.\${ext}\`;
`;

    content = content.substring(0, startIndex) + replacement + content.substring(content.indexOf("    if (template.includes('react')) { adapter = 'react';", endIndex));
    fs.writeFileSync(srcPath, content, 'utf8');
    console.log("Updated bootstrap.ts successfully.");
} else {
    console.log("Failed to find markers.", { startIndex, endIndex });
}
