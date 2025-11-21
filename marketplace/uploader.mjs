// uploader.mjs
// Supports two modes:
//  - S3 upload when S3_BUCKET (+ AWS_REGION) are set and @aws-sdk/* packages are installed.
//  - HTTP POST to UPLOAD_URL otherwise.
// To use S3, set AWS credentials in env (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) and set S3_BUCKET.
import fs from 'fs/promises'
import path from 'path'
import { createReadStream } from 'fs'
import { URL } from 'url'

const UPLOAD_URL = process.env.UPLOAD_URL || ''
const S3_BUCKET = process.env.S3_BUCKET || ''
const S3_PREFIX = process.env.S3_PREFIX || ''
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const S3_ENDPOINT = process.env.S3_ENDPOINT || ''
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE === '1' || false
const UPLOAD_RETRIES = Number(process.env.UPLOAD_RETRIES || '3')
const UPLOAD_BACKOFF_MS = Number(process.env.UPLOAD_BACKOFF_MS || '500')

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function retryWithBackoff(fn) {
  let attempt = 0
  let lastErr = null
  while (attempt <= UPLOAD_RETRIES) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const backoff = Math.floor(UPLOAD_BACKOFF_MS * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4))
      console.log(`uploader: attempt ${attempt} failed, retrying in ${backoff}ms`, e && e.message)
      await sleep(backoff)
      attempt++
    }
  }
  throw lastErr
}

export async function uploadArchive(filePath) {
  // If S3 is configured, try S3 upload via AWS SDK v3 (if available).
  if (S3_BUCKET) {
    try {
      // If S3_ENDPOINT is a file:// URL, use a local filesystem shim for testing.
      if (S3_ENDPOINT && S3_ENDPOINT.startsWith('file://')) {
        const targetBase = new URL(S3_ENDPOINT).pathname
        await fs.mkdir(path.join(targetBase, S3_BUCKET), { recursive: true })
        const dest = path.join(targetBase, S3_BUCKET, (S3_PREFIX ? (S3_PREFIX.replace(/\/$/, '') + '/') : '') + path.basename(filePath))
        await fs.copyFile(filePath, dest)
        return { ok: true, provider: 'file-shim', path: dest }
      }
      return await retryWithBackoff(async () => {
        const { Upload } = await import('@aws-sdk/lib-storage')
        const { S3Client } = await import('@aws-sdk/client-s3')
        // initialize S3 client; if credentials are missing the SDK will throw on send
        // Allow custom endpoint (MinIO or S3-compatible) and path-style option for local testing
        const clientOpts = { region: AWS_REGION }
        if (S3_ENDPOINT) {
          clientOpts.endpoint = S3_ENDPOINT
          clientOpts.forcePathStyle = S3_FORCE_PATH_STYLE
        }
        const client = new S3Client(clientOpts)
        const stream = createReadStream(filePath)
        const key = (S3_PREFIX ? (S3_PREFIX.replace(/\/$/, '') + '/') : '') + path.basename(filePath)
        const uploader = new Upload({ client, params: { Bucket: S3_BUCKET, Key: key, Body: stream, ContentType: 'application/gzip' } })
        await uploader.done()
        return { ok: true, provider: 's3', key }
      })
    } catch (e) {
      // provide actionable hints for common causes (missing SDK, missing creds, permissions)
      const msg = String(e || '')
      console.error('s3 upload failed after retries:', msg)
  const hints = []
      hints.push('Ensure AWS credentials are available in environment (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) or an instance role is present.')
      hints.push('Ensure AWS_REGION is set (or AWS_DEFAULT_REGION).')
      hints.push('Ensure the IAM principal has permissions: s3:PutObject for the target bucket.')
      hints.push('To diagnose, run: node scripts/check_s3.mjs (set TEST_WRITE=1 to also test writes)')
  hints.push('If you are using a local S3-compatible service (MinIO), set S3_ENDPOINT and S3_FORCE_PATH_STYLE=1 and point AWS credentials at the MinIO user.')
      // If the error looks like an import error, suggest installing SDK packages
      if (/Cannot find module|Cannot use import|ERR_MODULE_NOT_FOUND|Cannot find package/i.test(msg)) {
        hints.unshift('AWS SDK not installed or not resolvable. Run: npm install @aws-sdk/client-s3 @aws-sdk/lib-storage')
      }
  return { ok: false, provider: 's3', error: msg, hints }
    }
  }
  if (!UPLOAD_URL) return { ok: false, reason: 'no upload configured' }
  const u = new URL(UPLOAD_URL)
  return retryWithBackoff(() => new Promise((resolve, reject) => {
    ;(async () => {
      console.log('uploader: preparing to POST', UPLOAD_URL, 'file:', filePath)
      const lib = u.protocol === 'https:' ? await import('https') : await import('http')
      const rs = createReadStream(filePath)
      const req = lib.request(u, { method: 'POST', headers: { 'Content-Type': 'application/gzip' } }, (res) => {
       let s = ''
       res.setEncoding('utf8')
       res.on('data', (d) => s += d)
       res.on('end', () => {
         console.log('uploader: response status', res.statusCode)
         resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: s })
       })
     })
      req.on('error', (e) => { console.log('uploader: request error', e); reject(e) })
      rs.on('error', (e) => { console.log('uploader: read stream error', e); reject(e) })
      rs.pipe(req)
    })().catch(reject)
  }))
}
// debug helper
if (process.env.UPLOAD_DEBUG === '1') {
  console.log('uploader configured with UPLOAD_URL=', UPLOAD_URL)
}
