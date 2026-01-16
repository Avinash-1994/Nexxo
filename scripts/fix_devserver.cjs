
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/dev/devServer.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Fix preBundler error
content = content.replace('const preBundlerIgnored =', 'const preBundler =');

// 2. Extract port/host/https logic to move to top
// We need to find the logic in the 'heavy init' section (now inside setImmediate)
// and move it to the hoisted variables section.

const portLogic = `
  let port = cfg.server?.port || cfg.port || 5173;
  const host = cfg.server?.host || 'localhost';

  // Dynamic port detection
  if (!cfg.server?.strictPort) {
    port = await findAvailablePort(port, host);
  }
`;

const httpsLogicStart = `  // 3. Setup HTTPS`;
const httpsLogicEnd = `  // 4. Initialize Premium Features`;

// Locate these in the content
const heavyInitStart = content.indexOf('setImmediate(async () => {');
const heavyInitContent = content.substring(heavyInitStart);

// We need to extract the HTTPS logic block from heavyInitContent
// It looks like:
//   // 3. Setup HTTPS
//   let httpsOptions: any = null;
//   if (cfg.server?.https) { ... }
//   ...
//   }

// We will recreate the top section with these logics added.
// Find insertion point: after "let hmrThrottle ... };" and before "// END OPTIMIZATION"

const insertionPoint = content.indexOf('// END OPTIMIZATION');
const insertBefore = content.substring(0, insertionPoint);
const insertAfter = content.substring(insertionPoint);

const newTopLogic = `
  ${portLogic}

  // Setup HTTPS (Hoisted)
  let httpsOptions: any = null;
  if (cfg.server?.https) {
    if (typeof cfg.server.https === 'object') {
      httpsOptions = cfg.server.https;
    } else {
      // Generate self-signed cert
      const certDir = path.join(cfg.root, '.nexxo', 'certs');
      await fs.mkdir(certDir, { recursive: true });
      const keyPath = path.join(certDir, 'dev.key');
      const certPath = path.join(certDir, 'dev.crt');

      if (await fs.access(keyPath).then(() => true).catch(() => false)) {
        httpsOptions = {
          key: await fs.readFile(keyPath),
          cert: await fs.readFile(certPath)
        };
      } else {
        log.info('Generating self-signed certificate...', { category: 'server' });
        const selfsigned = await import('selfsigned');
        // @ts-ignore
        const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 30 });
        await fs.writeFile(keyPath, pems.private);
        await fs.writeFile(certPath, pems.cert);
        httpsOptions = {
          key: pems.private,
          cert: pems.cert
        };
      }
    }
  }
`;

// Combine top
let newContent = insertBefore + newTopLogic + insertAfter;

// 3. Remove the logic from the bottom (setImmediate block)
// We need to remove the original port/host/https definitions to avoid duplication/errors
// But wait, the original logic for httpsOptions used 'let httpsOptions'. 
// If we move it to top (local scope of startDevServer), the bottom block (setImmediate) sees it?
// Yes, closure.
// But if the bottom block ALSO defines 'let httpsOptions', it shadows it.
// We want the bottom block to NOT define it, or assign to it?
// The bottom block logic IS the original logic.
// We should remove the lines from the bottom block.

// Remove port logic
newContent = newContent.replace('let port = cfg.server?.port || cfg.port || 5173;', '// port hoisted');
newContent = newContent.replace("const host = cfg.server?.host || 'localhost';", '// host hoisted');
// The if block for detection:
// if (!cfg.server?.strictPort) { port = await findAvailablePort(port, host); }
// We can comment this out too.
newContent = newContent.replace(
    'if (!cfg.server?.strictPort) {\n    port = await findAvailablePort(port, host);\n  }',
    '// port detection hoisted'
);

// Remove HTTPS logic
// We can replace the whole HTTPS block with a comment
const httpsBlockRegex = /\/\/ 3\. Setup HTTPS[\s\S]*?\/\/ 4\. Initialize Premium Features/;
newContent = newContent.replace(httpsBlockRegex, '// 3. Setup HTTPS (Hoisted)\n  // 4. Initialize Premium Features');

// 4. Fix Implicit Any errors
// src/dev/devServer.ts(1135,26): error TS7006: Parameter 'err' implicitly has an 'any' type.
// Find "proxy.on('error', (err, req, res) => {"
newContent = newContent.replace("proxy.on('error', (err, req, res) => {", "proxy.on('error', (err: any, req: any, res: any) => {");

fs.writeFileSync(filePath, newContent);
console.log('Fixed devServer.ts');
