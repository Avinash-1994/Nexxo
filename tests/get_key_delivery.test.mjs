import { spawn } from 'child_process'
import http from 'http'
import fs from 'fs/promises'
import path from 'path'

const BASE = process.env.MARKETPLACE_URL || 'http://localhost:4321'
const SERVER_SCRIPT = path.resolve(process.cwd(), 'marketplace/server.js')

function wait(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function httpPostJson(pathname, body) {
  const u = new URL(pathname, BASE)
  return new Promise((resolve, reject) => {
    (async () => {
      const lib = u.protocol === 'https:' ? (await import('https')) : (await import('http'))
      const s = lib.request(u, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (d) => data += d)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
      s.on('error', reject)
      s.write(JSON.stringify(body))
      s.end()
    })().catch(reject)
  })
}

async function httpGet(pathname, headers = {}) {
  const u = new URL(pathname, BASE)
  return new Promise((resolve, reject) => {
    ;(async () => {
      const lib = u.protocol === 'https:' ? (await import('https')) : (await import('http'))
      const opts = { headers }
      lib.get(u, opts, (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(Buffer.from(c)))
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }))
      }).on('error', reject)
    })().catch(reject)
  })
}

async function startServer() {
  // spawn server in background
  const child = spawn(process.execPath, [SERVER_SCRIPT], { stdio: ['ignore', 'pipe', 'pipe'], detached: false })
  child.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`))
  child.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`))
  // wait for /health
  for (let i = 0; i < 20; i++) {
    try {
      const r = await httpGet('/health')
      if (r.status === 200) return child
    } catch (e) {}
    await wait(200)
  }
  throw new Error('server did not become healthy')
}

async function runTest() {
  // start server if not reachable
  let serverChild = null
  try {
    const health = await httpGet('/health')
    if (health.status !== 200) serverChild = await startServer()
  } catch (e) {
    // if /health fails, attempt to start server; but if port already in use, assume a server is running
    try {
      serverChild = await startServer()
    } catch (startErr) {
      console.warn('could not start server (assuming one is already running):', startErr.message)
      serverChild = null
    }
  }

  const publisherId = 'testpub-' + Date.now().toString(36)

  // register
  const reg = await httpPostJson('/auth/register', { publisherId })
  if (reg.status !== 200) throw new Error('register failed: ' + reg.body)
  const j = JSON.parse(reg.body)
  const token = j.token
  const keyId = j.keyId

  // ensure file exists initially
  const keysDir = path.resolve(process.cwd(), 'config', 'plugin_keys')
  const privPath = path.join(keysDir, keyId + '.priv.pem')
  // give server a moment to create files
  await wait(200)
  let exists = true
  try { await fs.access(privPath); } catch (e) { exists = false }
  if (!exists) throw new Error('private key not written by register: ' + privPath)

  // fetch key via GET /auth/key
  const getRes = await httpGet('/auth/key', { Authorization: `Bearer ${token}` })
  if (getRes.status !== 200) {
    // if 410 and deliveredAt is set, that's an error for this test
    throw new Error('get-key failed with ' + getRes.status + ' ' + getRes.body?.toString?.())
  }
  // write it to a temp file
  const out = path.join('/tmp', `testpub-key-${Date.now().toString(36)}.pem`)
  await fs.writeFile(out, getRes.body, { mode: 0o600 })

  // check privPath removed
  let still = true
  try { await fs.access(privPath); } catch (e) { still = false }
  if (still) throw new Error('private key still exists after get-key: ' + privPath)

  // check deliveredAt set in marketplace_auth.json
  const authRaw = await fs.readFile(path.resolve(process.cwd(), 'marketplace_auth.json'), 'utf8')
  const auth = JSON.parse(authRaw)
  const tokenEntry = Object.values(auth.tokens).find((t) => t.publisherId === publisherId)
  if (!tokenEntry || !tokenEntry.deliveredAt) throw new Error('deliveredAt not set for token')

  console.log('test passed: key delivered and removed')

  if (serverChild) {
    serverChild.kill()
  }
}

runTest().catch((e) => { console.error(e); process.exit(2) })
