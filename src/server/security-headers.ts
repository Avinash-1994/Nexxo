import { IncomingMessage, ServerResponse } from 'http';

export interface SecurityHeadersConfig {
    csp?: string | boolean;
    hsts?: boolean;
    frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
    xssProtection?: boolean;
    contentTypeNosniff?: boolean;
    referrerPolicy?: string;
    permissionsPolicy?: string;
}

/**
 * Production-grade security headers middleware
 */
export class SecurityHeaders {
    private config: SecurityHeadersConfig;

    constructor(config: SecurityHeadersConfig = {}) {
        this.config = {
            csp: config.csp ?? true,
            hsts: config.hsts ?? true,
            frameOptions: config.frameOptions ?? 'SAMEORIGIN',
            xssProtection: config.xssProtection ?? true,
            contentTypeNosniff: config.contentTypeNosniff ?? true,
            referrerPolicy: config.referrerPolicy ?? 'strict-origin-when-cross-origin',
            permissionsPolicy: config.permissionsPolicy
        };
    }

    /**
     * Apply security headers to response
     */
    apply(req: IncomingMessage, res: ServerResponse): void {
        // Content Security Policy
        if (this.config.csp) {
            const cspValue = typeof this.config.csp === 'string'
                ? this.config.csp
                : this.getDefaultCSP();
            res.setHeader('Content-Security-Policy', cspValue);
        }

        // HTTP Strict Transport Security
        if (this.config.hsts) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // X-Frame-Options
        if (this.config.frameOptions) {
            res.setHeader('X-Frame-Options', this.config.frameOptions);
        }

        // X-XSS-Protection (legacy, but still useful)
        if (this.config.xssProtection) {
            res.setHeader('X-XSS-Protection', '1; mode=block');
        }

        // X-Content-Type-Options
        if (this.config.contentTypeNosniff) {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }

        // Referrer-Policy
        if (this.config.referrerPolicy) {
            res.setHeader('Referrer-Policy', this.config.referrerPolicy);
        }

        // Permissions-Policy (formerly Feature-Policy)
        if (this.config.permissionsPolicy) {
            res.setHeader('Permissions-Policy', this.config.permissionsPolicy);
        } else {
            // Default: restrict dangerous features
            res.setHeader('Permissions-Policy',
                'camera=(), microphone=(), geolocation=(), interest-cohort=()');
        }

        // Additional security headers
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        res.setHeader('X-Download-Options', 'noopen');
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    }

    /**
     * Get default Content Security Policy for development
     */
    private getDefaultCSP(): string {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed for dev
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss:", // WebSocket for HMR
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
    }

    /**
     * Get production-grade CSP (stricter)
     */
    static getProductionCSP(nonce?: string): string {
        const nonceAttr = nonce ? ` 'nonce-${nonce}'` : '';
        return [
            "default-src 'self'",
            `script-src 'self'${nonceAttr}`,
            "style-src 'self' 'unsafe-inline'", // Some frameworks need this
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ].join('; ');
    }

    /**
     * Middleware function for Express-like servers
     */
    middleware() {
        return (req: IncomingMessage, res: ServerResponse, next?: () => void) => {
            this.apply(req, res);
            if (next) next();
        };
    }
}

/**
 * Create security headers middleware with config
 */
export function createSecurityHeaders(config?: SecurityHeadersConfig): SecurityHeaders {
    return new SecurityHeaders(config);
}
