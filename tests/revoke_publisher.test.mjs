#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'

const repoRoot = path.resolve(process.cwd())
const keysDir = path.join(repoRoot, 'config', 'plugin_keys')
const pluginPath = path.join(repoRoot, 'src', 'plugins', 'samplePlugin.mjs')
const publisherId = 'pubToRevoke'
const keyA = 'pubRevokeA'
const keyB = 'pubRevokeB'

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
  // generate two keys in-repo for same publisher
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} generate ${keyA} ${publisherId} --in-repo`, { stdio: 'inherit' })
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} generate ${keyB} ${publisherId} --in-repo`, { stdio: 'inherit' })

  // sign plugin with keyA
  const privPathA = path.join(keysDir, keyA + '.priv.pem')
  await signWithKey(privPathA)
  const data = await fs.readFile(pluginPath)
  const hash = crypto.createHash('sha256').update(data).digest('hex')
  const manifest = { publisherId, plugin: path.basename(pluginPath), version: '0.0.1', keyId: keyA, checksum: hash, signedAt: new Date().toISOString() }
  await fs.writeFile(pluginPath + '.manifest.json', JSON.stringify(manifest, null, 2))
  const signer = crypto.createSign('sha256')
  signer.update(JSON.stringify(manifest, null, 2))
  signer.end()
  const priv = await fs.readFile(privPathA, 'utf8')
  const mSig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.manifest.sig', mSig.toString('base64'))

  // ensure compiled verifier is up-to-date
  try { require('child_process').execSync('npx tsc -p tsconfig.json --outDir dist', { stdio: 'ignore' }) } catch (e) {}
  // verify before revoke
  const verifyPath = '../dist/plugins/verify.js'
  const { verifyBundle } = await import(verifyPath)
  const ok = await verifyBundle(pluginPath, keysDir)
  console.log('verify before revoke (expect true):', ok)
  if (!ok) process.exit(2)

  // revoke publisher
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} revoke-publisher ${publisherId}`, { stdio: 'inherit' })

  const ok2 = await verifyBundle(pluginPath, keysDir)
  console.log('verify after revoke-publisher (expect false):', ok2)
  if (ok2) process.exit(3)

  console.log('✅ revoke-publisher test passed')
  await cleanup()
}

run().catch((e) => { console.error(e); process.exit(1) })

async function cleanup() {
  try {
    for (const id of [keyA, keyB]) {
      await fs.unlink(path.join(keysDir, id + '.priv.pem')).catch(() => {})
      await fs.unlink(path.join(keysDir, id + '.pem')).catch(() => {})
    }
    await fs.unlink(pluginPath + '.sig').catch(() => {})
    await fs.unlink(pluginPath + '.manifest.json').catch(() => {})
    await fs.unlink(pluginPath + '.manifest.sig').catch(() => {})
    const trustFile = path.join(process.cwd(), 'config', 'trust.json')
    const t = await fs.readFile(trustFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
    t.keys = t.keys.filter((k) => k.publisherId !== publisherId)
    await fs.writeFile(trustFile, JSON.stringify(t, null, 2)).catch(() => {})
  } catch (err) {}
}
