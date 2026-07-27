/**
 * @lunx/plugin-compression — Brotli + Gzip in one plugin
 * Replaces: vite-plugin-compression, compression-webpack-plugin
 * Permissions: fs:write
 *
 * Compresses all output assets after production build.
 * Uses Node.js zlib (Brotli level 11, Gzip level 9) in parallel.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

export interface CompressionOptions {
  /** Compression algorithms to apply (default: both) */
  algorithm?: ('brotli' | 'gzip')[];
  /** Minimum file size in bytes to compress (default: 1024) */
  threshold?: number;
  /** Whether to delete original uncompressed files (default: false) */
  deleteOriginalAssets?: boolean;
  /** File extensions to skip (already compressed formats) */
  skipExtensions?: string[];
}

const DEFAULT_SKIP = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.woff2', '.wasm', '.br', '.gz'];

/** Format bytes to human-readable string */
function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Get all files in a directory recursively */
function* walkFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(full);
    else yield full;
  }
}

export function compression(options: CompressionOptions = {}) {
  const {
    algorithm = ['brotli', 'gzip'],
    threshold = 1024,
    deleteOriginalAssets = false,
    skipExtensions = DEFAULT_SKIP,
  } = options;

  return {
    name: '@lunx/plugin-compression',
    enforce: 'post' as const,

    async closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(distDir)) return;

      const files = [...walkFiles(distDir)];
      const summaryLines: string[] = [];
      let totalSaved = 0;

      await Promise.all(
        files.map(async (file) => {
          const ext = path.extname(file).toLowerCase();
          if (skipExtensions.includes(ext)) return;

          const content = fs.readFileSync(file);
          if (content.length < threshold) return;

          const original = content.length;
          const tasks: Promise<void>[] = [];

          if (algorithm.includes('brotli')) {
            tasks.push(
              brotliCompress(content, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).then(
                (compressed) => {
                  fs.writeFileSync(file + '.br', compressed);
                  const rel = path.relative(distDir, file);
                  summaryLines.push(
                    `  ${rel.padEnd(40)} ${fmt(original).padStart(8)} → ${fmt(compressed.length).padStart(8)} (br)`
                  );
                  totalSaved += original - compressed.length;
                }
              )
            );
          }

          if (algorithm.includes('gzip')) {
            tasks.push(
              gzip(content, { level: 9 }).then((compressed) => {
                fs.writeFileSync(file + '.gz', compressed);
              })
            );
          }

          await Promise.all(tasks);

          if (deleteOriginalAssets) fs.unlinkSync(file);
        })
      );

      if (summaryLines.length > 0) {
        console.log('\n[lunx:compression] Asset compression summary:');
        summaryLines.forEach((l) => console.log(l));
        console.log(`  Total saved: ${fmt(totalSaved)}`);
      }
    },
  };
}

export default compression;
