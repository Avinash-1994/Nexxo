#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'

const repoRoot = path.resolve(process.cwd())
const keysDir = path.join(repoRoot, 'config', 'plugin_keys')
const pluginPath = path.join(repoRoot, 'src', 'plugins', 'samplePlugin.mjs')
const keyId = 'revTestKey'

async function signWithKey(privPemPath) {
  const data = await fs.readFile(pluginPath)
  const signer = crypto.createSign('sha256')
  signer.update(data)
  signer.end()
  const priv = await fs.readFile(privPemPath, 'utf8')
  const sig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.sig', sig.toString('base64'))
}

async function run() {
  await fs.mkdir(keysDir, { recursive: true })
  // 1) generate a key in-repo so private key is available
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} generate ${keyId} revPub --in-repo`, { stdio: 'inherit' })
  // sign plugin with generated private key
  const privPath = path.join(keysDir, keyId + '.priv.pem')
  await signWithKey(privPath)
  // write manifest and sign manifest using the public key (for simplicity, use private key to sign manifest too)
  const data = await fs.readFile(pluginPath)
  const hash = crypto.createHash('sha256').update(data).digest('hex')
  const manifest = { publisherId: 'revPub', plugin: path.basename(pluginPath), version: '0.0.1', keyId, checksum: hash, signedAt: new Date().toISOString() }
  await fs.writeFile(pluginPath + '.manifest.json', JSON.stringify(manifest, null, 2))
  // sign manifest with private key
  const signer = crypto.createSign('sha256')
  signer.update(JSON.stringify(manifest, null, 2))
  signer.end()
  const priv = await fs.readFile(privPath, 'utf8')
  const mSig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.manifest.sig', mSig.toString('base64'))

  // ensure compiled verifier is up-to-date
  try { require('child_process').execSync('npx tsc -p tsconfig.json --outDir dist', { stdio: 'ignore' }) } catch (e) {}
  const verifyPath = '../dist/plugins/verify.js'
  const { verifyBundle } = await import(verifyPath)

  const ok = await verifyBundle(pluginPath, keysDir)
  console.log('verify before revoke (expect true):', ok)
  if (!ok) process.exit(2)

  // revoke key
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} revoke ${keyId}`, { stdio: 'inherit' })

  const ok2 = await verifyBundle(pluginPath, keysDir)
  console.log('verify after revoke (expect false):', ok2)
  if (ok2) process.exit(3)

  console.log('✅ revocation test passed')
  await cleanup()
}

run().catch((e) => { console.error(e); process.exit(1) })

async function cleanup() {
  try {
    await fs.unlink(path.join(keysDir, keyId + '.priv.pem')).catch(() => {})
    await fs.unlink(path.join(keysDir, keyId + '.pem')).catch(() => {})
    await fs.unlink(pluginPath + '.sig').catch(() => {})
    await fs.unlink(pluginPath + '.manifest.json').catch(() => {})
    await fs.unlink(pluginPath + '.manifest.sig').catch(() => {})
    const trustFile = path.join(process.cwd(), 'config', 'trust.json')
    const t = await fs.readFile(trustFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
    t.keys = t.keys.filter((k) => k.keyId !== keyId)
    await fs.writeFile(trustFile, JSON.stringify(t, null, 2)).catch(() => {})
  } catch (err) {}
}
