/**
 * Warning System Types
 * Shared types for the terminal warnings system
 */

export interface Warning {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    fix?: string;
    file?: string;
    line?: number;
    category?: string;
}
