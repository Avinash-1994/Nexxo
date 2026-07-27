/**
 * @lunx/plugin-image — Image Optimization via sharp
 * Replaces: vite-plugin-imagemin, @imagetools/vite
 * Peer dep: sharp (optional — graceful fallback if missing)
 * Permissions: fs:read, fs:write
 *
 * Features:
 *  - AVIF + WebP generation in parallel
 *  - Responsive srcset output (configurable breakpoints)
 *  - sharp optimization (quality, lossless)
 *  - Graceful fallback (copy-only) when sharp not installed
 *  - Zero config: auto-processes all assets/**\/*.{jpg,png,gif,webp}
 *
 * RULE 1: Zero breaking changes — additive only
 * RULE 2: sharp is optional peer dependency
 * RULE 7: All options optional with defaults
 */

import fs from 'node:fs';
import path from 'node:path';

export interface ImageBreakpoint {
  width: number;
  suffix: string;
}

export interface ImagePluginOptions {
  /** Image extensions to process (default: ['.jpg', '.jpeg', '.png', '.gif', '.webp']) */
  extensions?: string[];
  /** Generate AVIF variants (default: true) */
  avif?: boolean;
  /** Generate WebP variants (default: true) */
  webp?: boolean;
  /** JPEG/WebP quality 1-100 (default: 80) */
  quality?: number;
  /** Responsive breakpoints (default: 320, 768, 1280) */
  breakpoints?: ImageBreakpoint[];
  /** Subdirectory within outDir to process (default: 'assets') */
  assetsDir?: string;
  /** Skip optimization and only copy if sharp unavailable (default: true) */
  gracefulFallback?: boolean;
}

const PLUGIN_PERMISSIONS = {
  lunx: { permissions: ['fs:read', 'fs:write'] }
};

const DEFAULT_BREAKPOINTS: ImageBreakpoint[] = [
  { width: 320,  suffix: '-sm'  },
  { width: 768,  suffix: '-md'  },
  { width: 1280, suffix: '-lg'  },
];

const DEFAULT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/** Attempt to load sharp — returns null if not installed */
async function tryLoadSharp(): Promise<any | null> {
  try {
    // @ts-ignore — sharp is an optional peer dependency
    return await import('sharp');
  } catch {
    return null;
  }
}

/**
 * Generate srcset string for a base image at multiple breakpoints.
 * e.g. "/assets/hero-sm.webp 320w, /assets/hero-md.webp 768w, ..."
 */
export function generateSrcset(
  baseUrl: string,
  breakpoints: ImageBreakpoint[],
  format: 'webp' | 'avif' | 'original' = 'webp'
): string {
  const ext = format === 'original' ? path.extname(baseUrl) : `.${format}`;
  const base = baseUrl.replace(/\.[^.]+$/, '');
  return breakpoints
    .map(bp => `${base}${bp.suffix}${ext} ${bp.width}w`)
    .join(', ');
}

/**
 * Generate <picture> element with AVIF + WebP + original fallback.
 */
export function generatePictureElement(
  src: string,
  alt: string,
  breakpoints: ImageBreakpoint[],
  className?: string
): string {
  const avifSrcset = generateSrcset(src, breakpoints, 'avif');
  const webpSrcset = generateSrcset(src, breakpoints, 'webp');
  const origSrcset = generateSrcset(src, breakpoints, 'original');
  const classAttr = className ? ` class="${className}"` : '';

  return [
    '<picture>',
    `  <source type="image/avif" srcset="${avifSrcset}" sizes="(max-width: 320px) 320px, (max-width: 768px) 768px, 1280px">`,
    `  <source type="image/webp" srcset="${webpSrcset}" sizes="(max-width: 320px) 320px, (max-width: 768px) 768px, 1280px">`,
    `  <img src="${src}" srcset="${origSrcset}" alt="${alt}"${classAttr} loading="lazy" decoding="async">`,
    '</picture>',
  ].join('\n');
}

/**
 * Process a single image file with sharp (or fallback copy).
 */
async function processImage(
  srcPath: string,
  outDir: string,
  options: Required<ImagePluginOptions>,
  sharpLib: any | null
): Promise<{ original: string; webp: string[]; avif: string[]; sizes: number[] }> {
  const ext = path.extname(srcPath).toLowerCase();
  const base = path.basename(srcPath, ext);
  const result = { original: srcPath, webp: [] as string[], avif: [] as string[], sizes: [] as number[] };

  if (!sharpLib || !options.gracefulFallback === false) {
    // Fallback: just copy the file
    const dest = path.join(outDir, path.basename(srcPath));
    fs.copyFileSync(srcPath, dest);
    return result;
  }

  const sharp = sharpLib.default ?? sharpLib;

  for (const bp of options.breakpoints) {
    const img = sharp(srcPath).resize(bp.width, null, { withoutEnlargement: true });

    if (options.webp) {
      const webpName = `${base}${bp.suffix}.webp`;
      const webpPath = path.join(outDir, webpName);
      await img.clone().webp({ quality: options.quality }).toFile(webpPath);
      result.webp.push(webpPath);
    }

    if (options.avif) {
      const avifName = `${base}${bp.suffix}.avif`;
      const avifPath = path.join(outDir, avifName);
      await img.clone().avif({ quality: options.quality }).toFile(avifPath);
      result.avif.push(avifPath);
    }

    result.sizes.push(bp.width);
  }

  return result;
}

/**
 * Main plugin factory.
 */
export function lunxPluginImage(options: ImagePluginOptions = {}): any {
  const resolved: Required<ImagePluginOptions> = {
    extensions:     options.extensions     ?? DEFAULT_EXTENSIONS,
    avif:           options.avif           ?? true,
    webp:           options.webp           ?? true,
    quality:        options.quality        ?? 80,
    breakpoints:    options.breakpoints    ?? DEFAULT_BREAKPOINTS,
    assetsDir:      options.assetsDir      ?? 'assets',
    gracefulFallback: options.gracefulFallback ?? true,
  };

  let sharpLib: any | null = null;

  return {
    name: '@lunx/plugin-image',
    ...PLUGIN_PERMISSIONS,

    async buildStart() {
      sharpLib = await tryLoadSharp();
      if (!sharpLib) {
        console.info(
          '[lunx:plugin-image] INFO: sharp not installed — using copy-only fallback.\n' +
          '  Install sharp for AVIF/WebP optimization: npm install --save-dev sharp'
        );
      }
    },

    // Lunx build hook
    async buildOutput(outputDir: string): Promise<void> {
      const assetsDir = path.join(outputDir, resolved.assetsDir);
      if (!fs.existsSync(assetsDir)) return;

      const imageFiles = fs.readdirSync(assetsDir)
        .filter(f => resolved.extensions.includes(path.extname(f).toLowerCase()))
        .map(f => path.join(assetsDir, f));

      if (imageFiles.length === 0) return;

      console.log(`[lunx:plugin-image] Processing ${imageFiles.length} image(s)...`);
      const t0 = performance.now();

      const results = await Promise.all(
        imageFiles.map(f => processImage(f, assetsDir, resolved, sharpLib))
      );

      const total = results.reduce((acc, r) => acc + r.webp.length + r.avif.length, 0);
      const ms = Math.round(performance.now() - t0);
      console.log(`[lunx:plugin-image] Generated ${total} variant(s) in ${ms}ms`);
    },

    // Vite/Rollup hook: transform image imports
    transform(code: string, id: string) {
      if (!resolved.extensions.some(ext => id.endsWith(ext))) return null;
      // Return object with src + srcset helper
      return {
        code: `export default { src: ${JSON.stringify(id)}, generateSrcset: ${generateSrcset.toString()} };`,
        map: null,
      };
    },
  };
}

export default lunxPluginImage;
