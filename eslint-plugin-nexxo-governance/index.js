/**
 * ESLint Plugin: Nexxo Governance
 * 
 * Enforces governance boundaries defined in Phase H2:
 * - Prevents imports from internal modules
 * - Requires experimental flags for unstable APIs
 * - Blocks access to protected core code
 * 
 * @see docs/internal/EXTENSION_SURFACE.md
 * @see docs/internal/PLUGIN_CONTRACT.md
 */

module.exports = {
    rules: {
        'no-internal-imports': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Prevent imports from internal Nexxo modules',
                    category: 'Governance',
                    recommended: true,
                },
                messages: {
                    internalImport: 'Import from internal module "{{module}}" is forbidden. See docs/internal/EXTENSION_SURFACE.md',
                    coreImport: 'Direct import from core module "{{module}}" is forbidden. Core APIs are not public.',
                },
                schema: [],
            },
            create(context) {
                const FORBIDDEN_MODULES = [
                    'src/core/graph',
                    'src/core/planner',
                    'src/core/cache',
                    'src/core/hash',
                    'src/core/resolver',
                    'src/core/pipeline',
                ];

                const INTERNAL_PATTERNS = [
                    /\/core\//,
                    /\/internal\//,
                    /\/__internal__\//,
                ];

                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;

                        // Check for explicit forbidden modules
                        if (FORBIDDEN_MODULES.some(mod => importPath.includes(mod))) {
                            context.report({
                                node,
                                messageId: 'coreImport',
                                data: { module: importPath },
                            });
                        }

                        // Check for internal patterns
                        if (INTERNAL_PATTERNS.some(pattern => pattern.test(importPath))) {
                            context.report({
                                node,
                                messageId: 'internalImport',
                                data: { module: importPath },
                            });
                        }
                    },
                };
            },
        },

        'require-experimental-flag': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Require explicit opt-in for experimental APIs',
                    category: 'Governance',
                    recommended: true,
                },
                messages: {
                    missingFlag: 'Experimental API "{{api}}" requires explicit opt-in. Set config.experimental.{{feature}} = true',
                },
                schema: [],
            },
            create(context) {
                const EXPERIMENTAL_APIS = [
                    'aiOptimizer',
                    'edgeRuntime',
                    'ssrStreaming',
                ];

                return {
                    CallExpression(node) {
                        if (node.callee.type === 'Identifier') {
                            const apiName = node.callee.name;

                            if (EXPERIMENTAL_APIS.includes(apiName)) {
                                // Check if experimental flag is set in config
                                // This is a simplified check; real implementation would parse config
                                context.report({
                                    node,
                                    messageId: 'missingFlag',
                                    data: {
                                        api: apiName,
                                        feature: apiName,
                                    },
                                });
                            }
                        }
                    },
                };
            },
        },

        'no-graph-mutation': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Prevent direct mutation of dependency graph',
                    category: 'Governance',
                    recommended: true,
                },
                messages: {
                    graphMutation: 'Direct graph mutation is forbidden. Graph is managed by core only.',
                },
                schema: [],
            },
            create(context) {
                const GRAPH_MUTATION_METHODS = [
                    'addNode',
                    'removeNode',
                    'addEdge',
                    'removeEdge',
                    'clear',
                ];

                return {
                    MemberExpression(node) {
                        if (
                            node.object.name === 'graph' &&
                            node.property.type === 'Identifier' &&
                            GRAPH_MUTATION_METHODS.includes(node.property.name)
                        ) {
                            context.report({
                                node,
                                messageId: 'graphMutation',
                            });
                        }
                    },
                };
            },
        },

        'no-cache-access': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Prevent direct access to cache internals',
                    category: 'Governance',
                    recommended: true,
                },
                messages: {
                    cacheAccess: 'Direct cache access is forbidden. Cache is managed by core only.',
                },
                schema: [],
            },
            create(context) {
                const CACHE_METHODS = [
                    'invalidate',
                    'clear',
                    'set',
                    'delete',
                ];

                return {
                    MemberExpression(node) {
                        if (
                            node.object.name === 'cache' &&
                            node.property.type === 'Identifier' &&
                            CACHE_METHODS.includes(node.property.name)
                        ) {
                            context.report({
                                node,
                                messageId: 'cacheAccess',
                            });
                        }
                    },
                };
            },
        },
    },

    configs: {
        recommended: {
            plugins: ['nexxo-governance'],
            rules: {
                'nexxo-governance/no-internal-imports': 'error',
                'nexxo-governance/require-experimental-flag': 'warn',
                'nexxo-governance/no-graph-mutation': 'error',
                'nexxo-governance/no-cache-access': 'error',
            },
        },
    },
};
