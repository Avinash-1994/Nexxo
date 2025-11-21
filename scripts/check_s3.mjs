#!/usr/bin/env node
// scripts/check_s3.mjs
// Small helper to validate S3 SDK availability, credentials, and bucket access.
import process from 'process'
const S3_BUCKET = process.env.S3_BUCKET || ''
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const S3_ENDPOINT = process.env.S3_ENDPOINT || ''
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE === '1' || false

async function main(){
  if (!S3_BUCKET) {
    console.error('S3_BUCKET is not set. Set S3_BUCKET and re-run. Example: export S3_BUCKET=my-bucket')
    process.exit(2)
  }
  try {
    const { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const clientOpts = { region: AWS_REGION }
    if (S3_ENDPOINT) {
      clientOpts.endpoint = S3_ENDPOINT
      clientOpts.forcePathStyle = S3_FORCE_PATH_STYLE
    }
    const client = new S3Client(clientOpts)
    try {
      await client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
      console.log('HeadBucket: OK — bucket reachable and permissions likely sufficient')
    } catch (e) {
      console.error('HeadBucket failed:', e && e.name, e && e.message)
      console.error('Possible causes: wrong AWS credentials, missing permissions (s3:HeadBucket), wrong bucket name, or network access issues.')
      process.exitCode = 3
    }
    if (process.env.TEST_WRITE === '1') {
      const key = `s3-check-${Date.now()}.txt`
      try {
        await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: 'ok', ContentType: 'text/plain' }))
        console.log('PutObject: OK — write permissions present')
        await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
        console.log('DeleteObject: OK — cleanup successful')
      } catch (e) {
        console.error('Put/Delete failed:', e && e.name, e && e.message)
        console.error('If you intended only to test read access, unset TEST_WRITE. Otherwise ensure IAM allows s3:PutObject and s3:DeleteObject.')
        process.exitCode = 4
      }
    }
  } catch (e) {
    console.error('AWS SDK import or client init failed:', e && e.message)
    console.error('Run `npm install @aws-sdk/client-s3 @aws-sdk/lib-storage` in the project root and ensure node can import them.')
    process.exit(1)
  }
}

main().catch((e)=>{ console.error('unexpected error', e); process.exit(1) })
