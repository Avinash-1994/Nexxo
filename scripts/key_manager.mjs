#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

const trustFile = path.resolve(process.cwd(), 'config', 'trust.json')
const keysDir = path.resolve(process.cwd(), 'config', 'plugin_keys')
const userKeysDir = path.resolve(os.homedir(), '.nextgen', 'keys')

async function readTrust() {
  try { return JSON.parse(await fs.readFile(trustFile, 'utf8')) } catch (e) { return { keys: [] } }
}

async function writeTrust(t) { await fs.mkdir(path.dirname(trustFile), { recursive: true }); await fs.writeFile(trustFile, JSON.stringify(t, null, 2)) }

async function list() {
  const t = await readTrust()
  console.log('keys:', t.keys)
}

async function generate(keyId, publisherId, inRepo = false) {
  // ensure public keys dir exists
  await fs.mkdir(keysDir, { recursive: true })
  // ensure user key dir exists when writing private keys locally
  if (!inRepo) await fs.mkdir(userKeysDir, { recursive: true })
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pub = publicKey.export({ type: 'pkcs1', format: 'pem' })
  const priv = privateKey.export({ type: 'pkcs1', format: 'pem' })
  // write public key into repo plugin_keys (so verifiers can access)
  await fs.writeFile(path.join(keysDir, keyId + '.pem'), pub)
  // write private key either into repo (for CI/test) or into user's secure dir (~/.nextgen/keys)
  const privPath = inRepo ? path.join(keysDir, keyId + '.priv.pem') : path.join(userKeysDir, keyId + '.priv.pem')
  await fs.writeFile(privPath, priv, { mode: 0o600 })
  const t = await readTrust()
  const entry = { keyId, createdAt: new Date().toISOString(), revoked: false, publisherId: publisherId || null }
  t.keys = t.keys.filter((k) => k.keyId !== keyId)
  t.keys.push(entry)
  await writeTrust(t)
  console.log('generated key:', keyId, 'private:', privPath)
}

async function importPublic(keyId, pubPath, publisherId) {
  await fs.mkdir(keysDir, { recursive: true })
  const pub = await fs.readFile(pubPath, 'utf8')
  await fs.writeFile(path.join(keysDir, keyId + '.pem'), pub)
  const t = await readTrust()
  t.keys = t.keys.filter((k) => k.keyId !== keyId)
  t.keys.push({ keyId, createdAt: new Date().toISOString(), revoked: false, publisherId: publisherId || null })
  await writeTrust(t)
  console.log('imported public key', keyId)
}

async function revoke(keyId) {
  const t = await readTrust()
  t.keys = t.keys.map((k) => k.keyId === keyId ? { ...k, revoked: true, revokedAt: new Date().toISOString() } : k)
  await writeTrust(t)
  console.log('revoked', keyId)
}

async function rotate(oldKeyId, newKeyId) {
  await generate(newKeyId)
  await revoke(oldKeyId)
  console.log('rotated', oldKeyId, '->', newKeyId)
}

async function revokePublisher(publisherId) {
  const t = await readTrust()
  t.keys = t.keys.map((k) => k.publisherId === publisherId ? { ...k, revoked: true, revokedAt: new Date().toISOString() } : k)
  await writeTrust(t)
  console.log('revoked publisher', publisherId)
}

async function main() {
  const args = process.argv.slice(2)
  const cmd = args[0]
  if (cmd === 'list') return list()
  if (cmd === 'generate') {
    // generate <keyId> <publisherId?> [--in-repo]
    const keyId = args[1]
    const publisherId = args[2]
    const inRepo = args.includes('--in-repo')
    return generate(keyId, publisherId, inRepo)
  }
  if (cmd === 'import') {
    // import <keyId> <pub.pem> <publisherId?>
    return importPublic(args[1], args[2], args[3])
  }
  if (cmd === 'revoke') return revoke(args[1])
  if (cmd === 'rotate') return rotate(args[1], args[2])
  if (cmd === 'revoke-publisher') return revokePublisher(args[1])
  console.log('usage: key_manager.mjs list | generate <keyId> <publisherId?> [--in-repo] | import <keyId> <pub.pem> <publisherId?> | revoke <keyId> | rotate <oldKey> <newKey> | revoke-publisher <publisherId>')
}

main().catch((e) => { console.error(e); process.exit(1) })
