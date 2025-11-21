import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

async function mkKey(name) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pub = publicKey.export({ type: 'pkcs1', format: 'pem' })
  const priv = privateKey.export({ type: 'pkcs1', format: 'pem' })
  const keysDir = path.resolve(process.cwd(), 'config', 'plugin_keys')
  await fs.mkdir(keysDir, { recursive: true })
  await fs.writeFile(path.join(keysDir, name + '.pem'), pub)
  await fs.writeFile(path.join(keysDir, name + '.priv.pem'), priv)
  return { pub, priv }
}

async function sign(pluginPath, priv) {
  const data = await fs.readFile(pluginPath)
  const signer = crypto.createSign('sha256')
  signer.update(data)
  signer.end()
  const sig = signer.sign(priv)
  await fs.writeFile(pluginPath + '.sig', sig.toString('base64'))
}

async function run() {
  const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
  const a = await mkKey('a')
  await sign(pluginPath, a.priv)
  await fs.writeFile(pluginPath + '.manifest.json', JSON.stringify({ keyId: 'a' }))
  const { verifyPluginSignature } = await import('../dist/plugins/verify.js')
  let ok = await verifyPluginSignature(pluginPath)
  console.log('signed with a, verify (expect true):', ok)
  const b = await mkKey('b')
  // simulate rotation: manifest points to b but signature from a should fail
  await fs.writeFile(pluginPath + '.manifest.json', JSON.stringify({ keyId: 'b' }))
  ok = await verifyPluginSignature(pluginPath)
  console.log('manifest points to b but signed by a (expect false):', ok)
}

run().catch((e) => { console.error(e); process.exit(1) })
