import crypto from 'crypto';
import { LearnedError } from '../core/errorMemory.js';
import { FixAction } from '../healer/fixer.js';

export interface AnonymizedLearning {
    errorSignature: string; // sha256(error + context)
    fixSignature: string;   // sha256(fix recipe)
    success: boolean;
    durationMs: number;
    projectSize: number;    // file count
    framework: string;
    anonymized: true;
}

export class TelemetryCollector {
    static anonymize(
        error: LearnedError,
        fix: FixAction,
        success: boolean,
        durationMs: number,
        projectSize: number
    ): AnonymizedLearning {
        // Hash everything - NO source code, NO file contents, NO config values
        const errorSignature = crypto
            .createHash('sha256')
            .update(error.signature + JSON.stringify(error.context))
            .digest('hex');

        const fixSignature = crypto
            .createHash('sha256')
            .update(JSON.stringify(fix))
            .digest('hex');

        return {
            errorSignature,
            fixSignature,
            success,
            durationMs,
            projectSize,
            framework: error.context.framework || 'unknown',
            anonymized: true
        };
    }
}
