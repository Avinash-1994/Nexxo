import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const port = process.env.CONFIG_SERVER_PORT || 5175;
const cfgPath = path.resolve(process.cwd(), 'nextgen.build.json');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/config') {
    try {
      const data = await fs.readFile(cfgPath, 'utf-8');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(404);
      res.end('{}');
    }
    return;
  }
  if (req.method === 'POST' && req.url === '/api/config') {
    const body = await new Promise((r) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => r(Buffer.concat(chunks).toString()));
    });
    try {
      // basic validation
      JSON.parse(body);
      await fs.writeFile(cfgPath, body);
      res.writeHead(200);
      res.end('ok');
    } catch (e) {
      res.writeHead(400);
      res.end('invalid json');
    }
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

server.listen(port, () => console.log('Config server listening on', port));
