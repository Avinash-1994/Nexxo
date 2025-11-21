Advanced features & roadmap (in plain words)

What we're planning to provide soon:
- True HMR for React/Vue (no full reload)
- Micro-frontends and module federation
- Remote caching for CI (S3/HTTP)
- Rust worker for minification and heavy transforms
- Visual no-code pipeline editor (drag-and-drop)

Remote cache prototype
- You can start a simple remote cache server for testing:

	node scripts/remote_cache_server.mjs

- Then set `REMOTE_CACHE_URL` when running the build:

	REMOTE_CACHE_URL=http://localhost:4999 node dist/cli.js build

The prototype will push manifest and files to the remote server and restore them on misses.

Why these matter
- Faster developer feedback.
- Better scaling in large teams and micro-frontend apps.
- Lower CI costs with remote caching.

How you can help
- Try the prototype, open issues for missing features, and share plugin ideas.
