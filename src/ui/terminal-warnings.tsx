import React, { useState, useEffect } from 'react';
import { Box, Text, Newline } from 'ink';
import Spinner from 'ink-spinner';
import chalk from 'chalk';
import type { Warning } from './types.js';

export type { Warning };

interface TerminalWarningsProps {
    warnings: Warning[];
    isBuilding?: boolean;
    buildStage?: string;
}

const severityConfig = {
    critical: { icon: '🔴', color: chalk.red, label: 'CRITICAL' },
    warning: { icon: '⚠️ ', color: chalk.yellow, label: 'WARNING' },
    info: { icon: 'ℹ️ ', color: chalk.blue, label: 'INFO' }
};

export const TerminalWarnings: React.FC<TerminalWarningsProps> = ({
    warnings,
    isBuilding = false,
    buildStage = 'Building'
}) => {
    const [displayedWarnings, setDisplayedWarnings] = useState<Warning[]>([]);

    useEffect(() => {
        setDisplayedWarnings(warnings);
    }, [warnings]);

    const criticalCount = displayedWarnings.filter(w => w.severity === 'critical').length;
    const warningCount = displayedWarnings.filter(w => w.severity === 'warning').length;
    const infoCount = displayedWarnings.filter(w => w.severity === 'info').length;

    return (
        <Box flexDirection="column" paddingX={1}>
            {/* Header */}
            <Box marginBottom={1}>
                <Text bold color="cyan">
                    ⚡ Nexxo Build Diagnostics
                </Text>
            </Box>

            {/* Build Status */}
            {isBuilding && (
                <Box marginBottom={1}>
                    <Text color="green">
                        {/* @ts-ignore - Ink Spinner type compatibility */}
                        <Spinner type="dots" /> {buildStage}...
                    </Text>
                </Box>
            )}

            {/* Summary */}
            {displayedWarnings.length > 0 && (
                <Box marginBottom={1}>
                    <Text dimColor>
                        Found {displayedWarnings.length} issue{displayedWarnings.length !== 1 ? 's' : ''}:
                    </Text>
                    {criticalCount > 0 && (
                        <Text color="red"> {criticalCount} critical</Text>
                    )}
                    {warningCount > 0 && (
                        <Text color="yellow"> {warningCount} warning{warningCount !== 1 ? 's' : ''}</Text>
                    )}
                    {infoCount > 0 && (
                        <Text color="blue"> {infoCount} info</Text>
                    )}
                </Box>
            )}

            {/* Warnings List */}
            {displayedWarnings.map((warning, index) => {
                const config = severityConfig[warning.severity];
                const colorName = warning.severity === 'critical' ? 'red' :
                    warning.severity === 'warning' ? 'yellow' : 'blue';

                return (
                    <Box key={warning.id || index} flexDirection="column" marginBottom={1}>
                        {/* Warning Header */}
                        <Box>
                            <Text>{config.icon} </Text>
                            <Text bold color={colorName}>
                                {config.label}
                            </Text>
                            {warning.category && (
                                <Text dimColor> [{warning.category}]</Text>
                            )}
                        </Box>

                        {/* Message */}
                        <Box paddingLeft={3}>
                            <Text>{warning.message}</Text>
                        </Box>

                        {/* File Location */}
                        {warning.file && (
                            <Box paddingLeft={3}>
                                <Text dimColor>
                                    at {warning.file}
                                    {warning.line && `:${warning.line}`}
                                </Text>
                            </Box>
                        )}

                        {/* Fix Suggestion */}
                        {warning.fix && (
                            <Box paddingLeft={3} marginTop={0}>
                                <Text color="green">💡 Fix: </Text>
                                <Text>{warning.fix}</Text>
                            </Box>
                        )}
                    </Box>
                );
            })}

            {/* Empty State */}
            {!isBuilding && displayedWarnings.length === 0 && (
                <Box>
                    <Text color="green">✓ No issues found</Text>
                </Box>
            )}
        </Box>
    );
};

export default TerminalWarnings;
