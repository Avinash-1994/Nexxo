import { verifyPluginSignature } from '../dist/plugins/verify.js'
import path from 'path'

const pluginPath = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
;(async () => {
  const ok = await verifyPluginSignature(pluginPath)
  console.log('verify result:', ok)
})()
