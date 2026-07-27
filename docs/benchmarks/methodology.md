# 🏁 HONEST Benchmark Report (Real Measurements)

**Execution Date:** 2026-01-21T11:36:00.737Z  
**Environment:** Linux, Node v20.19.5

## Results

| Metric | Lunx | Vite | Webpack | Rspack | esbuild | Lunx Rank |
|--------|-------|------|---------|--------|---------|------------|
| Small - Cold Start (ms) | 118 🥇 | 257 🥈 | N/A | N/A | N/A | #1 |
| Small - Build (ms) | 655 🥉 | 719 | 1793 | 385 🥈 | 141 🥇 | #3 |
| Small - Size (KB) | 9 🥇 | 139 🥉 | 137 🥈 | 506 | 140 | #1 |
| Medium - Cold Start (ms) | 120 🥇 | N/A | N/A | N/A | N/A | #1 |
| Medium - Build (ms) | 1920 🥇 | N/A | N/A | N/A | N/A | #1 |
| Medium - Size (KB) | 372 🥇 | N/A | N/A | N/A | N/A | #1 |

**Notes:**
- All values are **measured live** on the same hardware.
- Cold Start: Time from command execution to server ready.
- Build: Time to complete production build.
- Size: Total dist folder size (KB).
- "N/A" indicates the tool doesn't support that operation in this test setup.
