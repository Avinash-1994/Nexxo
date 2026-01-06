/**
 * HMR Classification Engine
 * 
 * Intelligently classifies file changes to determine the optimal HMR strategy.
 * More reliable than Vite for complex apps by using graph-diff analysis.
 */

export enum HMRLevel {
    /** Safe updates: CSS, static assets - no state loss */
    HMR_SAFE = 'HMR_SAFE',

    /** Partial updates: Component changes - preserve app state */
    HMR_PARTIAL = 'HMR_PARTIAL',

    /** Full reload: Config, entry changes - complete refresh needed */
    HMR_FULL_RELOAD = 'HMR_FULL_RELOAD'
}

export interface HMRDecision {
    level: HMRLevel;
    reason: string;
    affectedModules: string[];
    graphChanges: GraphChange[];
    suggestedOptimizations?: string[];
}

export interface GraphChange {
    type: 'added' | 'removed' | 'modified';
    module: string;
    dependencies?: string[];
}

export interface FileChange {
    path: string;
    type: 'created' | 'updated' | 'deleted';
    content?: string;
}

export class HMRClassifier {
    private configFiles = new Set([
        'urja.config.js',
        'urja.config.ts',
        'package.json',
        'tsconfig.json',
        'vite.config.js',
        'vite.config.ts'
    ]);

    private entryPatterns = [
        /^src\/main\.(js|ts|jsx|tsx)$/,
        /^src\/index\.(js|ts|jsx|tsx)$/,
        /^index\.html$/
    ];

    /**
     * Classify a file change and determine HMR strategy
     */
    classify(change: FileChange, dependencyGraph?: Map<string, Set<string>>): HMRDecision {
        const { path, type } = change;

        // 1. Check if it's a config file
        if (this.isConfigFile(path)) {
            return {
                level: HMRLevel.HMR_FULL_RELOAD,
                reason: 'Configuration file changed - full reload required',
                affectedModules: ['*'],
                graphChanges: [{ type: 'modified', module: path }],
                suggestedOptimizations: [
                    'Consider extracting frequently changed config to separate files',
                    'Use environment variables for dynamic configuration'
                ]
            };
        }

        // 2. Check if it's an entry point
        if (this.isEntryPoint(path)) {
            return {
                level: HMRLevel.HMR_FULL_RELOAD,
                reason: 'Entry point changed - full reload required',
                affectedModules: ['*'],
                graphChanges: [{ type: 'modified', module: path }]
            };
        }

        // 3. Check if it's a safe update (CSS, assets)
        if (this.isSafeUpdate(path)) {
            return {
                level: HMRLevel.HMR_SAFE,
                reason: this.getSafeUpdateReason(path),
                affectedModules: [path],
                graphChanges: [{ type: type === 'deleted' ? 'removed' : 'modified', module: path }]
            };
        }

        // 4. Analyze dependency graph for partial updates
        if (dependencyGraph) {
            const graphAnalysis = this.analyzeGraphImpact(path, type, dependencyGraph);

            // Check circular dependencies first (higher priority)
            if (graphAnalysis.hasCircularDeps) {
                return {
                    level: HMRLevel.HMR_FULL_RELOAD,
                    reason: 'Circular dependency detected - full reload safer',
                    affectedModules: graphAnalysis.affectedModules,
                    graphChanges: graphAnalysis.changes,
                    suggestedOptimizations: [
                        'Break circular dependencies for better HMR',
                        ...graphAnalysis.optimizations
                    ]
                };
            }

            if (graphAnalysis.isIsolated) {
                return {
                    level: HMRLevel.HMR_PARTIAL,
                    reason: 'Component change with isolated impact',
                    affectedModules: graphAnalysis.affectedModules,
                    graphChanges: graphAnalysis.changes,
                    suggestedOptimizations: graphAnalysis.optimizations
                };
            } else {
                // Non-isolated change (affects many modules)
                return {
                    level: HMRLevel.HMR_PARTIAL,
                    reason: `Component change affects ${graphAnalysis.affectedModules.length} module(s)`,
                    affectedModules: graphAnalysis.affectedModules,
                    graphChanges: graphAnalysis.changes,
                    suggestedOptimizations: graphAnalysis.optimizations
                };
            }
        }

        // 5. Default to partial update for code changes
        return {
            level: HMRLevel.HMR_PARTIAL,
            reason: 'Code change detected - attempting partial HMR',
            affectedModules: [path],
            graphChanges: [{ type: type === 'deleted' ? 'removed' : 'modified', module: path }]
        };
    }

    /**
     * Classify multiple changes (batch processing)
     */
    classifyBatch(changes: FileChange[], dependencyGraph?: Map<string, Set<string>>): HMRDecision {
        // If any change requires full reload, entire batch requires full reload
        const decisions = changes.map(change => this.classify(change, dependencyGraph));

        const hasFullReload = decisions.some(d => d.level === HMRLevel.HMR_FULL_RELOAD);
        if (hasFullReload) {
            const fullReloadDecisions = decisions.filter(d => d.level === HMRLevel.HMR_FULL_RELOAD);
            return {
                level: HMRLevel.HMR_FULL_RELOAD,
                reason: `Multiple changes require full reload: ${fullReloadDecisions.map(d => d.reason).join(', ')}`,
                affectedModules: ['*'],
                graphChanges: decisions.flatMap(d => d.graphChanges)
            };
        }

        const hasPartial = decisions.some(d => d.level === HMRLevel.HMR_PARTIAL);
        if (hasPartial) {
            return {
                level: HMRLevel.HMR_PARTIAL,
                reason: `${decisions.length} file(s) changed - partial HMR`,
                affectedModules: Array.from(new Set(decisions.flatMap(d => d.affectedModules))),
                graphChanges: decisions.flatMap(d => d.graphChanges)
            };
        }

        // All safe updates
        return {
            level: HMRLevel.HMR_SAFE,
            reason: `${decisions.length} safe update(s) - CSS/assets only`,
            affectedModules: Array.from(new Set(decisions.flatMap(d => d.affectedModules))),
            graphChanges: decisions.flatMap(d => d.graphChanges)
        };
    }

    private isConfigFile(path: string): boolean {
        const basename = path.split('/').pop() || '';
        return this.configFiles.has(basename);
    }

    private isEntryPoint(path: string): boolean {
        return this.entryPatterns.some(pattern => pattern.test(path));
    }

    private isSafeUpdate(path: string): boolean {
        const safeExtensions = ['.css', '.scss', '.sass', '.less', '.styl', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
        return safeExtensions.some(ext => path.endsWith(ext));
    }

    private getSafeUpdateReason(path: string): string {
        if (path.match(/\.(css|scss|sass|less|styl)$/)) {
            return 'Stylesheet change - hot reload without state loss';
        }
        if (path.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
            return 'Image asset change - hot reload';
        }
        if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
            return 'Font asset change - hot reload';
        }
        return 'Static asset change - hot reload';
    }

    private analyzeGraphImpact(
        path: string,
        changeType: 'created' | 'updated' | 'deleted',
        dependencyGraph: Map<string, Set<string>>
    ): {
        isIsolated: boolean;
        hasCircularDeps: boolean;
        affectedModules: string[];
        changes: GraphChange[];
        optimizations: string[];
    } {
        const affectedModules: string[] = [path];
        const changes: GraphChange[] = [];
        const optimizations: string[] = [];

        // Find all modules that depend on this file
        const dependents = this.findDependents(path, dependencyGraph);
        affectedModules.push(...dependents);

        // Check for circular dependencies
        const hasCircularDeps = this.hasCircularDependency(path, dependencyGraph);

        // Determine if change is isolated (affects <5 modules)
        const isIsolated = affectedModules.length < 5;

        // Generate graph changes
        if (changeType === 'deleted') {
            changes.push({ type: 'removed', module: path });
        } else {
            changes.push({
                type: changeType === 'created' ? 'added' : 'modified',
                module: path,
                dependencies: Array.from(dependencyGraph.get(path) || [])
            });
        }

        // Suggest optimizations
        if (affectedModules.length > 10) {
            optimizations.push('Consider code splitting - this module affects many others');
        }
        if (hasCircularDeps) {
            optimizations.push('Break circular dependencies for better HMR performance');
        }

        return {
            isIsolated,
            hasCircularDeps,
            affectedModules,
            changes,
            optimizations
        };
    }

    private findDependents(module: string, graph: Map<string, Set<string>>): string[] {
        const dependents: string[] = [];

        for (const [mod, deps] of graph.entries()) {
            if (deps.has(module)) {
                dependents.push(mod);
            }
        }

        return dependents;
    }

    private hasCircularDependency(
        module: string,
        graph: Map<string, Set<string>>,
        visited = new Set<string>(),
        stack = new Set<string>()
    ): boolean {
        if (stack.has(module)) return true;
        if (visited.has(module)) return false;

        visited.add(module);
        stack.add(module);

        const deps = graph.get(module) || new Set();
        for (const dep of deps) {
            if (this.hasCircularDependency(dep, graph, visited, stack)) {
                return true;
            }
        }

        stack.delete(module);
        return false;
    }
}

// Export singleton instance
export const hmrClassifier = new HMRClassifier();
