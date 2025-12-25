
import { DependencyGraph, GraphNode, GraphEdgeKind } from '../../resolve/graph.js';
import { CSSImportPrecedenceResolver } from '../../resolve/css-precedence.js';
import { PluginManager } from '../plugins/manager.js';
import { log } from '../../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';
import { generateModuleId } from '../../resolve/utils.js';

export interface CSSUsage {
    selector: string;
    usedByModules: string[];
    usagePercentage: number;
}

import { canonicalHash } from '../engine/hash.js';

export class CSSEngine {
    private precedenceResolver = new CSSImportPrecedenceResolver();

    constructor(
        private graph: DependencyGraph,
        private pluginManager: PluginManager
    ) { }

    /**
     * 7.1 CSS & CSS-IN-JS DETECTION
     */
    async detect(filePath: string, content: string): Promise<GraphNode['type'] | null> {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.css') {
            if (filePath.endsWith('.module.css')) return 'css-module';
            return 'css';
        }

        if (['.scss', '.less', '.styl'].includes(ext)) {
            return 'css';
        }

        // CSS-in-JS detection (Module 4 extractors would do the heavy lifting)
        if (content.includes('styled-components') || content.includes('@emotion/react') || content.includes('linaria')) {
            return 'css-in-js';
        }

        return null;
    }

    /**
     * 7.2 CSS DEPENDENCY GRAPH + IMPORT PRECEDENCE
     */
    async processEdges(node: GraphNode) {
        if (node.type !== 'css' && node.type !== 'css-module' && node.type !== 'css-in-js') return;

        // Resolve precedence deterministically
        node.edges = this.precedenceResolver.resolve(node.edges, this.graph.nodes);
    }

    /**
     * 7.6 GRAPH-BASED CSS TREE-SHAKING
     */
    async treeShake(node: GraphNode, usedSelectors: Set<string>): Promise<string> {
        // In a real implementation, we'd parse the CSS and remove unused selectors
        // based on the reachable selectors found in the dependency graph.
        log.info(`Tree-shaking CSS for ${node.id}`);

        // Placeholder for actual tree-shaking logic
        // Uses Module 2 graph to know which selectors are reachable from JS modules
        return node.path; // Return path for now
    }

    /**
   * 7.5 DETERMINISTIC CSS MODULES
   */
    generateClassNameHash(filePath: string, className: string): string {
        // SHA256(filePath + className) as per plan
        return canonicalHash(filePath + className).slice(0, 8);
    }

    /**
     * 7.3 CSS TRANSFORM PIPELINE (WASM + JS Hybrid)
     */
    async transform(node: GraphNode): Promise<string> {
        // 1. Detect if it's Tailwind, SCSS, etc.
        // 2. Call WASM plugins for CPU-heavy (Sass, Tailwind)
        // 3. Call JS plugins for others

        log.info(`Transforming CSS node: ${node.id}`);

        // Hybrid model: 
        // - runHook('transformModule', ...)
        const result = await this.pluginManager.runHook('transformModule', {
            id: node.id,
            path: node.path,
            type: node.type,
            code: '' // Assuming code is loaded elsewhere or we load it here
        });

        return result.code;
    }

    /**
     * 7.1 CSS-IN-JS EXTRACTION (Unified)
     */
    async extractCSSInJS(node: GraphNode, rootDir: string) {
        if (node.type !== 'css-in-js') return;

        log.info(`Extracting CSS-in-JS from ${node.path}`);

        // Use plugins to extract CSS
        const content = await fs.readFile(node.path, 'utf-8');
        const result = await this.pluginManager.runHook('transformModule', {
            id: node.id,
            path: node.path,
            type: node.type,
            code: content
        });

        if (result.metadata?.cssInJs) {
            node.cssInJs = result.metadata.cssInJs;

            // Create virtual CSS node in graph
            const virtualPath = `${node.path}.extracted.css`;
            const virtualId = generateModuleId('css', virtualPath, rootDir);

            this.graph.nodes.set(virtualId, {
                id: virtualId,
                type: 'css',
                path: virtualPath,
                contentHash: canonicalHash(result.metadata.cssInJs.extractedCss),
                edges: []
            });

            // Add edge from JS to virtual CSS
            node.edges.push({
                from: node.id,
                to: virtualId,
                kind: 'js-style-import'
            });

            log.success(`Extracted CSS from ${node.path} -> ${virtualPath}`);
        }
    }
}
