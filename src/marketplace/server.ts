
/**
 * Nexxo Marketplace tRPC Server
 * Implementation: tRPC Router for Publish/Search/Install
 * Day 10: Marketplace MVP Lock
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { marketplaceDB } from './db.js';
import { PluginSigner } from '../plugins/signer.js';

// Context (empty for local mvp)
export const createContext = () => ({});
type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
    /**
     * Search for plugins
     */
    search: t.procedure
        .input(z.string())
        .query(({ input }) => {
            const results = marketplaceDB.search(input);
            return results.map(r => ({
                name: r.name,
                version: r.version,
                description: r.description,
                author: r.author,
                verified: true // In our DB, only signed stuff gets in
            }));
        }),

    /**
     * Publish a plugin
     * Verifies signature and hash before accepting.
     */
    publish: t.procedure
        .input(z.object({
            manifest: z.object({
                name: z.string(),
                version: z.string(),
                author: z.string(),
                description: z.string(),
                hash: z.string(),
                signature: z.string(),
                publicKey: z.string(),
                permissions: z.object({
                    network: z.boolean().optional(),
                    fs: z.boolean().optional()
                })
            }),
            wasmBase64: z.string() // WASM binary as Base64 for transport
        }))
        .mutation(async ({ input }) => {
            const { manifest, wasmBase64 } = input;
            const wasmBytes = Buffer.from(wasmBase64, 'base64');

            // 1. Verify Hash Integrity
            const calcHash = await PluginSigner.calculateHash(wasmBytes);
            if (calcHash !== manifest.hash) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Hash mismatch. Manifest: ${manifest.hash}, Calc: ${calcHash}`
                });
            }

            // 2. Verify Signature
            const publicKey = await PluginSigner.importKey(manifest.publicKey, 'public');
            const isValid = await PluginSigner.verify(wasmBytes, manifest.signature, publicKey);

            if (!isValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid Signature. Plugin rejected.'
                });
            }

            // 3. Save to DB
            marketplaceDB.publish({
                ...manifest,
                public_key: manifest.publicKey,
                permissions_json: JSON.stringify(manifest.permissions),
                created_at: new Date().toISOString()
            });

            return { success: true, message: `Published ${manifest.name}@${manifest.version}` };
        }),

    /**
     * Install (Get) a plugin
     */
    install: t.procedure
        .input(z.object({
            name: z.string(),
            version: z.string().optional()
        }))
        .query(({ input }) => {
            const plugin = marketplaceDB.get(input.name, input.version);
            if (!plugin) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Plugin ${input.name} not found`
                });
            }
            return plugin;
        })
});

export type AppRouter = typeof appRouter;
