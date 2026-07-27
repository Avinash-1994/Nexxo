/**
 * S3.2 — Content Security Policy (CSP) Generation
 * Generates a strict CSP header based on what the build actually emits.
 * No manual CSP writing required.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface CSPConfig {
  directives?: Record<string, string[]>;
  reportUri?: string;
  cdnOrigins?: string[];
}

export interface CSPResult {
  header: string;
  metaTag: string;
}

/** Collect inline script/style hashes from HTML for CSP */
function collectInlineHashes(html: string): { scripts: string[]; styles: string[] } {
  const scripts: string[] = [];
  const styles: string[] = [];

  // Inline scripts
  const scriptMatches = html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of scriptMatches) {
    const content = m[1].trim();
    if (content) {
      const hash = crypto.createHash('sha384').update(content, 'utf8').digest('base64');
      scripts.push(`'sha384-${hash}'`);
    }
  }

  // Inline styles
  const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const m of styleMatches) {
    const content = m[1].trim();
    if (content) {
      const hash = crypto.createHash('sha384').update(content, 'utf8').digest('base64');
      styles.push(`'sha384-${hash}'`);
    }
  }

  return { scripts, styles };
}

/**
 * Generate a strict CSP from the production build output.
 * @param distDir – path to dist directory
 * @param config – optional user overrides
 */
export function generateCSP(distDir: string, config: CSPConfig = {}): CSPResult {
  // Collect inline hashes from all HTML files
  const allScriptHashes: string[] = [];
  const allStyleHashes: string[] = [];

  if (fs.existsSync(distDir)) {
    for (const file of fs.readdirSync(distDir).filter((f) => f.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(distDir, file), 'utf8');
      const { scripts, styles } = collectInlineHashes(html);
      allScriptHashes.push(...scripts);
      allStyleHashes.push(...styles);
    }
  }

  const cdnOrigins = config.cdnOrigins ?? [];
  const extra = config.directives ?? {};

  const directives: Record<string, string[]> = {
    'default-src': ["'none'"],
    'script-src': ["'self'", ...allScriptHashes, ...cdnOrigins],
    'style-src': ["'self'", ...allStyleHashes],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'manifest-src': ["'self'"],
    ...extra,
  };

  if (config.reportUri) {
    directives['report-uri'] = [config.reportUri];
  }

  const header = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');

  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${header}">`;

  // Write output files
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'lunx-csp.txt'), `Content-Security-Policy: ${header}\n`, 'utf8');
    fs.writeFileSync(path.join(distDir, 'lunx-csp-meta.html'), metaTag + '\n', 'utf8');
    console.info(`[lunx:security] CSP generated → ${path.join(distDir, 'lunx-csp.txt')}`);
  }

  return { header, metaTag };
}
