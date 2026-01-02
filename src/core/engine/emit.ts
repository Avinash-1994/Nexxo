
/**
 * Engine Emission and Fingerprinting Stage
 * 
 * @internal - This handles FS writes and build auditing. Not for public use.
 */

import { BuildArtifact, BuildContext, BuildFingerprint, InputFingerprint, BuildPlan } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import fs from 'fs/promises';
import path from 'path';

// Stage 8: Emit Artifacts
export async function emit(artifacts: BuildArtifact[], ctx: BuildContext): Promise<BuildArtifact[]> {
    explainReporter.report('emit', 'start', 'Starting emit phase');

    await fs.mkdir(ctx.config.outputDir, { recursive: true });

    const emitted: BuildArtifact[] = [];

    for (const artifact of artifacts) {
        if (artifact.source === undefined) continue;

        const outputPath = path.join(ctx.config.outputDir, artifact.fileName);

        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        explainReporter.report('emit', 'writing', `Writing artifact: ${outputPath}`);
        await fs.writeFile(outputPath, artifact.source);

        // Final sanity check of what was written vs what was in memory?
        // Skipped for performance.

        emitted.push(artifact);
    }

    // Write build-manifest.json (Phase 4.3)
    const manifest = {
        timestamp: new Date().toISOString(),
        target: ctx.target,
        artifacts: emitted.map(a => ({
            fileName: a.fileName,
            hash: a.id,
            type: a.type
        }))
    };
    await fs.writeFile(path.join(ctx.config.outputDir, 'build-manifest.json'), JSON.stringify(manifest, null, 2));

    // Write Explain Log
    const explainLogPath = path.join(ctx.config.outputDir, 'build-explain.json');
    await fs.writeFile(explainLogPath, JSON.stringify(explainReporter.getEvents(), null, 2));

    explainReporter.report('emit', 'complete', `Emitted ${emitted.length} artifacts`);

    return emitted;
}

// Stage 9: Output Fingerprinting
export function computeBuildFingerprint(
    inputFingerprint: InputFingerprint,
    artifacts: BuildArtifact[],
    plan: BuildPlan,
    ctx: BuildContext
): BuildFingerprint {
    explainReporter.report('audit', 'start', 'Computing build fingerprint');

    // Output Hash = Hash of all artifact IDs (content hashes) in order
    const outputIds = artifacts.map(a => a.id);
    const outputHash = canonicalHash(outputIds);

    const fingerprint: BuildFingerprint = {
        engineVersion: ctx.engine.version,
        graphHash: ctx.graphHash,
        planHash: plan.planId,
        inputHash: inputFingerprint.inputHash,
        outputHash: outputHash,
        target: ctx.target,
        buildTime: new Date().toISOString()
    };

    explainReporter.report('audit', 'complete', 'Build fingerprint computed', { outputHash: fingerprint.outputHash });

    return fingerprint;
}
