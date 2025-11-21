import { spawn } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { log } from '../utils/logger.js'

type PluginMessage = { type: 'transform'; code: string; id: string }

export class PluginSandbox {
  // pool holds child process instances that support .on('message') and .send()
  pool: any[] = []
  next = 0
  // max time per transform (ms)
  timeout = 5000

  constructor(private size = Math.max(1, Math.min(os.cpus().length - 1, 4))) { }

  async start() {
    // verify at least one plugin exists and is signed before spinning workers
    const pluginCandidate = path.resolve(process.cwd(), 'src', 'plugins', 'samplePlugin.mjs')
    const signed = await import('./verify.js').then((m) => m.verifyPluginSignature(pluginCandidate)).catch(() => false)
    if (!signed) {
      log.error('no signed plugins found - refusing to start plugin workers')
      return
    }
    for (let i = 0; i < this.size; i++) {
      this.spawnWorker(i)
    }
    // Give workers time to initialize
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private spawnWorker(i: number) {
    const distPath = path.resolve(process.cwd(), 'dist', 'plugins', 'pluginWorker.mjs')
    const srcPath = path.resolve(process.cwd(), 'src', 'plugins', 'pluginWorker.mjs')
    const workerFile = fs.existsSync(distPath) ? distPath : srcPath

    // on Linux, prefer prlimit to constrain address space and cpu time if available
    // const prlimitPaths = ['/usr/bin/prlimit', '/bin/prlimit']
    // const prlimit = prlimitPaths.find((p) => fs.existsSync(p))
    const prlimit = null; // Temporarily disabled for debugging
    let child
    if (prlimit) {
      // set virtual memory limit (as) to 512MB and CPU time to 10s as defaults
      child = spawn(prlimit, ['--as=536870912', '--cpu=10', 'node', workerFile], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
    } else {
      child = spawn('node', [workerFile], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
    }
    child.on('error', (e: any) => log.error('worker process error', e))
    child.on('exit', (c: any) => log.info('worker process exit', c))
    this.pool[i] = child
  }

  stop() {
    this.pool.forEach((w) => w.terminate())
    this.pool = []
  }

  // restart a worker at index i
  private restartWorker(i: number) {
    try {
      const old = this.pool[i]
      if (old) {
        try { old.kill('SIGKILL') } catch (e) { /* ignore */ }
      }
    } catch (e) {
      log.error('error terminating worker', e)
    }
    this.spawnWorker(i)
  }

  async runTransform(code: string, id: string): Promise<string> {
    if (this.pool.length === 0) await this.start()
    const idx = this.next % this.pool.length
    const worker = this.pool[idx]
    this.next++
    return new Promise((resolve, reject) => {
      let timedOut = false
      const timer = setTimeout(() => {
        timedOut = true
        // attempt to restart the worker to recover from stuck plugin
        try {
          this.restartWorker(idx)
        } catch (e) {
          log.error('failed to restart worker', e)
        }
        reject(new Error('plugin transform timeout'))
      }, this.timeout)

      const onMessage = (msg: any) => {
        if (timedOut) return
        if (msg.type === 'result' && msg.id === id) {
          clearTimeout(timer)
          try { worker.off?.('message', onMessage) } catch (e) { }
          resolve(msg.code)
        }
        if (msg.type === 'error' && msg.id === id) {
          clearTimeout(timer)
          try { worker.off?.('message', onMessage) } catch (e) { }
          // restart worker on plugin errors to ensure clean state
          this.restartWorker(idx)
          reject(new Error(msg.error))
        }
      }
      // attach message handler and post via IPC (child process)
      try {
        worker.on('message', onMessage)
        worker.send({ type: 'transform', code, id })
      } catch (e) {
        clearTimeout(timer)
        try { worker.off?.('message', onMessage) } catch (e) { }
        this.restartWorker(idx)
        reject(e)
      }
    })
  }
}
