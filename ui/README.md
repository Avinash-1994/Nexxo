UI Prototype

To run the visual pipeline UI locally:

1. Install UI deps:
   cd ui && npm install

2. Start the config server (in root):
   node scripts/config_server.mjs

3. Start the UI dev server:
   cd ui && npm run dev

The UI will proxy `/api` to the config server and allow editing `nextgen.build.json`.
