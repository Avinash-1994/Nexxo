import path from 'path';
import fs from 'fs/promises';

const root = '/home/avinash/Desktop/framework_practis/build/examples/bootstrap-test';
const url = '/node_modules/bootstrap/dist/css/bootstrap.min.css?import';

const cleanUrl = url.split('?')[0];
const filePath = path.join(root, cleanUrl);

console.log('Root:', root);
console.log('CleanUrl:', cleanUrl);
console.log('FilePath:', filePath);

fs.access(filePath)
    .then(() => console.log('File exists!'))
    .catch((e) => console.error('File does NOT exist:', e));
