#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

const repoRoot = path.resolve(process.cwd())
const keysDir = path.join(repoRoot, 'config', 'plugin_keys')
const keyId = 'ciTestKey'

async function run() {
  // cleanup
  try { await fs.unlink(path.join(keysDir, keyId + '.priv.pem')) } catch (e) {}
  try { await fs.unlink(path.join(keysDir, keyId + '.pem')) } catch (e) {}

  // run generate with --in-repo
  console.log('running key_manager generate with --in-repo...')
  execSync(`node ${path.join(repoRoot, 'scripts', 'key_manager.mjs')} generate ${keyId} ciTestPublisher --in-repo`, { stdio: 'inherit' })

  // check files
  try {
    await fs.access(path.join(keysDir, keyId + '.priv.pem'))
    await fs.access(path.join(keysDir, keyId + '.pem'))
    console.log('✅ in-repo private key and public key found')
    // cleanup artifacts
    await cleanupKeys([keyId])
    process.exit(0)
  } catch (e) {
    console.error('❌ expected keys not found in', keysDir)
    await cleanupKeys([keyId])
    process.exit(2)
  }
}

run()

async function cleanupKeys(keyIds) {
  try {
    for (const id of keyIds) {
      await fs.unlink(path.join(keysDir, id + '.priv.pem')).catch(() => {})
      await fs.unlink(path.join(keysDir, id + '.pem')).catch(() => {})
    }
    const trustFile = path.join(repoRoot, 'config', 'trust.json')
    const t = await fs.readFile(trustFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
    t.keys = t.keys.filter((k) => !keyIds.includes(k.keyId))
    await fs.writeFile(trustFile, JSON.stringify(t, null, 2)).catch(() => {})
  } catch (err) {
    // best-effort cleanup
  }
}
