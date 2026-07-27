/// Phase 3.7 — Pre-bundle Cache
///
/// Caches pre-bundled node_modules imports, equivalent to Vite's
/// node_modules/.vite/deps. Location: .lunx_cache/deps/
///
/// Key: SHA-256(package name + version + all transitive dep versions).
/// On dev server start: check fingerprint, serve pre-bundled deps if hit,
/// re-bundle via the existing pipeline if miss.
use napi_derive::napi;
use napi::bindgen_prelude::*;
use rusqlite::{Connection, OpenFlags};
use sha2::{Sha256, Digest};
use serde_json::Value;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::fs;

// ─── Pre-bundle Cache Store ───────────────────────────────────────────────────

pub struct PrebundleStore {
    conn: Arc<Mutex<Connection>>,
    #[allow(dead_code)] // retained for future disk-based cache eviction
    deps_dir: PathBuf,
}

impl PrebundleStore {
    pub fn open(cache_root: &str) -> std::result::Result<Self, String> {
        let root = PathBuf::from(cache_root);
        let deps_dir = root.join("deps");
        fs::create_dir_all(&deps_dir)
            .map_err(|e| format!("Cannot create deps dir: {}", e))?;

        let db_path = root.join("prebundle.db");
        let conn = Connection::open_with_flags(
            &db_path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        )
        .map_err(|e| format!("Cannot open prebundle DB: {}", e))?;

        conn.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA synchronous=NORMAL;
             CREATE TABLE IF NOT EXISTS prebundle (
                 key        TEXT PRIMARY KEY,
                 module_id  TEXT NOT NULL,
                 bundle     BLOB NOT NULL,
                 updated_at INTEGER NOT NULL
             );
             CREATE INDEX IF NOT EXISTS idx_module ON prebundle(module_id);"
        )
        .map_err(|e| format!("Schema init failed: {}", e))?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
            deps_dir,
        })
    }

    /// Compute a cache key from package metadata JSON.
    ///
    /// packageMeta format:
    ///   { "name": "react", "version": "18.2.0", "deps": { "lodash": "4.17.21", ... } }
    fn compute_key(package_meta: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(package_meta.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }

    pub fn get(&self, key: &str) -> std::result::Result<Option<Vec<u8>>, String> {
        let conn = self.conn.lock().map_err(|_| "Mutex poisoned".to_string())?;
        let result: rusqlite::Result<Vec<u8>> = conn.query_row(
            "SELECT bundle FROM prebundle WHERE key = ?",
            rusqlite::params![key],
            |row| row.get(0),
        );
        match result {
            Ok(data) => Ok(Some(data)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("DB get error: {}", e)),
        }
    }

    pub fn put(&self, key: &str, module_id: &str, bundle: &[u8]) -> std::result::Result<(), String> {
        let conn = self.conn.lock().map_err(|_| "Mutex poisoned".to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO prebundle (key, module_id, bundle, updated_at)
             VALUES (?, ?, ?, cast(strftime('%s','now') as int))",
            rusqlite::params![key, module_id, bundle],
        )
        .map_err(|e| format!("DB put error: {}", e))?;
        Ok(())
    }

    #[allow(dead_code)] // HMR API — called when a module changes to invalidate its pre-bundle
    pub fn invalidate_module(&self, module_id: &str) -> std::result::Result<usize, String> {
        let conn = self.conn.lock().map_err(|_| "Mutex poisoned".to_string())?;
        let n = conn.execute(
            "DELETE FROM prebundle WHERE module_id = ?",
            rusqlite::params![module_id],
        )
        .map_err(|e| format!("DB delete error: {}", e))?;
        Ok(n)
    }
}

// ─── N-API Types ──────────────────────────────────────────────────────────────

#[napi(object)]
pub struct PrebundleEntry {
    pub module_id: String,
    /// SHA-256 fingerprint used as cache key
    pub key: String,
    /// Pre-bundled JS content
    pub bundle: String,
    /// true = cache hit, false = miss (caller must bundle and call put)
    pub hit: bool,
}

#[napi(object)]
pub struct PrebundleConfig {
    /// Path to .lunx_cache directory
    pub cache_root: String,
}

/// Check or populate the pre-bundle cache for an array of module specifiers.
///
/// `modules` is a JSON array of package metadata objects:
///   [{ "name": "react", "version": "18.2.0", "deps": { ... } }, ...]
///
/// Returns one PrebundleEntry per module — callers check `.hit` and
/// call the JS bundler only for misses, then persist with `prebundlePut`.
///
/// N-API export (new, additive): prebundle(modules: string)
#[napi(js_name = "prebundle")]
pub fn prebundle(modules_json: String, config: PrebundleConfig) -> Result<Vec<PrebundleEntry>> {
    let store = PrebundleStore::open(&config.cache_root)
        .map_err(|e| Error::new(Status::GenericFailure, e))?;

    let mods: Vec<Value> = serde_json::from_str(&modules_json)
        .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid modules JSON: {}", e)))?;

    let mut results = Vec::new();

    for m in mods {
        let module_id = m["name"].as_str().unwrap_or("unknown").to_string();
        // Stable key: serialize the full metadata deterministically
        let meta_str = serde_json::to_string(&m).unwrap_or_default();
        let key = PrebundleStore::compute_key(&meta_str);

        let cached = store.get(&key)
            .map_err(|e| Error::new(Status::GenericFailure, e))?;

        if let Some(data) = cached {
            results.push(PrebundleEntry {
                module_id,
                key,
                bundle: String::from_utf8_lossy(&data).to_string(),
                hit: true,
            });
        } else {
            results.push(PrebundleEntry {
                module_id,
                key,
                bundle: String::new(),
                hit: false,
            });
        }
    }

    Ok(results)
}

/// Persist a pre-bundled module into the cache after the JS bundler runs.
///
/// N-API export (new, additive): prebundlePut(key, moduleId, bundle, config)
#[napi(js_name = "prebundlePut")]
pub fn prebundle_put(
    key: String,
    module_id: String,
    bundle: String,
    config: PrebundleConfig,
) -> Result<()> {
    let store = PrebundleStore::open(&config.cache_root)
        .map_err(|e| Error::new(Status::GenericFailure, e))?;

    store.put(&key, &module_id, bundle.as_bytes())
        .map_err(|e| Error::new(Status::GenericFailure, e))?;

    Ok(())
}
