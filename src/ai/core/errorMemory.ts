import crypto from 'crypto';

export interface LearnedError {
    id: string; // sha256(signature)
    type: 'missingDep' | 'syntax' | 'config' | 'unknown';
    signature: string; // Normalized error hash
    context: {
        framework: string;
        configHash: string;
        snippet?: string;
    };
    timestamp: number;
}

export class ErrorMemory {
    static normalize(rawError: string, context: any = {}): LearnedError {
        // 1. Strip volatile data (timestamps, absolute paths, line numbers)
        // We want the "shape" of the error, not the specific instance
        const cleanError = rawError
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '<TIMESTAMP>')
            .replace(/\/[\w\-\.]+(\/[\w\-\.]+)+/g, '<PATH>') // Unix paths
            .replace(/[A-Z]:\\[\w\-\.]+(\\[\w\-\.]+)+/g, '<PATH>') // Windows paths
            .replace(/\(\d+,\d+\)/g, '(<LINE>,<COL>)')
            .replace(/line \d+/g, 'line <LINE>');

        // 2. Generate Signature
        const signature = crypto.createHash('sha256').update(cleanError).digest('hex');

        // 3. Generate ID (Signature + Context helps, but for now ID = Signature for deduplication)
        const id = signature;

        // 4. Determine Type (Simple heuristic, can be expanded)
        let type: LearnedError['type'] = 'unknown';
        if (rawError.includes('Module not found') || rawError.includes('Cannot find module')) type = 'missingDep';
        else if (rawError.includes('SyntaxError') || rawError.includes('expected')) type = 'syntax';
        else if (rawError.includes('config') || rawError.includes('json')) type = 'config';

        return {
            id,
            type,
            signature,
            context: {
                framework: context.framework || 'unknown',
                configHash: context.configHash || 'unknown',
                snippet: context.snippet
            },
            timestamp: Date.now()
        };
    }
}
