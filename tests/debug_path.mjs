import fs from 'fs/promises';
import path from 'path';

async function test() {
    const root = process.cwd();
    const tempFile = path.join(root, 'src', 'temp_parallel.ts');

    console.log('Root:', root);
    console.log('Temp file path:', tempFile);
    console.log('File exists:', await fs.access(tempFile).then(() => true).catch(() => false));

    // Test URL path resolution
    const url = '/src/temp_parallel.ts';
    const cleanUrl = url.split('?')[0];
    const filePath = path.join(root, cleanUrl);
    console.log('URL:', url);
    console.log('File path from URL:', filePath);
    console.log('Paths match:', filePath === tempFile);
}

test();
