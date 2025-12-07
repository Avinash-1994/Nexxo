import { BuildSession } from '../schema.js';
import { AuditReport } from '../../audit/types.js';

export interface FullBuildReport {
    session: BuildSession;
    trends?: any;
    audits?: AuditReport;
    summary: string;
}

export class ReportAssembler {
    static assemble(session: BuildSession, trends?: any, audits?: AuditReport): FullBuildReport {
        return {
            session,
            trends,
            audits,
            summary: '' // To be filled by Narrator
        };
    }
}
