import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

async function run() {
  const keysDir = path.resolve(process.cwd(), 'config', 'plugin_keys')
  await fs.mkdir(keysDir, { recursive: true })
  // generate keypair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pub = publicKey.export({ type: 'pkcs1', format: 'pem' })
  const priv = privateKey.export({ type: 'pkcs1', format: 'pem' })
  // write public key using the test key id present in trust.json
  await fs.writeFile(path.join(keysDir, 'testkey.pem'), pub)
  // ensure trust.json contains the testkey as active
  const trustFile = path.resolve(process.cwd(), 'config', 'trust.json')
  const trust = await fs.readFile(trustFile, 'utf8').then((b) => JSON.parse(b)).catch(() => ({ keys: [] }))
  trust.keys = trust.keys.filter((k) => k.keyId !== 'testkey')
  trust.keys.push({ keyId: 'testkey', createdAt: new Date().toISOString(), revoked: false })
  await fs.writeFile(trustFile, JSON.stringify(trust, null, 2))
  const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
  const data = await fs.readFile(pluginPath)
  const signer = crypto.createSign('sha256')
  signer.update(data)
  signer.end()
  const sig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.sig', sig.toString('base64'))
  // write matching manifest so verifier knows which keyId signed the plugin
  await fs.writeFile(pluginPath + '.manifest.json', JSON.stringify({ keyId: 'testkey' }, null, 2))
  console.log('signed plugin and wrote public key; now running verify...')
  // run the verify importer
  // prefer compiled dist JS if available
  const verifyPath = '../dist/plugins/verify.js'
  const { verifyPluginSignature } = await import(verifyPath)
  const ok = await verifyPluginSignature(pluginPath, keysDir)
  if (ok) console.log('✅ verification passed')
  else console.error('❌ verification failed')
}

run().catch((e) => { console.error(e); process.exit(1) })
