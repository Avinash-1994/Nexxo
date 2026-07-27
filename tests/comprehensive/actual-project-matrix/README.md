# 🎯 Real Project Matrix - Execution Guide

Test Lunx against 8 real production open-source projects (153k+ stars).

## Quick Start

```bash
# Navigate to matrix directory
cd tests/comprehensive/actual-project-matrix

# Compile TypeScript
npm run build

# Run full matrix (all phases)
node dist/runner.js --all

# Or run phases individually
node dist/runner.js --clone      # Phase 1: Clone projects
node dist/runner.js --install    # Phase 1.5: Install dependencies
node dist/runner.js --config     # Phase 1.6: Create configs
node dist/runner.js --test       # Phase 2: Run tests
node dist/runner.js --report     # Phase 3: Generate reports
```

## Test Specific Projects/Features

```bash
# Test single project
node dist/runner.js --test --project react-table

# Test single feature across all projects
node dist/runner.js --test --feature hmr

# Test specific feature on specific project
node dist/runner.js --test --project vueuse --feature ssr
```

## Projects Being Tested

1. **TanStack Table** (24k ⭐) - React hooks + CSS modules
2. **React Query** (42k ⭐) - SSR + bundle splitting
3. **VueUse** (20k ⭐) - Composables + Tailwind
4. **Nuxt Content** (4.5k ⭐) - SSR + MDX
5. **SvelteKit** (18k ⭐) - Full SvelteKit + SSR
6. **Svelte Motion** (1.5k ⭐) - Animations + TypeScript
7. **Lit Todo** (15k ⭐) - Web Components
8. **Alpine.js** (28k ⭐) - No-build ESM

## Features Being Tested

1. ⚡ **HMR** - Hot Module Replacement (< 500ms)
2. 🎨 **CSS Modules** - Scoped CSS classes
3. 🌊 **Tailwind** - PurgeCSS + JIT
4. 📘 **TypeScript** - Type checking + source maps
5. 🌳 **Tree Shaking** - Dead code elimination
6. 🖥️ **SSR** - Server-Side Rendering
7. 📦 **Library Mode** - Build as npm package
8. 🔗 **Module Federation** - Micro-frontends
9. 🚨 **Error Overlay** - Dev error UI
10. 📊 **Dashboard** - Build analytics

## Output

Results are saved to:
- `results/full-matrix-run.json` - Raw JSON data
- `results/matrix-report.md` - Markdown report
- `results/screenshots/` - Feature screenshots
- `results/videos/` - Demo videos

## Timeline

- **Day 1 (4hrs)**: Clone + setup (Phases 1-1.6)
- **Day 2 (6hrs)**: Run all tests (Phase 2)
- **Day 3 (4hrs)**: Generate reports + deploy (Phase 3)

## Expected Results

Target: **77/80 tests passing** (96.25% success rate)

## Troubleshooting

If a project fails to clone:
```bash
# Manually clone
git clone --depth 1 <repo-url> apps/<project-id>
```

If dependencies fail to install:
```bash
# Try with npm instead of npm ci
cd apps/<project-id>
npm install
```

If a test fails:
```bash
# Check logs in results/
cat results/full-matrix-run.json | jq '."<project-id>"'
```

## Next Steps

After tests complete:
1. Review `results/matrix-report.md`
2. Build matrix website (`matrix-site/`)
3. Deploy to matrix.lunxtool.com
4. Create marketing materials
