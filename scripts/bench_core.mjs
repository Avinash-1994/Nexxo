import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load the native module
const nativePath = path.join(__dirname, '../urja_native.node');
console.log(`Loading native module from: ${nativePath}`);
const { NativeWorker } = require(nativePath);

const worker = new NativeWorker(4); // 4 threads

// Create dummy files for benchmarking
const TEST_DIR = path.join(__dirname, '../temp_bench');
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

const FILE_COUNT = 100;
const files = [];

console.log(`Generating ${FILE_COUNT} test files...`);
for (let i = 0; i < FILE_COUNT; i++) {
    const filePath = path.join(TEST_DIR, `file_${i}.js`);
    fs.writeFileSync(filePath, `console.log("Hello from file ${i}");\n// Random: ${Math.random()}`);
    files.push(filePath);
}

console.log('Starting benchmark...');
const start = performance.now();

// Process files in parallel
const results = worker.processBatch(files);

const end = performance.now();
console.log(`Processed ${files.length} files in ${(end - start).toFixed(2)}ms`);
console.log(`Average: ${((end - start) / files.length).toFixed(2)}ms per file`);

console.log('Cache Stats:', worker.getCacheStats());

// Test Caching: Run again
console.log('Running second pass (should be cached)...');
const start2 = performance.now();
const results2 = worker.processBatch(files);
const end2 = performance.now();
console.log(`Processed ${files.length} files in ${(end2 - start2).toFixed(2)}ms`);

// Cleanup
fs.rmSync(TEST_DIR, { recursive: true, force: true });
