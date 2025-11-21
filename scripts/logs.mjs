#!/usr/bin/env node
import { URL } from 'url'
import http from 'http'
import https from 'https'
const base = process.env.MARKETPLACE_URL || 'http://localhost:4321'

;(async function main() {
  const [,, cmd] = process.argv
  if (cmd === 'list') {
    const u = new URL('/logs', base)
    const lib = u.protocol === 'https:' ? https : http
    lib.get(u, (res) => {
      let s = ''
      res.setEncoding('utf8')
      res.on('data', (d) => s += d)
      res.on('end', () => {
        try { const j = JSON.parse(s); console.log('logs:', j.logs || []) } catch (e) { console.log(s) }
      })
    }).on('error', (e) => { console.error(e); process.exit(1) })
  } else if (cmd === 'download') {
    const name = process.argv[3]
    const out = process.argv[4]
    if (!name) { console.error('usage: logs.mjs download <name> [outFile]'); process.exit(2) }
    const u = new URL('/logs/download?name=' + encodeURIComponent(name), base)
    const lib = u.protocol === 'https:' ? https : http
    lib.get(u, (res) => {
      if (res.statusCode !== 200) { let s = ''; res.setEncoding('utf8'); res.on('data', d=>s+=d); res.on('end', ()=>{ console.error('error', s); process.exit(1) }); return }
      const chunks = []
      res.on('data', (c) => chunks.push(Buffer.from(c)))
      res.on('end', async () => {
        const buf = Buffer.concat(chunks)
        const fs = await import('fs/promises')
        if (out) { await fs.writeFile(out, buf); console.log('saved to', out) } else { process.stdout.write(buf) }
      })
    }).on('error', (e) => { console.error(e); process.exit(1) })
  } else {
    console.log('usage: logs.mjs <list|download>')
  }
})().catch((e) => { console.error(e); process.exit(1) })
