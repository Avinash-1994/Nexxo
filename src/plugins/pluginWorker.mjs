import path from 'path'
import fs from 'fs/promises'
import { verifyPluginSignature } from './verify.js'

// Support both worker_threads.parentPort and child_process IPC
let IPC = null
let useProcessSend = false
try {
  const wt = await import('worker_threads')
  IPC = wt.parentPort
} catch (e) {
  IPC = process
  useProcessSend = typeof process.send === 'function'
}

function send(msg) {
  try {
    if (IPC && typeof IPC.postMessage === 'function') IPC.postMessage(msg)
    else if (useProcessSend) process.send(msg)
    else console.log('ipc:', msg)
  } catch (e) {
    // swallow
  }
}

const tryLoad = async () => {
  const candidates = [
    path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs'),
    path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.js'),
    path.resolve(process.cwd(), 'dist', 'plugins', 'samplePlugin.js'),
  ]
  for (const c of candidates) {
    try {
      const ok = await verifyPluginSignature(c).catch(() => false)
      if (!ok) {
        send({ type: 'log', msg: `plugin unsigned or signature missing: ${c}` })
        continue
      }
      const url = 'file://' + c
      try {
        const mod = await import(url)
        return mod
      } catch (err) {
        try {
          const req = eval('require')
          const modCjs = req(c)
          return modCjs
        } catch (e2) {
          // continue
        }
      }
    } catch (e) {
      // continue
    }
  }
  return null
}

let plugin = null

;(async () => {
  plugin = await tryLoad()
  if (!plugin) send({ type: 'log', msg: 'no plugin loaded' })

  const onMessage = async (msg) => {
    if (!msg || msg.type !== 'transform') return
    try {
      if (plugin && typeof plugin.transform === 'function') {
        const out = await plugin.transform(msg.code, msg.id)
        send({ type: 'result', id: msg.id, code: out })
      } else {
        send({ type: 'result', id: msg.id, code: msg.code })
      }
    } catch (err) {
      send({ type: 'error', id: msg.id, error: String(err) })
    }
  }

  if (IPC && typeof IPC.on === 'function') IPC.on('message', onMessage)
  else process.on('message', onMessage)
})()
