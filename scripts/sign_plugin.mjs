#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// usage: sign_plugin.mjs <plugin-file> <publisherId> <version> <private-pem> <key-id>
async function main() {
  const [,, pluginPath, publisherId, version, privKeyPath, keyId] = process.argv
  if (!pluginPath || !publisherId || !version || !privKeyPath || !keyId) {
    console.error('usage: node sign_plugin.mjs <plugin-file> <publisherId> <version> <private-pem> <key-id>')
    process.exit(2)
  }
  const data = await fs.readFile(pluginPath)
  const priv = await fs.readFile(privKeyPath, 'utf8')

  // compute sha256 checksum of plugin file
  const hash = crypto.createHash('sha256').update(data).digest('hex')

  // manifest
  const manifest = {
    publisherId,
    plugin: path.basename(pluginPath),
    version,
    keyId,
    checksum: hash,
    signedAt: new Date().toISOString(),
  }
  const manifestJson = JSON.stringify(manifest, null, 2)
  await fs.writeFile(pluginPath + '.manifest.json', manifestJson)

  // sign manifest
  const signer = crypto.createSign('sha256')
  signer.update(manifestJson)
  signer.end()
  const sig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.manifest.sig', sig.toString('base64'))

  console.log('manifest written and signed for', pluginPath)
}

main().catch((e) => { console.error(e); process.exit(1) })
