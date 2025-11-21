import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
const sigPath = pluginPath + '.sig'
const manifestPath = pluginPath + '.manifest.json'
const keysFolder = path.resolve(process.cwd(), 'config', 'plugin_keys')
const trustPath = path.resolve(process.cwd(), 'config', 'trust.json')

;(async () => {
  const [sigBuf, dataBuf, manifestBuf] = await Promise.all([
    fs.readFile(sigPath).catch(() => null),
    fs.readFile(pluginPath),
    fs.readFile(manifestPath).catch(() => null),
  ])
  console.log('sig present:', !!sigBuf)
  console.log('manifest present:', !!manifestBuf)
  const manifest = manifestBuf ? JSON.parse(manifestBuf.toString()) : null
  console.log('manifest:', manifest)
  let targetKeys = []
  if (manifest && manifest.keyId) targetKeys = [manifest.keyId + '.pem']
  if (targetKeys.length === 0) targetKeys = await fs.readdir(keysFolder).catch(() => [])
  console.log('candidate keys:', targetKeys)
  const trust = await fs.readFile(trustPath).then((b) => JSON.parse(b.toString())).catch(() => null)
  console.log('trust:', trust)
  if (trust && Array.isArray(trust.trustedKeys) && trust.trustedKeys.length > 0) {
    targetKeys = targetKeys.filter((k) => trust.trustedKeys.includes(k.replace(/\.pem$/, '')))
  }
  console.log('final keys tested:', targetKeys)
  if (!sigBuf) return
  const sig = Buffer.from(sigBuf.toString().trim(), 'base64')
  for (const k of targetKeys) {
    const pub = await fs.readFile(path.join(keysFolder, k), 'utf8').catch(() => null)
    console.log('trying key file:', k, 'loaded:', !!pub)
    if (!pub) continue
    const verifier = crypto.createVerify('sha256')
    verifier.update(dataBuf)
    verifier.end()
    try {
      const ok = verifier.verify(pub, sig)
      console.log('verify with', k, ok)
    } catch (err) {
      console.error('verify error with', k, err)
    }
  }
})()
