#!/usr/bin/env node
import http from 'http'
import fs from 'fs/promises'
import path from 'path'

const PORT = process.env.UPLOAD_RECEIVER_PORT || 5400
const UP_DIR = path.resolve(process.cwd(), 'marketplace', 'uploads')
await fs.mkdir(UP_DIR, { recursive: true })

const srv = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    const name = `upload-${Date.now()}.gz`
    const p = path.join(UP_DIR, name)
    const ws = (await import('fs')).createWriteStream(p)
    req.pipe(ws)
    req.on('end', async () => { res.writeHead(200); res.end(JSON.stringify({ ok: true, saved: name })) })
  req.on('end', async () => { console.log('received upload saved as', name) })
    req.on('error', (e) => { res.writeHead(500); res.end(String(e)) })
    return
  }
  res.writeHead(404); res.end('not found')
})

srv.listen(PORT, () => console.log('upload receiver listening on', PORT))
