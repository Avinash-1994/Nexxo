import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

/**
 * Auto-Fix Engine
 * Safe AST transforms for common build issues
 */

export interface FixResult {
    success: boolean;
    code?: string;
    error?: string;
    changes: FixChange[];
}

export interface FixChange {
    type: 'remove-unused-import' | 'add-dynamic-import' | 'add-aria' | 'remove-unused-export';
    location: { line: number; column: number };
    description: string;
}

export class AutoFixEngine {
    /**
     * Remove unused imports from code
     */
    removeUnusedImports(code: string, unusedImports: string[]): FixResult {
        const changes: FixChange[] = [];

        try {
            const lines = code.split('\n');
            const newLines: string[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let shouldRemove = false;

                // Check if this line contains an unused import
                for (const unusedImport of unusedImports) {
                    const importRegex = new RegExp(`import\\s+.*${unusedImport}.*from`, 'g');
                    if (importRegex.test(line)) {
                        shouldRemove = true;
                        changes.push({
                            type: 'remove-unused-import',
                            location: { line: i + 1, column: 0 },
                            description: `Removed unused import: ${unusedImport}`
                        });
                        break;
                    }
                }

                if (!shouldRemove) {
                    newLines.push(line);
                }
            }

            return {
                success: true,
                code: newLines.join('\n'),
                changes
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                changes: []
            };
        }
    }

    /**
     * Add dynamic imports for large dependencies
     */
    addDynamicImport(code: string, moduleName: string, threshold: number = 100 * 1024): FixResult {
        const changes: FixChange[] = [];

        try {
            // Replace static import with dynamic import
            const importRegex = new RegExp(`import\\s+(.+)\\s+from\\s+['"]${moduleName}['"]`, 'g');

            let newCode = code;
            let match;

            while ((match = importRegex.exec(code)) !== null) {
                const importedNames = match[1];
                const lineNumber = code.substring(0, match.index).split('\n').length;

                // Replace with dynamic import
                const dynamicImport = `const ${importedNames} = await import('${moduleName}')`;
                newCode = newCode.replace(match[0], dynamicImport);

                changes.push({
                    type: 'add-dynamic-import',
                    location: { line: lineNumber, column: match.index },
                    description: `Converted to dynamic import: ${moduleName}`
                });
            }

            return {
                success: true,
                code: newCode,
                changes
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                changes: []
            };
        }
    }

    /**
     * Add ARIA attributes to improve accessibility
     */
    addAriaAttributes(html: string): FixResult {
        const changes: FixChange[] = [];

        try {
            let newHtml = html;

            // Add aria-label to buttons without text
            const buttonRegex = /<button([^>]*)>(\s*)<\/button>/g;
            newHtml = newHtml.replace(buttonRegex, (match, attrs, content) => {
                if (!attrs.includes('aria-label')) {
                    changes.push({
                        type: 'add-aria',
                        location: { line: 0, column: 0 },
                        description: 'Added aria-label to button'
                    });
                    return `<button${attrs} aria-label="Button">${content}</button>`;
                }
                return match;
            });

            // Add alt to images
            const imgRegex = /<img([^>]*)>/g;
            newHtml = newHtml.replace(imgRegex, (match, attrs) => {
                if (!attrs.includes('alt=')) {
                    changes.push({
                        type: 'add-aria',
                        location: { line: 0, column: 0 },
                        description: 'Added alt attribute to image'
                    });
                    return `<img${attrs} alt="Image">`;
                }
                return match;
            });

            return {
                success: true,
                code: newHtml,
                changes
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                changes: []
            };
        }
    }

    /**
     * Remove unused exports
     */
    removeUnusedExports(code: string, unusedExports: string[]): FixResult {
        const changes: FixChange[] = [];

        try {
            const lines = code.split('\n');
            const newLines: string[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let shouldRemove = false;

                // Check if this line contains an unused export
                for (const unusedExport of unusedExports) {
                    const exportRegex = new RegExp(`export\\s+(const|function|class)\\s+${unusedExport}`, 'g');
                    if (exportRegex.test(line)) {
                        shouldRemove = true;
                        changes.push({
                            type: 'remove-unused-export',
                            location: { line: i + 1, column: 0 },
                            description: `Removed unused export: ${unusedExport}`
                        });
                        break;
                    }
                }

                if (!shouldRemove) {
                    newLines.push(line);
                }
            }

            return {
                success: true,
                code: newLines.join('\n'),
                changes
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                changes: []
            };
        }
    }

    /**
     * Validate that a transform is safe
     */
    validateTransform(originalCode: string, transformedCode: string): boolean {
        try {
            // Try to parse both versions
            acorn.parse(originalCode, { sourceType: 'module', ecmaVersion: 'latest' });
            acorn.parse(transformedCode, { sourceType: 'module', ecmaVersion: 'latest' });

            // Both parse successfully, transform is safe
            return true;
        } catch {
            // Parsing failed, transform is unsafe
            return false;
        }
    }

    /**
     * Generate diff preview
     */
    generateDiff(original: string, modified: string): string {
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');
        const diff: string[] = [];

        const maxLines = Math.max(originalLines.length, modifiedLines.length);

        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const modLine = modifiedLines[i] || '';

            if (origLine !== modLine) {
                if (origLine) diff.push(`- ${origLine}`);
                if (modLine) diff.push(`+ ${modLine}`);
            }
        }

        return diff.join('\n');
    }

    /**
     * Apply batch fixes
     */
    applyBatchFixes(code: string, fixes: Array<{ type: string; data: any }>): FixResult {
        let currentCode = code;
        const allChanges: FixChange[] = [];

        for (const fix of fixes) {
            let result: FixResult;

            switch (fix.type) {
                case 'remove-unused-imports':
                    result = this.removeUnusedImports(currentCode, fix.data.imports);
                    break;
                case 'add-dynamic-import':
                    result = this.addDynamicImport(currentCode, fix.data.module);
                    break;
                case 'add-aria':
                    result = this.addAriaAttributes(currentCode);
                    break;
                case 'remove-unused-exports':
                    result = this.removeUnusedExports(currentCode, fix.data.exports);
                    break;
                default:
                    continue;
            }

            if (result.success && result.code) {
                // Validate before applying
                if (this.validateTransform(currentCode, result.code)) {
                    currentCode = result.code;
                    allChanges.push(...result.changes);
                }
            }
        }

        return {
            success: true,
            code: currentCode,
            changes: allChanges
        };
    }

    /**
     * Track fix success rate
     */
    calculateSuccessRate(results: FixResult[]): number {
        const successful = results.filter(r => r.success).length;
        return results.length > 0 ? (successful / results.length) * 100 : 0;
    }
}
