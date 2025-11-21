import { DependencyGraph } from '../dist/resolve/graph.js';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

async function test() {
  const testDir = path.resolve('temp_resolver_test');
  await fs.mkdir(testDir, { recursive: true });

  const entryFile = path.join(testDir, 'entry.ts');
  const content = `
    import { foo } from './foo';
    // import { fake } from './fake';
    /* 
       import { fake2 } from './fake2'; 
    */
    import {
      baz
    } from './baz';
    
    export const x = 1;
  `;
  
  await fs.writeFile(entryFile, content);
  await fs.writeFile(path.join(testDir, 'foo.ts'), 'export const foo = 1;');
  await fs.writeFile(path.join(testDir, 'baz.ts'), 'export const baz = 2;');
  
  // These should NOT exist
  // fake.ts
  // fake2.ts

  const graph = new DependencyGraph();
  try {
    await graph.addEntry(entryFile);
    
    const node = graph.nodes.get(entryFile);
    console.log('Dependencies found:', node.deps);

    const deps = Array.from(node.deps).map(d => path.basename(d));
    
    // Check for false positives
    if (deps.some(d => d.includes('fake'))) {
      console.error('FAIL: Found commented out imports!');
      process.exit(1);
    }
    
    // Check for multiline support
    if (!deps.some(d => d.includes('baz'))) {
      console.error('FAIL: Missed multiline import!');
      process.exit(1);
    }

    console.log('PASS: Resolver handled imports correctly (unexpectedly, if we expected failure)');
  } catch (e) {
    console.error('Error during test:', e);
    // If it tries to resolve 'fake', it might throw if I didn't create the file?
    // The current implementation crawls recursively.
    // If it finds 'fake', it tries to crawl it.
    // fs.readFile will fail.
    // The current implementation catches readFile error and returns empty string?
    // No:
    // const content = await fs.readFile(filePath, 'utf-8').catch(() => '');
    // So it won't throw, but it will add it to the graph.
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
}

test();
