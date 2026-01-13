
/**
 * Nexxo v2.0 Zero-Trust Signing System
 * Implementation: ECDSA P-256 via WebCrypto (Node.js)
 * Day 9: WebCrypto Signing System Lock
 */

import { webcrypto } from 'crypto';
const { subtle } = webcrypto;

export interface PluginManifest {
    name: string;
    version: string;
    author: string;
    description: string;
    hash: string; // SHA-256 hash of the WASM binary
    signature: string; // Base64 signature of the hash
    publicKey: string; // Base64 public key (PEM or raw)
    permissions: {
        network?: boolean;
        fs?: boolean;
    };
}

export class PluginSigner {

    /**
     * Generate a new ECDSA P-256 Key Pair
     */
    static async generateKeyPair(): Promise<CryptoKeyPair> {
        return await subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            true,
            ["sign", "verify"]
        );
    }

    /**
     * Export Key to PEM/Base64 format for storage
     */
    static async exportKey(key: CryptoKey): Promise<string> {
        const exported = await subtle.exportKey(key.type === 'public' ? 'spki' : 'pkcs8', key);
        return Buffer.from(exported).toString('base64');
    }

    /**
     * Import Key from PEM/Base64 format
     */
    static async importKey(base64Key: string, type: 'public' | 'private'): Promise<CryptoKey> {
        const buffer = Buffer.from(base64Key, 'base64');
        return await subtle.importKey(
            type === 'public' ? 'spki' : 'pkcs8',
            buffer,
            {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            true,
            type === 'public' ? ['verify'] : ['sign']
        );
    }

    /**
     * Calculate SHA-256 Hash of the binary
     */
    static async calculateHash(data: Buffer): Promise<string> {
        const hashBuffer = await subtle.digest('SHA-256', data);
        return Buffer.from(hashBuffer).toString('hex');
    }

    /**
     * Sign a plugin binary
     * Returns the Base64 signature
     */
    static async sign(data: Buffer, privateKey: CryptoKey): Promise<string> {
        const hash = await this.calculateHash(data); // Sign the HASH, not the binary (efficiency)
        // Actually, ECDSA typically signs the data digest. 
        // Subtle.sign will hash it internally if we specify hash algorithm in params, 
        // OR we can sign the raw bytes. Signing raw bytes is standard for 'sign'.
        // BUT for huge files, better to hash first? 
        // WebCrypto ECDSA params usually require hash specification: { name: "ECDSA", hash: "SHA-256" }
        // So we pass the DATA, it hashes and signs.

        const sig = await subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            privateKey,
            data
        );
        return Buffer.from(sig).toString('base64');
    }

    /**
     * Verify a plugin signature
     */
    static async verify(data: Buffer, signatureBase64: string, publicKey: CryptoKey): Promise<boolean> {
        const sigBuffer = Buffer.from(signatureBase64, 'base64');
        return await subtle.verify(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            publicKey,
            sigBuffer,
            data
        );
    }

    /**
     * Create a complete Signed Manifest
     */
    static async createManifest(
        meta: Omit<PluginManifest, 'hash' | 'signature' | 'publicKey'>,
        wasmBytes: Buffer,
        keyPair: CryptoKeyPair
    ): Promise<PluginManifest> {
        const hash = await this.calculateHash(wasmBytes);
        const signature = await this.sign(wasmBytes, keyPair.privateKey);
        const publicKey = await this.exportKey(keyPair.publicKey);

        return {
            ...meta,
            hash,
            signature,
            publicKey,
            permissions: meta.permissions || {}
        };
    }

    /**
     * Verify integrity of a Plugin + Manifest
     */
    static async verifyManifest(manifest: PluginManifest, wasmBytes: Buffer): Promise<boolean> {
        // 1. Check Hash
        const calcHash = await this.calculateHash(wasmBytes);
        if (calcHash !== manifest.hash) {
            console.error(`Hash mismatch: Expected ${manifest.hash}, got ${calcHash}`);
            return false;
        }

        // 2. Check Signature
        try {
            const publicKey = await this.importKey(manifest.publicKey, 'public');
            const valid = await this.verify(wasmBytes, manifest.signature, publicKey);
            if (!valid) {
                console.error('Signature verification failed');
            }
            return valid;
        } catch (e) {
            console.error('Key import failed:', e);
            return false;
        }
    }
}
