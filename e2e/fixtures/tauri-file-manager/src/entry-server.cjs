const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = {
  emitBuildArtifacts: (root, outDir) => {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
    
    fs.writeFileSync(path.join(outDir, 'index.html'), '<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    
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
          '--external:@tauri-apps/api',
          '--outfile=' + clientOutFile
        ], { cwd: root });
    } else {
        fs.writeFileSync(clientOutFile, 'console.log("No entry");');
    }
  }
};
