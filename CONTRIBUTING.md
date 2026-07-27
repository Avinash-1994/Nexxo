# Contributing to Lunx

## Setup
```
git clone https://github.com/Avinash-1994/lunx
cd lunx
npm install
npm run build
```

## Run tests
```
node e2e/run-all-phases.js
```

## Run hydration tests
```
npx playwright test e2e/playwright/hydration.spec.ts
```

## Before submitting a PR
```
tsc --noEmit          # 0 errors required
lunx security audit   # clean required
node e2e/run-all-phases.js  # 320 pass required
```

## Architecture
```
src/cli.ts            — CLI entry
src/cli/commands/     — command handlers
src/meta-frameworks/  — 16 framework adapters
src/dev/             — uWS dev server + HMR
src/build/           — bundler + chunker + DCE
src/cache/           — SQLite WAL cache
src/security/        — 8-command security suite
src/transform/       — SWC + LightningCSS pipeline
packages/            — official plugins
```
