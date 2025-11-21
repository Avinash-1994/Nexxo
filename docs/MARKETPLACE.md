Marketplace MVP (prototype)

This is a minimal marketplace MVP to allow discovery and testing of plugins locally.

Components
- `marketplace/server.js` — simple HTTP stub exposing `/plugins` and `/health`.
- `scripts/marketplace.mjs` — CLI to query the local stub.
- `ui/src/pages/Marketplace.jsx` — UI page that fetches `/api/marketplace/plugins` (you should proxy this to the server during dev)

Next steps
- Add endpoints for install/uninstall, publisher pages, ratings, and authentication.
- Add packaging & signing workflows for published plugin artifacts.
- Integrate billing provider for paid/premium plugins.

Run locally
- Start stub: node marketplace/server.js
- Query health: node scripts/marketplace.mjs health
- List plugins: node scripts/marketplace.mjs list

Notes
- The server stub may already be running on port 4321 during development; only one instance should listen at a time.
- In dev UI, proxy `/api/marketplace` to the local server to avoid CORS issues.
