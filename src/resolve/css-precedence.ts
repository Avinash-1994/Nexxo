
import { GraphEdge, CSSImportPrecedence } from './graph.js';

export interface ExplainEvent {
    stage: string;
    subjectId?: string;
    decision: string;
    reason: string;
    data?: any;
}

export class CSSImportPrecedenceResolver {
    private explains: ExplainEvent[] = [];

    resolve(edges: GraphEdge[], nodes: Map<string, any>): GraphEdge[] {
        const cssEdges = edges.filter(e => e.kind === 'css-import' || e.kind === 'css-layer');

        // Sort logic based on CSS cascade rules:
        // 1. @layer precedence (lower layer = lower precedence)
        // 2. Specificity (id > class > element) - though @import doesn't have specificity in the traditional sense, 
        //    the plan suggests a specificity score for the import itself or its target.
        // 3. Source order (later = higher precedence)

        const resolved = [...cssEdges].sort((a, b) => {
            const precA = this.getPrecedence(a);
            const precB = this.getPrecedence(b);

            // Cascade Layers First
            if (precA.cascadeLayer !== precB.cascadeLayer) {
                return this.compareLayers(precA.cascadeLayer, precB.cascadeLayer);
            }

            // Specificity Second
            if (precA.specificity !== precB.specificity) {
                return precA.specificity - precB.specificity;
            }

            // Source Order Third
            return precA.sourceOrder - precB.sourceOrder;
        });

        this.emitExplains(edges, resolved);
        return resolved;
    }

    private getPrecedence(edge: GraphEdge): CSSImportPrecedence {
        return (edge.metadata?.precedence as CSSImportPrecedence) || {
            specificity: 0,
            sourceOrder: 0
        };
    }

    private compareLayers(layerA?: string, layerB?: string): number {
        // Tailwind standard layers order: base < components < utilities
        const order = ['base', 'components', 'utilities'];
        const idxA = layerA ? order.indexOf(layerA) : -1;
        const idxB = layerB ? order.indexOf(layerB) : -1;
        return idxA - idxB;
    }

    private emitExplains(original: GraphEdge[], resolved: GraphEdge[]) {
        resolved.forEach((edge, index) => {
            const prec = this.getPrecedence(edge);
            this.explains.push({
                stage: 'css-precedence',
                subjectId: edge.to,
                decision: `Position ${index}`,
                reason: `Resolved via @layer: ${prec.cascadeLayer || 'none'}, specificity: ${prec.specificity}, order: ${prec.sourceOrder}`
            });
        });
    }

    getExplains(): ExplainEvent[] {
        return this.explains;
    }
}
