import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
const globalFetch: typeof fetch | undefined = (globalThis as any).fetch;

export interface CacheEntry {
  key: string;
  outDir: string;
  files: string[];
  created: number;
}

export class DiskCache {
  dir: string;

  constructor(base: string) {
    this.dir = path.resolve(base, '.nexxo_cache');
  }

  async ensure() {
    await fs.mkdir(this.dir, { recursive: true });
  }

  async keyFromFiles(paths: string[]) {
    const hash = crypto.createHash('sha256');
    // include main files
    for (const p of paths.sort()) {
      try {
        const data = await fs.readFile(p);
        hash.update(data);
      } catch (e) {
        hash.update(p);
      }
    }
    // include config file if present
    try {
      const cfg = await fs.readFile('nexxo.config.json');
      hash.update(cfg);
    } catch (e) {
      // ignore
    }
    // include package.json to capture dependency changes
    try {
      const pkg = await fs.readFile('package.json');
      hash.update(pkg);
    } catch (e) { }
    // include plugin files
    try {
      const pluginDir = './src/plugins';
      const items = await fs.readdir(pluginDir);
      for (const it of items.sort()) {
        try {
          const p = path.join(pluginDir, it);
          const d = await fs.readFile(p);
          hash.update(d);
        } catch (e) { }
      }
    } catch (e) { }
    // include normalized env keys that affect builds
    const relevant = [process.env.NODE_ENV || '', process.env.TOOL_VERSION || ''];
    hash.update(relevant.join('|'));

    return hash.digest('hex');
  }

  async has(key: string) {
    const p = path.join(this.dir, key + '.json');
    try {
      await fs.access(p);
      return true;
    } catch (e) {
      // try remote cache lookup
      const remote = process.env.REMOTE_CACHE_URL;
      if (remote && globalFetch) {
        try {
          const headers: any = {};
          if (process.env.REMOTE_CACHE_TOKEN) headers['authorization'] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
          const res = await globalFetch(`${remote}/manifest/${key}`, { headers });
          return res.status === 200;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    const p = path.join(this.dir, key + '.json');
    try {
      const raw = await fs.readFile(p, 'utf-8');
      return JSON.parse(raw) as CacheEntry;
    } catch (e) {
      // try remote fetch
      const remote = process.env.REMOTE_CACHE_URL;
      if (!remote || !globalFetch) return null;
      try {
        const headers: any = {};
        if (process.env.REMOTE_CACHE_TOKEN) headers['authorization'] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
        const res = await globalFetch(`${remote}/manifest/${key}`, { headers });
        if (res.status !== 200) return null;
        const data = await res.text();
        const entry = JSON.parse(data) as CacheEntry;
        // attempt to fetch files
        await this.put(entry);
        await this.putFiles(key, entry.files);
        return entry;
      } catch (e) {
        return null;
      }
    }
  }

  async put(entry: CacheEntry) {
    const p = path.join(this.dir, entry.key + '.json');
    await fs.writeFile(p, JSON.stringify(entry, null, 2));
  }

  // store output files into cache directory under the key
  async putFiles(key: string, files: string[]) {
    const keyDir = path.join(this.dir, key);
    await fs.mkdir(keyDir, { recursive: true });
    const outDir = path.join(keyDir, 'files');
    await fs.mkdir(outDir, { recursive: true });
    for (const f of files) {
      try {
        const data = await fs.readFile(f);
        const rel = path.basename(f);
        await fs.writeFile(path.join(outDir, rel), data);
        // push to remote cache if configured
        const remote = process.env.REMOTE_CACHE_URL;
        if (remote && globalFetch) {
          try {
            const headers: any = {};
            if (process.env.REMOTE_CACHE_TOKEN) headers['authorization'] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
            await globalFetch(`${remote}/file/${key}/${rel}`, { method: 'PUT', body: data, headers });
          } catch (e) { }
        }
      } catch (e) {
        // ignore missing files
      }
    }
  }

  // restore cached files into target outDir
  async restoreFiles(key: string, targetOutDir: string) {
    const keyDir = path.join(this.dir, key, 'files');
    try {
      const items = await fs.readdir(keyDir);
      await fs.mkdir(targetOutDir, { recursive: true });
      for (const name of items) {
        const src = path.join(keyDir, name);
        const dest = path.join(targetOutDir, name);
        const data = await fs.readFile(src);
        await fs.writeFile(dest, data);
      }
      return true;
    } catch (e) {
      // if remote configured, attempt to download
      const remote = process.env.REMOTE_CACHE_URL;
      if (!remote || !globalFetch) return false;
      try {
        await fs.mkdir(targetOutDir, { recursive: true });
        const headers: any = {};
        if (process.env.REMOTE_CACHE_TOKEN) headers['authorization'] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
        const manifestRes = await globalFetch(`${remote}/manifest/${key}`, { headers });
        if (manifestRes.status !== 200) return false;
        const entry = await manifestRes.json();
        for (const f of entry.files) {
          const name = path.basename(f);
          const fileRes = await globalFetch(`${remote}/file/${key}/${name}`, { headers });
          if (fileRes.status === 200) {
            const buf = await fileRes.arrayBuffer();
            await fs.writeFile(path.join(targetOutDir, name), Buffer.from(buf));
          }
        }
        return true;
      } catch (ee) {
        return false;
      }
    }
  }
}
