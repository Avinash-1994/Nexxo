
/**
 * Anomaly Detection System (Day 41)
 * 
 * Monitors runtime and build-time security events including:
 * - CSP Violations
 * - XSS Patterns in Requests
 * - Plugin Escape Attempts
 */

export interface SecurityEvent {
    type: 'csp-violation' | 'xss-attempt' | 'plugin-escape' | 'auth-failure' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    timestamp: number;
    source?: string;
}

export class AnomalyDetector {
    private events: SecurityEvent[] = [];
    private blockedIPs: Set<string> = new Set();

    /**
     * Report a security event
     */
    report(event: Omit<SecurityEvent, 'timestamp'>) {
        const fullEvent: SecurityEvent = {
            ...event,
            timestamp: Date.now()
        };

        this.events.push(fullEvent);

        // Log critical events immediately
        if (fullEvent.severity === 'critical' || fullEvent.severity === 'high') {
            // Using console directly to ensure visibility, or use logger if available
            console.error(`🚨 [SECURITY] ${fullEvent.type.toUpperCase()}:`, fullEvent.details);
        }
    }

    /**
     * Analyze incoming HTTP request for XSS signatures
     */
    scanRequest(req: { url: string, headers: any, method: string }): boolean {
        const xssPatterns = [
            /<script>/i,
            /javascript:/i,
            /onload\s*=/i,
            /onerror\s*=/i,
            /eval\(/i
        ];

        // Decode URL to catch encoded attacks (e.g. %3Cscript%3E)
        let decodedUrl = req.url || '';
        try {
            decodedUrl = decodeURIComponent(req.url || '');
        } catch (e) {
            // malformed URI sequence, use raw
        }

        const target = decodedUrl + JSON.stringify(req.headers);

        for (const pattern of xssPatterns) {
            if (pattern.test(target)) {
                this.report({
                    type: 'xss-attempt',
                    severity: 'high',
                    details: {
                        url: req.url,
                        pattern: pattern.toString(),
                        method: req.method
                    }
                });
                return false; // Block request
            }
        }
        return true; // Safe
    }

    /**
     * Get scan summary
     */
    getDashboard() {
        return {
            totalEvents: this.events.length,
            critical: this.events.filter(e => e.severity === 'critical').length,
            high: this.events.filter(e => e.severity === 'high').length,
            recentEvents: this.events.slice(-10)
        };
    }
}

export const anomalyDetector = new AnomalyDetector();
