User Guide — Urja Build Tool (plain language)

Who this guide is for
- New developers who have used `npm`/`node` and want a fast way to build frontend apps.

What this tool gives you
- Dev server with live reload
- Fast production build with caching
- Plugin system for extensions

Basic workflow (simple words):
- Dev: run the dev server, edit your files, see the browser update.
- Build: create optimized files for deployment.

Files and folders you need to know
- `src/` — put your app code here.
- `public/` — static files like `index.html`.
- `build_output/` — where production files are written.
- `.urja_cache/` — internal cache (you can delete it to force a rebuild).
- `urja.config.json` — optional configuration file.

Example: add a simple app
1. Create `src/main.tsx`:
   <!-- sample content provided in template -->
2. Run dev server
   npx urja dev

Config file (`urja.config.json`) example
{
  "entry": ["src/main.tsx"],
  "mode": "production",
  "outDir": "dist"
}

Tips for beginners
- If the dev server doesn't refresh, check the terminal for errors.
- Deleting `.urja_cache/` forces a fresh build.
