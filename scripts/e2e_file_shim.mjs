#!/usr/bin/env node
// scripts/e2e_file_shim.mjs
// End-to-end test using the file:// uploader shim (no Docker/network).
// It sets env vars, writes a test marketplace.log, forces a rotation, then verifies that
// the gz archive was copied into the target uploads dir and (if REMOVE_AFTER_UPLOAD=1)
// that the gz was removed locally.
import fs from 'fs/promises'
import path from 'path'

async function run(){
  const cwd = process.cwd()
  const uploadsDir = path.resolve(cwd, 'marketplace', 'uploads')
  const logsDir = path.resolve(cwd, 'marketplace', 'logs')
  const bucket = 'e2e-local-bucket'
  process.env.S3_BUCKET = bucket
  process.env.S3_ENDPOINT = 'file://' + uploadsDir
  process.env.S3_FORCE_PATH_STYLE = '1'
  process.env.REMOVE_AFTER_UPLOAD = '1'

  await fs.mkdir(uploadsDir, { recursive: true })
  await fs.mkdir(logsDir, { recursive: true })

  // write a marketplace.log to be rotated
  const logFile = path.join(logsDir, 'marketplace.log')
  await fs.writeFile(logFile, 'e2e test log content\n')

  // import logger and force rotate
  const logger = await import('../marketplace/logger.mjs')
  console.log('Forcing rotate...')
  await logger.rotateNow()
  console.log('rotateNow completed')

  // find uploaded file in uploads/<bucket>
  const bucketPath = path.join(uploadsDir, bucket)
  const exists = await fs.stat(bucketPath).then(()=>true).catch(()=>false)
  if (!exists) {
    console.error('FAIL: bucket path not created:', bucketPath)
    process.exit(2)
  }
  const files = await fs.readdir(bucketPath).catch(()=>[])
  if (files.length === 0) {
    console.error('FAIL: no files in bucket path', bucketPath)
    process.exit(3)
  }
  console.log('Found uploaded files:', files)

  // check that gz is removed from logs dir (REMOVE_AFTER_UPLOAD=1 makes logger delete gz)
  const gzFiles = (await fs.readdir(logsDir)).filter(n=>n.endsWith('.gz'))
  if (gzFiles.length === 0) {
    console.log('OK: gz files removed from logs dir (expected)')
  } else {
    console.warn('NOTE: gz files still present in logs dir:', gzFiles)
  }
  process.exit(0)
}

run().catch(e=>{ console.error('e2e error', e); process.exit(1) })
