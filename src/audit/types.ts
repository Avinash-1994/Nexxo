export interface AuditResult {
    id: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    score: number; // 0-100
    details: string;
}

export interface AuditGroup {
    name: string;
    results: AuditResult[];
    score: number; // Average score
}

export interface AuditReport {
    timestamp: number;
    groups: {
        a11y?: AuditGroup;
        perf?: AuditGroup;
        seo?: AuditGroup;
    };
}
