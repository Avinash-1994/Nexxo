#!/usr/bin/env node
// Prototype stub showing AWS KMS signing flow (no runtime dependency, example only)
import fs from 'fs/promises'
import path from 'path'

async function main() {
  const [,, pluginPath, keyRef] = process.argv
  if (!pluginPath || !keyRef) {
    console.log('usage: node kms_sign_stub.mjs <plugin-file> <kms-key-ref>')
    process.exit(2)
  }

  const data = await fs.readFile(pluginPath)
  // compute digest
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256').update(data).digest('hex')

  // In real CI: call KMS Sign API with the digest and keyRef, receive signature
  console.log('Stub: would call KMS to sign manifest for', pluginPath)
  console.log('digest:', hash)
  console.log('kms-key-ref:', keyRef)
  console.log('On success: write', pluginPath + '.manifest.json', 'and', pluginPath + '.manifest.sig')
}

main().catch((e) => { console.error(e); process.exit(1) })
