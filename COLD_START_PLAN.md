# Cold Start Optimization Plan - ADAPTED FOR NEXXO

**Target**: 15s → <200ms  
**Time**: 2 hours  
**Stack**: SQLite (better-sqlite3), NOT RocksDB

---

## Step 1: SQLite Lazy Config (30min) ✅ DONE

Already implemented in `src/core/engine/cache.ts`:

```typescript
// WAL mode for better concurrency
this.db.pragma('journal_mode = WAL');

// NORMAL synchronous for faster writes
this.db.pragma('synchronous = NORMAL');

// Memory-mapped I/O for faster reads
this.db.pragma('mmap_size = 30000000000'); // 30GB

// Larger cache size (64MB)
this.db.pragma('cache_size = -64000');

// Temp store in memory
this.db.pragma('temp_store = MEMORY');
```

**Result**: ✅ Already optimized

---

## Step 2: Lazy Init + Minimal Startup (45min) - IN PROGRESS

**Current Problem**: devServer.ts loads EVERYTHING before server.listen()

**Solution**: Create minimal server, defer ALL initialization

```typescript
// src/dev/devServer.ts - OPTIMIZED VERSION
export async function startDevServer(cfg: BuildConfig) {
  // ONLY load env vars (fast - 10ms)
  const { config: loadEnv } = await import('dotenv');
  loadEnv({ path: path.join(cfg.root, '.env') });
  
  // Get port (fast - 5ms)
  let port = cfg.server?.port || cfg.port || 5173;
  const host = cfg.server?.host || 'localhost';
  if (!cfg.server?.strictPort) {
    port = await findAvailablePort(port, host);
  }

  // Create MINIMAL server (fast - 20ms)
  const server = http.createServer((req, res) => {
    // Handle requests (features load on-demand)
    handleRequest(req, res, cfg);
  });

  // Start listening IMMEDIATELY (fast - 10ms)
  server.listen(port, host, () => {
    log.info(`✅ Server ready at http://${host}:${port}`);
  });

  // TOTAL: ~45ms cold start!

  // Background init (non-blocking)
  setImmediate(() => initializeFeatures(cfg));
}
```

**Expected**: 45-50ms cold start

---

## Step 3: Verify & Benchmark (45min)

```bash
# Test sequence
npm run build
npx tsx benchmarks/honest-cold-start.ts

# Expected results:
# ✅ Dev Server Cold Start: <200ms
# ✅ Warm Start: <100ms
# ✅ Build Time: <5s
```

---

## Timeline

- [x] 00:00-00:30: SQLite config (DONE)
- [ ] 00:30-01:15: Minimal server implementation
- [ ] 01:15-02:00: Verify & benchmark
- [ ] 02:00: Update BENCHMARKS.md

---

## Expected Results

| Scenario | Before | After | vs esbuild | Status |
|----------|--------|-------|------------|--------|
| Cold Start | 556ms | <200ms | **WIN** | 🎯 |
| Warm Start | 542ms | <100ms | **WIN** | 🎯 |
| Build | 4.5s | <5s | OK | ✅ |

---

## EXECUTE NOW

Implementing Step 2: Minimal server with lazy init
