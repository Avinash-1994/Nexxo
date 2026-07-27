/**
 * @lunx/remote-cache
 *
 * Phase 1.12 — Remote Cache Provider
 *
 * Interfaces with S3 or Lunx Cloud to fetch/store build artifacts.
 * This is designed to reduce CI times by re-using task results across builds.
 *
 * Providers:
 *  - s3: AWS S3 compatible (requires bucket, region, token/credentials)
 *  - lunx-cloud: Lunx Cloud managed cache (requires token)
 *
 * Options:
 *  - readOnly: if true, prevents uploads to the remote cache
 */

import crypto from 'crypto';

export interface RemoteCacheOptions {
  provider: 's3' | 'lunx-cloud' | false;
  bucket?: string;
  token?: string;
  region?: string;
  endpoint?: string;
  baseUrl?: string;
  readOnly?: boolean;
}

export interface RemoteCacheProvider {
  /**
   * Fetch an artifact from the remote cache
   * @param key Cache key (e.g., hash of task inputs)
   * @returns Buffer containing the artifact, or null if not found/error
   */
  get(key: string): Promise<Buffer | null>;

  /**
   * Store an artifact in the remote cache
   * @param key Cache key
   * @param data Artifact buffer
   * @returns true if successful, false otherwise
   */
  put(key: string, data: Buffer): Promise<boolean>;

  /**
   * Check if an artifact exists in the remote cache
   * @param key Cache key
   * @returns true if exists, false otherwise
   */
  has(key: string): Promise<boolean>;
}

export class S3Provider implements RemoteCacheProvider {
  constructor(private options: RemoteCacheOptions) {}

  async get(key: string): Promise<Buffer | null> {
    if (!this.options.bucket) return null;
    // Mock implementation for test/fixture purposes
    // In a real implementation, this would use the AWS SDK or fetch
    try {
      const url = this.getS3Url(key);
      const res = await fetch(url, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async put(key: string, data: Buffer): Promise<boolean> {
    if (this.options.readOnly || !this.options.bucket) return false;
    // Mock implementation
    try {
      const url = this.getS3Url(key);
      const res = await fetch(url, {
        method: 'PUT',
        body: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.options.bucket) return false;
    // Mock implementation
    try {
      const url = this.getS3Url(key);
      const res = await fetch(url, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  private getS3Url(key: string): string {
    const endpoint = this.options.endpoint || `https://${this.options.bucket}.s3.${this.options.region || 'us-east-1'}.amazonaws.com`;
    return `${endpoint}/${key}`;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.options.token) {
      headers['Authorization'] = `Bearer ${this.options.token}`;
    }
    return headers;
  }
}

export class LunxCloudProvider implements RemoteCacheProvider {
  constructor(private options: RemoteCacheOptions) {}

  async get(key: string): Promise<Buffer | null> {
    if (!this.options.token) return null;
    try {
      const url = this.getCloudUrl(key);
      const res = await fetch(url, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async put(key: string, data: Buffer): Promise<boolean> {
    if (this.options.readOnly || !this.options.token) return false;
    try {
      const url = this.getCloudUrl(key);
      const res = await fetch(url, {
        method: 'PUT',
        body: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.options.token) return false;
    try {
      const url = this.getCloudUrl(key);
      const res = await fetch(url, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  private getCloudUrl(key: string): string {
    const baseUrl = this.options.baseUrl || 'https://cache.lunx.dev/v1';
    return `${baseUrl}/artifacts/${key}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.options.token}`,
      'x-lunx-client': 'lunx-cli/1.0',
    };
  }
}

export class NullProvider implements RemoteCacheProvider {
  async get(key: string): Promise<Buffer | null> { return null; }
  async put(key: string, data: Buffer): Promise<boolean> { return false; }
  async has(key: string): Promise<boolean> { return false; }
}

export function createRemoteCache(options: RemoteCacheOptions | boolean): RemoteCacheProvider {
  if (options === false || (typeof options === 'object' && options.provider === false)) {
    return new NullProvider();
  }

  const opts = typeof options === 'boolean' ? { provider: 'lunx-cloud' as const } : options;

  switch (opts.provider) {
    case 's3':
      return new S3Provider(opts);
    case 'lunx-cloud':
      return new LunxCloudProvider(opts);
    default:
      return new NullProvider();
  }
}
