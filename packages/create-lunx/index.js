#!/usr/bin/env node
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const req = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We just forward to the lunx package's create-lunx script
try {
  import('lunx/dist/create-lunx.js');
} catch (e) {
  console.error("Failed to load lunx's create tool. Is lunx installed?");
  process.exit(1);
}
