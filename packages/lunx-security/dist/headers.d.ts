/**
 * S3.3 — Security Headers Recommendation File
 * Emits dist/lunx-headers.json with recommended server headers
 * including Nginx, Apache, Vercel, Netlify, and Cloudflare configurations.
 */
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
export declare function generateSecurityHeaders(distDir: string, csp: string): SecurityHeaders;
