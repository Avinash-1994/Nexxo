import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const STORAGE = path.resolve(process.cwd(), '.remote_cache');
await fs.mkdir(STORAGE, { recursive: true });

const server = http.createServer(async (req, res) => {
  // simple bearer token auth if REMOTE_CACHE_TOKEN is set
  const token = process.env.REMOTE_CACHE_TOKEN;
  if (token) {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== token) {
      res.writeHead(401);
      res.end('unauthorized');
      return;
    }
  }
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  try {
    if (req.method === 'GET' && parts[0] === 'manifest' && parts[1]) {
      const key = parts[1];
      const file = path.join(STORAGE, key + '.json');
      const data = await fs.readFile(file, 'utf-8');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(data);
      return;
    }
    if (req.method === 'GET' && parts[0] === 'file' && parts[1] && parts[2]) {
      const key = parts[1];
      const name = parts.slice(2).join('/');
      const file = path.join(STORAGE, key, 'files', name);
      const data = await fs.readFile(file);
      res.writeHead(200);
      res.end(data);
      return;
    }
    if (req.method === 'PUT' && parts[0] === 'manifest' && parts[1]) {
      const key = parts[1];
      const file = path.join(STORAGE, key + '.json');
      const body = await new Promise((r) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => r(Buffer.concat(chunks).toString()));
      });
      await fs.mkdir(path.join(STORAGE, key, 'files'), { recursive: true });
      await fs.writeFile(file, body);
      res.writeHead(200);
      res.end('ok');
      return;
    }
    if (req.method === 'PUT' && parts[0] === 'file' && parts[1] && parts[2]) {
      const key = parts[1];
      const name = parts.slice(2).join('/');
      const buf = await new Promise((r) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => r(Buffer.concat(chunks)));
      });
      const dest = path.join(STORAGE, key, 'files', name);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, buf);
      res.writeHead(200);
      res.end('ok');
      return;
    }
    res.writeHead(404);
    res.end('not found');
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

const port = process.env.REMOTE_CACHE_PORT || 4999;
server.listen(port, () => console.log('Remote cache server listening on', port));
