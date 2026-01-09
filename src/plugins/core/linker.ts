
import { NexxoPlugin } from '../../core/plugins/types.js';
import { canonicalHash } from '../../core/engine/hash.js';
import { GraphNode } from '../../resolve/graph.js';

/**
 * Internal Linker Plugin
 * 
 * Rewrites import/require specifiers using the DependencyGraph's specifierMap.
 * This runs after all other transformations to ensure final code uses Nexxo module IDs.
 */
export function createLinkerPlugin(): NexxoPlugin {
    return {
        manifest: {
            name: 'nexxo:linker',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['transformModule'],
            permissions: { fs: 'none' }
        },
        id: canonicalHash('nexxo:linker'),
        async runHook(hook, input, context) {
            if (hook !== 'transformModule') return input;

            // We need the graph to do linking
            const graph = context?.graph;
            if (!graph) return input;

            // Find the node for this file
            // Note: input.path is absolute
            const node = (Array.from(graph.nodes.values()) as any[]).find((n: any) => n.path === input.path) as GraphNode | undefined;
            if (!node || !node.specifierMap) return input;

            let code = input.code;

            // Basic speculative replacement for performance
            // In a production world, we'd use a proper AST walker or a regex that guards against comments
            // For now, let's use a regex that matches require("specifier") or from "specifier"
            for (const [specifier, targetId] of Object.entries(node.specifierMap)) {
                // Escape regex special chars
                const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Replace in require()
                const requireRegex = new RegExp(`require\\s*\\(\\s*['"]${escaped}['"]\\s*\\)`, 'g');
                code = code.replace(requireRegex, `require(${JSON.stringify(targetId)})`);

                // Replace in import ... from "..."
                const importRegex = new RegExp(`from\\s*['"]${escaped}['"]`, 'g');
                code = code.replace(importRegex, `from ${JSON.stringify(targetId)}`);

                // Replace in import("...")
                const dynamicImportRegex = new RegExp(`import\\s*\\(\\s*['"]${escaped}['"]\\s*\\)`, 'g');
                code = code.replace(dynamicImportRegex, `import(${JSON.stringify(targetId)})`);
            }

            return { ...input, code };
        }
    };
}
