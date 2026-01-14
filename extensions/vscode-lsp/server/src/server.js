// JavaScript wrapper to ensure proper ESM export in CI
// This file is committed as .js and re-exports from the TypeScript source

import { NexxoLSPServer, CompletionItem, Diagnostic } from './server.ts';

export { NexxoLSPServer, CompletionItem, Diagnostic };
