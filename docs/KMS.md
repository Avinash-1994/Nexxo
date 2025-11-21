KMS/HSM integration guide (prototype)

Goal: show how to avoid storing private keys in-repo by delegating signing to a KMS (AWS KMS, GCP KMS) or an HSM.

AWS KMS (example)
- Create or import an asymmetric RSA key in AWS KMS with Sign/Verify permissions.
- Grant your CI principal (or user) permission to call kms:Sign for the key.
- Example workflow (CI):
  1. Build artifact (plugin file)
  2. Compute SHA-256 checksum locally
  3. Send the checksum/manifest to AWS KMS Sign using the asymmetric key
  4. Attach the signature and a manifest pointing to the KMS keyId (or a published key fingerprint)

Example AWS signing stub (pseudo):
- Use AWS SDK v3 (npm install @aws-sdk/client-kms)
- Call kms.sign({ KeyId, Message, MessageType: 'RAW', SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256' })
- Base64-encode the Signature and write `.manifest.sig`

GCP KMS (example)
- Similar flow using GCP's asymmetric keys and the IAM principal that can call cloudkms.cryptoKeys.asymmetricSign

Design notes
- The verifier still needs the public key for verification. Options:
  - Export the public key from KMS and add it to `config/plugin_keys/<keyId>.pem` (recommended).
  - Or include a stable key reference (e.g. KMS key ARN) in the manifest and have the verifier fetch the public key from a trusted source at install time.

CLI stub
- We provide `scripts/kms_sign_stub.mjs` as an example for CI teams to adapt.

Security guidance
- Never commit private keys to the repository.
- Use least-privilege service accounts for CI signing and rotate KMS keys per org policy.
- Audit signing operations.
