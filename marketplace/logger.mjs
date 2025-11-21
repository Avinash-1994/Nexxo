import fs from 'fs/promises'
import path from 'path'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'

const MAX_KEEP = Number(process.env.LOG_MAX_KEEP || '5')

const LOG_DIR = path.resolve(process.cwd(), 'marketplace', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'marketplace.log')
const MAX_BYTES = Number(process.env.LOG_MAX_BYTES || String(1024 * 1024)) // default 1MB

async function ensureDir() {
  await fs.mkdir(LOG_DIR, { recursive: true }).catch(() => {})
}

async function rotateIfNeeded() {
  try {
    const st = await fs.stat(LOG_FILE).catch(() => null)
    if (st && st.size >= MAX_BYTES) {
      const ts = new Date().toISOString().replace(/[:.]/g,'-')
      const baseName = `marketplace.log.${ts}`
      await doRotate(baseName)
    }
  } catch (e) {
    // don't let logging break main flow
  }
}

async function doRotate(baseName) {
  const newName = path.join(LOG_DIR, baseName)
  await fs.rename(LOG_FILE, newName).catch(() => {})
  try {
    const gzPath = newName + '.gz'
    const rs = (await import('fs')).createReadStream(newName)
    const ws = (await import('fs')).createWriteStream(gzPath)
    await pipeline(rs, createGzip(), ws)
    await fs.unlink(newName).catch(() => {})
    // attempt to upload archive if configured
    try {
      const { uploadArchive } = await import('./uploader.mjs')
      const r = await uploadArchive(gzPath).catch((err) => ({ ok: false, err: String(err) }))
      if (r && r.ok) {
        await fs.appendFile(LOG_FILE, new Date().toISOString() + ' INFO uploaded ' + gzPath + '\n')
        if (process.env.REMOVE_AFTER_UPLOAD === '1') await fs.unlink(gzPath).catch(() => {})
      } else {
        await fs.appendFile(LOG_FILE, new Date().toISOString() + ' ERROR upload failed ' + gzPath + ' ' + JSON.stringify(r) + '\n')
      }
    } catch (e) {
      await fs.appendFile(LOG_FILE, new Date().toISOString() + ' ERROR upload exception ' + String(e) + '\n')
    }
  } catch (e) {
    // best-effort
  }
  // cleanup older archives
  try {
    const entries = (await fs.readdir(LOG_DIR)).filter(n => n.startsWith('marketplace.log.') && n.endsWith('.gz')).sort().reverse()
    for (let i = MAX_KEEP; i < entries.length; i++) {
      await fs.unlink(path.join(LOG_DIR, entries[i])).catch(() => {})
    }
  } catch (e) {}
}

export async function forceRotate() { await rotateIfNeeded() }
export async function rotateNow() {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g,'-')
    const baseName = `marketplace.log.${ts}`
    await doRotate(baseName)
  } catch (e) {
    // swallow
  }
}

async function append(level, msg) {
  try {
    await ensureDir()
    await rotateIfNeeded()
    const ts = new Date().toISOString()
    const line = `${ts} ${level} ${msg}\n`
    await fs.appendFile(LOG_FILE, line)
  } catch (e) {
    // swallow
  }
}

export async function info(msg) { await append('INFO', typeof msg === 'string' ? msg : JSON.stringify(msg)) }
export async function error(msg) { await append('ERROR', typeof msg === 'string' ? msg : JSON.stringify(msg)) }
