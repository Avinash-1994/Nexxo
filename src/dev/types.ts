
import { BuildContext, BuildPlan, BuildArtifact } from '../core/engine/types.js';

// Module 5 Types

export interface HMRBoundary {
    moduleId: string;
    boundaryType: 'safe' | 'unsafe' | 'reload-required';
    reason: string;
}

export interface ModuleUpdate {
    moduleId: string;
    url: string;
    affectedExports: string[] | null;
    reason: string;
    timestamp: number;
}

export type HMRDecision = 'hot-update' | 'reload';

export interface HMRDecisionTrace {
    changeSet: string[];
    affectedModules: string[];
    boundaries: HMRBoundary[];
    decision: HMRDecision;
    decidedBy: 'server' | 'client';
}

export interface HMRStats {
    graphHash: string;
    lastDeltaSize: number;
    lastHMRDuration: number;
    failureCount: number;
}

export interface HMRMessage {
    type: 'connected' | 'update' | 'reload' | 'error' | 'status';
    payload: any;
}
