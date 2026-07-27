/**
 * S3.3 — Security Headers Recommendation File
 * Emits dist/lunx-headers.json with recommended server headers
 * including Nginx, Apache, Vercel, Netlify, and Cloudflare configurations.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface SecurityHeaders {
  headers: Record<string, string>;
  configs: {
    nginx: string;
    apache: string;
    vercel: string;
    netlify: string;
    cloudflare: string;
  };
}

export function generateSecurityHeaders(
  distDir: string,
  csp: string
): SecurityHeaders {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': csp,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };

  const headerLines = Object.entries(headers);

  const nginx = `# Lunx Security Headers — Nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "${csp}" always;`;

  const apache = `# Lunx Security Headers — Apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Content-Security-Policy "${csp}"`;

  const vercel = JSON.stringify({
    headers: [{
      source: '/(.*)',
      headers: headerLines.map(([key, value]) => ({ key, value })),
    }],
  }, null, 2);

  const netlify = `# Lunx Security Headers — Netlify (_headers file)
/*
${headerLines.map(([k, v]) => `  ${k}: ${v}`).join('\n')}`;

  const cloudflare = `// Lunx Security Headers — Cloudflare Workers
const SECURITY_HEADERS = {
${headerLines.map(([k, v]) => `  '${k}': '${v.replace(/'/g, "\\'")}'`).join(',\n')}
};
export default {
  async fetch(request, env) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
    return new Response(response.body, { ...response, headers: newHeaders });
  }
};`;

  const result: SecurityHeaders = {
    headers,
    configs: { nginx, apache, vercel, netlify, cloudflare },
  };

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(
      path.join(distDir, 'lunx-headers.json'),
      JSON.stringify(result, null, 2),
      'utf8'
    );
    console.info(`[lunx:security] Security headers → ${path.join(distDir, 'lunx-headers.json')}`);
  }

  return result;
}
