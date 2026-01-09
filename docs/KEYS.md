Key storage and usage

- Public keys: stored in `config/plugin_keys/<keyId>.pem`. These are used by the verifier at runtime.
- Private keys: by default written to the user's secure local directory `~/.nexxo/keys/<keyId>.priv.pem` with file mode 0600.
- For CI or testing where the private key must be accessible in-repo, use the `--in-repo` flag when generating a key:

  node scripts/key_manager.mjs generate <keyId> <publisherId> --in-repo

  This writes `<keyId>.priv.pem` into `config/plugin_keys/` (do NOT commit this in production).

- Production guidance: Use a KMS/HSM or CI secret store to sign artifacts instead of storing private keys in the repository.
