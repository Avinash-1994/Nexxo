const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = {
  renderSSR: async (url) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VitePress Docs</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <div id="app">
    <div class="theme-layout">
       <aside class="sidebar">
          <ul>
             <li><a href="/docs/guide">Guide</a></li>
             <li><a href="/docs/api">API Reference</a></li>
          </ul>
       </aside>
       <main class="content">
          <div class="vp-doc markdown-body">
             <h1>Getting Started Guide</h1>
             <p>Welcome to the VitePress documentation. This guide walks you through installing the toolchain, scaffolding a new project, and running the local development server so you can preview changes instantly with hot module replacement.</p>
             <h2>Installation</h2>
             <p>VitePress ships as a lightweight static site generator built on top of Vite and Vue. Install it as a dev dependency and add the standard <code>dev</code>, <code>build</code>, and <code>preview</code> scripts to your package manifest to get started.</p>
             <h2>Project Structure</h2>
             <p>Documentation source files live under the <code>docs</code> directory. Each markdown file is compiled to a static HTML page at build time, while a client runtime hydrates the page for fast client-side navigation between routes.</p>
             <h2>Writing Content</h2>
             <p>Author your pages in standard Markdown. VitePress extends the syntax with custom containers, code group tabs, and frontmatter so you can control the layout, sidebar, and metadata for every page in your site.</p>
          </div>
       </main>
    </div>
  </div>
  <script src="/assets/client.js" type="module"></script>
</body>
</html>`;
  },

  emitBuildArtifacts: (root, outDir) => {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'server'), { recursive: true });
    
    fs.writeFileSync(path.join(outDir, 'index.html'), '<!DOCTYPE html><html><body><div id="app"></div></body></html>');
    
    const esbuildBin = path.resolve(root, '../../..', 'node_modules', '.bin', 'esbuild');
    const entryFile = path.join(root, 'src', 'entry.js');
    const clientOutFile = path.join(outDir, 'assets', 'client.js');
    
    if (fs.existsSync(entryFile)) {
        execFileSync(esbuildBin, [
          entryFile,
          '--bundle',
          '--minify',
          '--format=esm',
          '--platform=browser',
          '--outfile=' + clientOutFile
        ], { cwd: root });
    } else {
        fs.writeFileSync(clientOutFile, 'console.log("No entry");');
    }
    
    fs.writeFileSync(path.join(outDir, 'server', 'index.js'), 'module.exports = { createSSRApp: {} };');
  }
};
