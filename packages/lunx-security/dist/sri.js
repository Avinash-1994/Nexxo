/**
 * S3.1 — Subresource Integrity (SRI) hashes
 * Generates sha384 hashes for every script and link tag in output HTML.
 * Injects integrity + crossorigin="anonymous" into all script/link tags.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
/** Compute sha384 SRI hash for a buffer or string. */
export function computeSRI(content) {
    const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const hash = crypto.createHash('sha384').update(buf).digest('base64');
    return `sha384-${hash}`;
}
/**
 * Generate SRI manifest for all JS and CSS assets in the dist directory.
 */
export function generateSRI(distDir) {
    const manifest = {};
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.js', '.mjs', '.css'].includes(ext)) {
                    const content = fs.readFileSync(full);
                    const rel = path.relative(distDir, full).replace(/\\/g, '/');
                    manifest[rel] = computeSRI(content);
                }
            }
        }
    }
    if (fs.existsSync(distDir))
        walk(distDir);
    // Write manifest
    const outPath = path.join(distDir, 'lunx-sri-manifest.json');
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.info(`[lunx:security] SRI manifest → ${outPath} (${Object.keys(manifest).length} assets)`);
    return manifest;
}
/**
 * Inject integrity and crossorigin attributes into HTML script/link tags.
 */
export function injectSRIIntoHTML(html, manifest) {
    // Inject into <script src="..."> tags
    html = html.replace(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>/gi, (match, before, src, after) => {
        const key = src.replace(/^\//, '').replace(/\?.*$/, '');
        const integrity = manifest[key];
        if (!integrity || match.includes('integrity='))
            return match;
        return `<script${before} src="${src}" integrity="${integrity}" crossorigin="anonymous"${after}>`;
    });
    // Inject into <link rel="stylesheet" href="..."> tags
    html = html.replace(/<link([^>]*)\shref="([^"]+)"([^>]*)\/?>/gi, (match, before, href, after) => {
        if (!match.includes('stylesheet'))
            return match;
        const key = href.replace(/^\//, '').replace(/\?.*$/, '');
        const integrity = manifest[key];
        if (!integrity || match.includes('integrity='))
            return match;
        return `<link${before} href="${href}" integrity="${integrity}" crossorigin="anonymous"${after}>`;
    });
    return html;
}
