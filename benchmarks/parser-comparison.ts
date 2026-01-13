
import { bunParser } from '../src/core/parser-bun';
import * as esbuild from 'esbuild';
import { performance } from 'perf_hooks';

// Mock component code (React-like)
const COMPONENT_CODE = `
import React, { useState, useEffect } from 'react';
import { Button } from './components';

export function ComplexComponent({ title, items }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  }, []);

  const handleClick = () => setCount(c => c + 1);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h1 className="text-xl font-bold">{title}</h1>
      <p>Count: {count}</p>
      <Button onClick={handleClick}>Increment</Button>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
`;

const ITERATIONS = 1000;

async function runBenchmark() {
    console.log('🚀 Starting Parser Comparison Benchmark');
    console.log(`📝 Payload: ~${COMPONENT_CODE.length} bytes (Complex React Component)`);
    console.log(`🔄 Iterations: ${ITERATIONS}`);
    console.log('----------------------------------------');

    // Warmup
    console.log('🔥 Warming up engines...');
    await bunParser.transform(COMPONENT_CODE, 'test.tsx', { isDev: true });
    await esbuild.transform(COMPONENT_CODE, { loader: 'tsx' });

    // 1. Benchmark Bun Parser
    console.log('⚡ Benchmarking Bun Parser...');
    const startBun = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await bunParser.transform(COMPONENT_CODE, 'test.tsx', { isDev: true });
    }
    const endBun = performance.now();
    const timeBun = endBun - startBun;
    const rawBun = timeBun;
    // If we are running in Node (spawning Bun), it will be SLOW. 
    // We need to adjust expectations or run this script with `bun`.
    // The plan implies running IN Bun runtime eventually, or using Bun as a subprocess.
    // If we spawn for every file, it will be slow. If we use a long-lived process, it will be fast.
    // My Parser implementation spawns for every file if not in Bun.

    // 2. Benchmark esbuild
    console.log('⚡ Benchmarking esbuild...');
    const startEsbuild = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await esbuild.transform(COMPONENT_CODE, { loader: 'tsx' });
    }
    const endEsbuild = performance.now();
    const timeEsbuild = endEsbuild - startEsbuild;

    console.log('----------------------------------------');
    console.log(`📊 Results (${ITERATIONS} runs):`);
    console.log(`Bun Parser:   ${timeBun.toFixed(2)}ms (${(timeBun / ITERATIONS).toFixed(3)}ms/file)`);
    console.log(`esbuild:      ${timeEsbuild.toFixed(2)}ms (${(timeEsbuild / ITERATIONS).toFixed(3)}ms/file)`);

    const diff = timeEsbuild - timeBun;
    const improvement = (diff / timeEsbuild) * 100;

    if (diff > 0) {
        console.log(`✅ Bun is ${diff.toFixed(2)}ms faster (${improvement.toFixed(2)}% improvement)`);
    } else {
        console.log(`⚠️ Bun is ${Math.abs(diff).toFixed(2)}ms slower`);
        // Note: If running in Node properly, spawning bun for every file IS slower than esbuild's running service.
        // The architecture goal "Bun.js Parser" likely implies running Nexxo WITH Bun runtime,
        // OR using a persistent worker.
    }
}

runBenchmark().catch(console.error);
