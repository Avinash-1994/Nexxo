import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

async function run() {
  const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
  // generate a publisher key
  execSync('node scripts/key_manager.mjs generate acmeKey acme')
  // sign manifest using sign_plugin script
  const priv = path.resolve(process.cwd(), 'config', 'plugin_keys', 'acmeKey.priv.pem')
  execSync(`node scripts/sign_plugin.mjs ${pluginPath} acme 1.0.0 ${priv} acmeKey`)
  // run verifier
  const { verifyBundle } = await import('../dist/plugins/verify.js')
  const ok = await verifyBundle(pluginPath)
  console.log('publisher manifest verify result:', ok)
}

run().catch((e) => { console.error(e); process.exit(1) })
