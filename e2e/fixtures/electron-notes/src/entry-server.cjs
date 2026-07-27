const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = {
  emitBuildArtifacts: (root, outDir) => {
    const esbuildBin = path.resolve(root, '../../..', 'node_modules', '.bin', 'esbuild');

    // Main bundle: Node.js target
    const mainOut = path.join(outDir, 'main');
    fs.mkdirSync(mainOut, { recursive: true });
    const mainEntry = path.join(root, 'src', 'main.js');
    const mainBundle = path.join(mainOut, 'index.js');
    execFileSync(esbuildBin, [
      mainEntry,
      '--bundle',
      '--minify',
      '--format=cjs',
      '--platform=node',
      '--external:electron',
      '--external:fs',
      '--external:path',
      '--external:crypto',
      `--outfile=${mainBundle}`
    ], { cwd: root });

    // Renderer bundle: Browser target
    const rendererOut = path.join(outDir, 'renderer');
    fs.mkdirSync(rendererOut, { recursive: true });
    const rendererEntry = path.join(root, 'src', 'renderer.js');
    const rendererBundle = path.join(rendererOut, 'index.js');
    execFileSync(esbuildBin, [
      rendererEntry,
      '--bundle',
      '--minify',
      '--format=esm',
      '--platform=browser',
      '--external:electron',
      `--outfile=${rendererBundle}`
    ], { cwd: root });

    // Copy index.html into renderer dir
    fs.copyFileSync(path.join(root, 'index.html'), path.join(rendererOut, 'index.html'));

    // Write preload (not bundled — kept as CJS for Electron context)
    const preloadSrc = path.join(root, 'src', 'preload.js');
    const preloadDst = path.join(mainOut, 'preload.js');
    if (fs.existsSync(preloadSrc)) {
      fs.copyFileSync(preloadSrc, preloadDst);
    }
  }
};
