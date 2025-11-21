#!/usr/bin/env node
// Minimal marketplace server stub for local development
import http from 'http'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { info as logInfo, error as logError, forceRotate } from './logger.mjs'

const PORT = process.env.PORT || 4321
const dataFile = path.resolve(process.cwd(), 'marketplace.json')

async function readData() {
  try { return JSON.parse(await fs.readFile(dataFile, 'utf8')) } catch (e) { return { plugins: [] } }
}

async function writeData(d) { await fs.writeFile(dataFile, JSON.stringify(d, null, 2)) }

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let s = ''
    req.setEncoding('utf8')
    req.on('data', (c) => s += c)
    req.on('end', () => {
      try { resolve(JSON.parse(s || '{}')) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

async function handler(req, res) {
  // auth register
  if (req.url === '/auth/register' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req)
      const { publisherId } = body
      if (!publisherId) { res.writeHead(400); res.end('missing publisherId'); return }
      const authFile = path.resolve(process.cwd(), 'marketplace_auth.json')
      const auth = await fs.readFile(authFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ tokens: {} }))
      const token = crypto.randomBytes(24).toString('hex')
      auth.tokens[token] = { publisherId, createdAt: new Date().toISOString() }
      await fs.writeFile(authFile, JSON.stringify(auth, null, 2))
  // also generate an in-repo keypair for this publisher and add to truststore
  const keyId = `${publisherId}-${Date.now().toString(36)}`
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pub = publicKey.export({ type: 'pkcs1', format: 'pem' })
  const priv = privateKey.export({ type: 'pkcs1', format: 'pem' })
  const keysDir = path.resolve(process.cwd(), 'config', 'plugin_keys')
  await fs.mkdir(keysDir, { recursive: true })
  const pubPath = path.join(keysDir, keyId + '.pem')
  const privPath = path.join(keysDir, keyId + '.priv.pem')
  await fs.writeFile(pubPath, pub)
  await fs.writeFile(privPath, priv, { mode: 0o600 })
  // update truststore
  const trustPath = path.resolve(process.cwd(), 'config', 'trust.json')
  const trust = await fs.readFile(trustPath, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
  trust.keys = trust.keys.filter((k) => k.keyId !== keyId)
  trust.keys.push({ keyId, createdAt: new Date().toISOString(), revoked: false, publisherId })
  await fs.writeFile(trustPath, JSON.stringify(trust, null, 2))

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ token, keyId, pubPath }))
    } catch (e) { res.writeHead(500); res.end(String(e)) }
    return
  }

  // one-time private key download
  if (req.url === '/auth/key' && req.method === 'GET') {
    try {
      const authHeader = (req.headers['authorization'] || '')
      const match = authHeader.match(/^Bearer\s+(.*)$/i)
      const token = match ? match[1] : null
      const authFile = path.resolve(process.cwd(), 'marketplace_auth.json')
      const auth = await fs.readFile(authFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ tokens: {} }))
      const entry = token ? auth.tokens[token] : null
      if (!entry) { res.writeHead(401); res.end('unauthorized'); return }
      if (entry.deliveredAt) {
        // attempt best-effort cleanup of any leftover private key files for this publisher
        try {
          const trustPath2 = path.resolve(process.cwd(), 'config', 'trust.json')
          const trust2 = await fs.readFile(trustPath2, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
          const keyEntries = (trust2.keys || []).filter((k) => k.publisherId === entry.publisherId)
          for (const keyEntry2 of keyEntries) {
            const pMain = path.resolve(process.cwd(), 'config', 'plugin_keys', keyEntry2.keyId + '.priv.pem')
            const pDelivered = path.resolve(process.cwd(), 'config', 'plugin_keys', '.delivered', keyEntry2.keyId + '.priv.pem')
            await fs.unlink(pMain).catch(() => {})
            await fs.unlink(pDelivered).catch(() => {})
          }
        } catch (cleanupErr) {
          logError('cleanup after deliveredAt failed ' + String(cleanupErr))
        }
        res.writeHead(410); res.end('key already delivered'); return
      }
      // find priv file for publisher's key in truststore
      const trustPath = path.resolve(process.cwd(), 'config', 'trust.json')
      const trust = await fs.readFile(trustPath, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
      const keyEntry = (trust.keys || []).find((k) => k.publisherId === entry.publisherId)
      if (!keyEntry) { res.writeHead(404); res.end('no key for publisher'); return }
      const privPath = path.resolve(process.cwd(), 'config', 'plugin_keys', keyEntry.keyId + '.priv.pem')
      const priv = await fs.readFile(privPath, 'utf8').catch(() => null)
      if (!priv) { res.writeHead(404); res.end('private key not available'); return }
      // Atomically move the private key to a delivered path before returning it.
      // This avoids races where the file may be read again or left behind.
      const deliveredDir = path.resolve(process.cwd(), 'config', 'plugin_keys', '.delivered')
      await fs.mkdir(deliveredDir, { recursive: true }).catch(() => {})
      const deliveredPath = path.join(deliveredDir, keyEntry.keyId + '.priv.pem')
      try {
        // move (rename) the file into delivered dir
        await fs.rename(privPath, deliveredPath)
      } catch (moveErr) {
        // if move fails, attempt to continue by reading the original file; log the error
        logError('failed to move priv key to delivered dir ' + privPath + ' ' + String(moveErr))
      }

      // read from the delivered path if present, otherwise fallback to original
      const deliverFrom = await fs.readFile(deliveredPath, 'utf8').catch(() => fs.readFile(privPath, 'utf8'))
      // return the key to requester
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
      res.end(deliverFrom)

      // Now attempt to securely delete the delivered copy (best-effort). If it fails, log error.
      try {
        await fs.unlink(deliveredPath).catch(() => fs.unlink(privPath).catch(() => {}))
        entry.deliveredAt = new Date().toISOString()
        await fs.writeFile(authFile, JSON.stringify(auth, null, 2))
      } catch (delErr) {
        logError('failed to remove delivered private key ' + deliveredPath + ' ' + String(delErr))
      }
    } catch (e) { res.writeHead(500); res.end(String(e)) }
    return
  }
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // admin logs endpoints
  if (req.url === '/logs' && req.method === 'GET') { await serveLogsList(req, res); return }
  if (req.url.startsWith('/logs/download') && req.method === 'GET') { await serveLogDownload(req, res); return }

  // list plugins
  if (req.url === '/plugins' && req.method === 'GET') {
    const d = await readData()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(d))
    return
  }

  // publish plugin (expects JSON body with base64 package)
  if (req.url === '/publish' && req.method === 'POST') {
    try {
      const authHeader = (req.headers['authorization'] || '')
      const match = authHeader.match(/^Bearer\s+(.*)$/i)
      const token = match ? match[1] : null
      const authFile = path.resolve(process.cwd(), 'marketplace_auth.json')
      const auth = await fs.readFile(authFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ tokens: {} }))
      const tokenEntry = token ? auth.tokens[token] : null
      if (!tokenEntry) { res.writeHead(401); res.end('unauthorized'); return }

      const body = await parseJsonBody(req)
      const { id, name, description, publisher, version, packageBase64, manifest, manifestSig } = body
      // enforce publisher matches token
      const mObj = typeof manifest === 'string' ? JSON.parse(manifest) : manifest
      if (mObj.publisherId && mObj.publisherId !== tokenEntry.publisherId) { res.writeHead(403); res.end('publisher mismatch'); return }
      // ensure manifest.publisherId is set
      mObj.publisherId = tokenEntry.publisherId
      if (!id || !version || !packageBase64 || !manifest || !manifestSig) {
        res.writeHead(400)
        res.end('missing fields')
        return
      }
      // verify manifest signature using public key in config/plugin_keys
      const trustPath = path.resolve(process.cwd(), 'config', 'trust.json')
      const trust = await fs.readFile(trustPath, 'utf8').then((b) => JSON.parse(b)).catch(() => null)
      if (!trust || !Array.isArray(trust.keys)) { res.writeHead(403); res.end('no truststore'); return }
      const m = typeof manifest === 'string' ? JSON.parse(manifest) : manifest
      if (!m.keyId) { res.writeHead(400); res.end('manifest missing keyId'); return }
      const keyEntry = trust.keys.find((k) => k.keyId === m.keyId)
      if (!keyEntry || keyEntry.revoked) { res.writeHead(403); res.end('untrusted key') ; return }
      const pubFile = path.resolve(process.cwd(), 'config', 'plugin_keys', m.keyId + '.pem')
      const pub = await fs.readFile(pubFile, 'utf8').catch(() => null)
      if (!pub) { res.writeHead(403); res.end('missing public key') ; return }
      // verify signature
      const crypto = await import('crypto')
      const verifier = crypto.createVerify('sha256')
      const manifestJson = typeof manifest === 'string' ? manifest : JSON.stringify(manifest, null, 2)
      verifier.update(manifestJson)
      verifier.end()
      const sigBuf = Buffer.from(manifestSig, 'base64')
      if (!verifier.verify(pub, sigBuf)) { res.writeHead(403); res.end('manifest signature invalid'); return }
      const d = await readData()
      d.plugins = d.plugins || []
      let p = d.plugins.find((x) => x.id === id)
      if (!p) {
        p = { id, name: name || id, description: description || '', publisher: publisher || null, versions: {} }
        d.plugins.push(p)
      }
      // store package
  const outDir = path.join(process.cwd(), 'marketplace_data', id, version)
      await fs.mkdir(outDir, { recursive: true })
      const buf = Buffer.from(packageBase64, 'base64')
      await fs.writeFile(path.join(outDir, 'plugin.mjs'), buf)
  // also store manifest and signature
  await fs.writeFile(path.join(outDir, 'manifest.json'), manifestJson)
  await fs.writeFile(path.join(outDir, 'manifest.sig'), manifestSig)
      p.versions[version] = { version, uploadedAt: new Date().toISOString() }
      await writeData(d)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (e) {
      res.writeHead(500)
      res.end(String(e))
    }
    return
  }

  // get plugin details
  const matchPlugin = req.url.match(/^\/plugins\/([^\/]+)$/)
  if (matchPlugin && req.method === 'GET') {
    const id = matchPlugin[1]
    const d = await readData()
    const p = (d.plugins || []).find((x) => x.id === id)
    if (!p) { res.writeHead(404); res.end('not found'); return }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(p))
    return
  }

  // download plugin
  const matchDownload = req.url.match(/^\/plugins\/([^\/]+)\/download/) 
  if (matchDownload && req.method === 'GET') {
    const id = matchDownload[1]
    const urlObj = new URL(req.url, 'http://localhost')
    const version = urlObj.searchParams.get('version')
    const d = await readData()
    const p = (d.plugins || []).find((x) => x.id === id)
    if (!p) { res.writeHead(404); res.end('not found'); return }
    const ver = version || Object.keys(p.versions || {})[0]
    if (!ver) { res.writeHead(404); res.end('no versions'); return }
    const file = path.join(process.cwd(), 'marketplace_data', id, ver, 'plugin.mjs')
    try {
      const buf = await fs.readFile(file)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ packageBase64: buf.toString('base64'), version: ver }))
    } catch (e) { res.writeHead(500); res.end(String(e)) }
    return
  }

  // rate plugin
  const matchRate = req.url.match(/^\/plugins\/([^\/]+)\/rate$/)
  if (matchRate && req.method === 'POST') {
    try {
      const id = matchRate[1]
      const body = await parseJsonBody(req)
      const score = Number(body.score) || 0
      const d = await readData()
      const p = (d.plugins || []).find((x) => x.id === id)
      if (!p) { res.writeHead(404); res.end('not found'); return }
      p.ratings = p.ratings || []
      p.ratings.push({ score, at: new Date().toISOString() })
      await writeData(d)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (e) { res.writeHead(500); res.end(String(e)) }
    return
  }

  res.writeHead(404)
  res.end('not found')
}

const server = http.createServer((req, res) => { handler(req, res).catch((e) => { res.writeHead(500); res.end(e.message); logError(e.message) }) })
server.listen(PORT, async () => { logInfo('marketplace stub listening on ' + PORT); console.log('marketplace stub listening on', PORT); try { await forceRotate(); logInfo('initial rotate performed') } catch (e) { logError('initial rotate failed ' + String(e)) } })

// graceful shutdown
process.on('SIGINT', () => { logInfo('shutting down'); server.close(() => process.exit(0)) })

// schedule log rotation (minutes configurable via ROTATE_INTERVAL_MIN, defaults to 5)
const ROTATE_INTERVAL_MIN = Number(process.env.ROTATE_INTERVAL_MIN || '5')
setInterval(() => {
  forceRotate().catch((e) => logError('rotate error ' + String(e)))
}, 1000 * 60 * ROTATE_INTERVAL_MIN)

// admin: list logs and download
async function serveLogsList(req, res) {
  try {
    const dir = path.resolve(process.cwd(), 'marketplace', 'logs')
    const files = await fs.readdir(dir).catch(() => [])
    const gz = files.filter((n) => n.endsWith('.gz')).sort().reverse()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ logs: gz }))
  } catch (e) { res.writeHead(500); res.end(String(e)) }
}

async function serveLogDownload(req, res) {
  try {
    const urlObj = new URL(req.url, 'http://localhost')
    const name = urlObj.searchParams.get('name')
    if (!name) { res.writeHead(400); res.end('missing name'); return }
    const file = path.join(process.cwd(), 'marketplace', 'logs', name)
    const buf = await fs.readFile(file)
    res.writeHead(200, { 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="${name}"` })
    res.end(buf)
  } catch (e) { res.writeHead(404); res.end('not found') }
}
