#!/usr/bin/env node
// Simple CLI to query the local marketplace stub without external deps
import http from 'http'
import https from 'https'
import { URL } from 'url'

const [,, cmd] = process.argv
const base = process.env.MARKETPLACE_URL || 'http://localhost:4321'

function fetchJson(pathname) {
  return new Promise((resolve, reject) => {
    const u = new URL(pathname, base)
    const lib = u.protocol === 'https:' ? https : http
    lib.get(u, (res) => {
      let s = ''
      res.setEncoding('utf8')
      res.on('data', (d) => s += d)
      res.on('end', () => {
        try { resolve(JSON.parse(s)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function list() {
  const data = await fetchJson('/plugins')
  console.log('plugins:', data.plugins || [])
}

async function health() {
  const data = await fetchJson('/health')
  console.log('marketplace health:', data)
}

if (cmd === 'list') list().catch((e) => { console.error(e); process.exit(1) })
else health().catch((e) => { console.error(e); process.exit(1) })

// publish: node scripts/marketplace.mjs publish <id> <version> <plugin-file>
if (cmd === 'publish') {
  const id = process.argv[3]
  const version = process.argv[4]
  const file = process.argv[5]
  const token = process.env.MARKETPLACE_TOKEN || process.argv.includes('--token') ? process.argv[process.argv.indexOf('--token')+1] : null
  if (!id || !version || !file) { console.error('usage: publish <id> <version> <file> [--token <token>]'); process.exit(2) }
  const fs = await import('fs/promises')
  const body = JSON.stringify({ id, version, packageBase64: (await fs.readFile(file)).toString('base64') })
  const u = new URL('/publish', base)
  const lib = u.protocol === 'https:' ? (await import('https')).request : (await import('http')).request
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  if (token) headers.Authorization = `Bearer ${token}`
  const req = lib(u, { method: 'POST', headers }, (res) => {
    let s = ''
    res.setEncoding('utf8')
    res.on('data', (d) => s += d)
    res.on('end', () => console.log('publish result:', s))
  })
  req.on('error', (e) => { console.error(e); process.exit(1) })
  req.write(body)
  req.end()
}

// auth register: node scripts/marketplace.mjs register <publisherId>
if (cmd === 'register') {
  const publisherId = process.argv[3]
  if (!publisherId) { console.error('usage: register <publisherId>'); process.exit(2) }
  const u = new URL('/auth/register', base)
  const body = JSON.stringify({ publisherId })
  const lib = u.protocol === 'https:' ? (await import('https')).request : (await import('http')).request
  const req = lib(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
    let s = ''
    res.setEncoding('utf8')
    res.on('data', (d) => s += d)
    res.on('end', () => {
      try {
        const j = JSON.parse(s)
        console.log('register result: token=', j.token)
        console.log('assigned keyId:', j.keyId)
        console.log('WARNING: this private key is available for one-time download only. Save it securely and do not commit it to your repo.')
      } catch (e) {
        console.log('register result:', s)
      }
    })
  })
  req.on('error', (e) => { console.error(e); process.exit(1) })
  req.write(body)
  req.end()
}

// get-key: node scripts/marketplace.mjs get-key <token> [outFile]
if (cmd === 'get-key') {
  const token = process.argv[3] || process.env.MARKETPLACE_TOKEN
  const out = process.argv[4]
  if (!token) { console.error('usage: get-key <token> [outFile]'); process.exit(2) }
  const u = new URL('/auth/key', base)
  const lib = u.protocol === 'https:' ? (await import('https')).get : (await import('http')).get
  const opts = { headers: { Authorization: `Bearer ${token}` } }
  lib(u, opts, (res) => {
    if (res.statusCode !== 200) {
      let s = ''
      res.setEncoding('utf8')
      res.on('data', (d) => s += d)
      res.on('end', () => { console.error('error:', s); process.exit(1) })
      return
    }
    const chunks = []
    res.on('data', (c) => chunks.push(Buffer.from(c)))
    res.on('end', async () => {
      const buf = Buffer.concat(chunks)
      if (!out) console.warn('WARNING: you are fetching the private key without specifying an output file; it will be printed to stdout. Prefer `get-key <token> <outFile>` to save securely.')
      if (out) {
        await (await import('fs/promises')).writeFile(out, buf, { mode: 0o600 })
        console.log('private key fetched and saved to', out)
      } else {
        process.stdout.write(buf)
        console.log('')
      }
    })
  }).on('error', (e) => { console.error(e); process.exit(1) })
}

// install: node scripts/marketplace.mjs install <id> [version]
if (cmd === 'install') {
  const id = process.argv[3]
  const version = process.argv[4]
  if (!id) { console.error('usage: install <id> [version]'); process.exit(2) }
  fetchJson(`/plugins/${id}/download${version ? `?version=${version}` : ''}`).then((d) => {
    console.log('downloaded:', d.version)
  }).catch((e) => { console.error(e); process.exit(1) })
}

// rate: node scripts/marketplace.mjs rate <id> <score>
if (cmd === 'rate') {
  const id = process.argv[3]
  const score = process.argv[4]
  if (!id || !score) { console.error('usage: rate <id> <score>'); process.exit(2) }
  const body = JSON.stringify({ score })
  const u = new URL(`/plugins/${id}/rate`, base)
  const lib = u.protocol === 'https:' ? (await import('https')).request : (await import('http')).request
  const req = lib(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
    let s = ''
    res.setEncoding('utf8')
    res.on('data', (d) => s += d)
    res.on('end', () => console.log('rate result:', s))
  })
  req.on('error', (e) => { console.error(e); process.exit(1) })
  req.write(body)
  req.end()
}
