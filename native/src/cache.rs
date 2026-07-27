use napi::bindgen_prelude::*;
use napi_derive::napi;
use rusqlite::{Connection, OpenFlags};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct CacheStats {
    pub total_entries: u32,
    pub hits: u32,
    pub misses: u32,
    pub hit_rate: f64,
    pub size_bytes: f64,
}

#[napi]
pub struct BuildCache {
    conn: Arc<Mutex<Connection>>,
    hits: Arc<std::sync::atomic::AtomicU32>,
    misses: Arc<std::sync::atomic::AtomicU32>,
    db_path: PathBuf,
}

#[napi]
impl BuildCache {
    #[napi(constructor)]
    pub fn new(cache_path: String) -> Result<Self> {
        let path = PathBuf::from(&cache_path);
        
        // Ensure directory exists
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let db_file_path = if path.is_file() || path.extension().is_some() {
            path.clone()
        } else {
            // Default filename if a directory was provided
            path.join("cache.db")
        };

        // If a legacy graph cache directory exists, migrate it to SQLite (Phase 2.4)
        let old_graph_dir = path.join("graph");
        if old_graph_dir.exists() && old_graph_dir.is_dir() {
            let migrated_dir = path.join("graph.migrated");
            let _ = fs::rename(&old_graph_dir, &migrated_dir);
            eprintln!("INFO: Migrated legacy graph cache directory to SQLite. Old dir renamed to graph.migrated");
        }

        let conn = Connection::open_with_flags(
            &db_file_path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        ).map_err(|e| Error::from_reason(format!("Failed to open SQLite: {}", e)))?;

        // Optimize SQLite defaults (WAL mode + NORMAL synchronous)
        conn.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA synchronous=NORMAL;
             PRAGMA cache_size=-64000;
             PRAGMA mmap_size=134217728;
             PRAGMA page_size=4096;
             CREATE TABLE IF NOT EXISTS cache (
                 key TEXT PRIMARY KEY,
                 value TEXT NOT NULL,
                 cache_type TEXT DEFAULT 'artifact',
                 updated_at INTEGER DEFAULT (cast(strftime('%s','now') as int))
             );
             CREATE INDEX IF NOT EXISTS idx_cache_type ON cache(cache_type);"
        ).map_err(|e| Error::from_reason(format!("Failed to initialize DB schema: {}", e)))?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
            hits: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            misses: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            db_path: db_file_path,
        })
    }

    #[napi]
    pub fn get(&self, key: String) -> Option<String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare_cached("SELECT value FROM cache WHERE key = ?") {
            Ok(s) => s,
            Err(_) => return None,
        };
        
        match stmt.query_row(rusqlite::params![key], |row| row.get(0)) {
            Ok(value) => {
                self.hits.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                Some(value)
            }
            Err(_) => {
                self.misses.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                None
            }
        }
    }

    #[napi]
    pub fn set(&self, key: String, value: String) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        // Determine type based on key format loosely
        let cache_type = if key.starts_with("graph:") { "graph" } else { "artifact" };
        
        conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, cache_type, updated_at) VALUES (?, ?, ?, cast(strftime('%s','now') as int))",
            rusqlite::params![key, value, cache_type],
        )
        .map_err(|e| Error::from_reason(format!("Failed to set cache: {}", e)))?;
        Ok(())
    }

    #[napi]
    pub fn delete(&self, key: String) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM cache WHERE key = ?", rusqlite::params![key])
            .map_err(|e| Error::from_reason(format!("Failed to delete cache: {}", e)))?;
        Ok(())
    }

    #[napi]
    pub fn has(&self, key: String) -> bool {
        let conn = self.conn.lock().unwrap();
        let mut stmt = match conn.prepare_cached("SELECT 1 FROM cache WHERE key = ?") {
            Ok(s) => s,
            Err(_) => return false,
        };
        stmt.exists(rusqlite::params![key]).unwrap_or(false)
    }

    #[napi]
    pub fn batch_set(&self, entries: std::collections::HashMap<String, String>) -> Result<()> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()
            .map_err(|e| Error::from_reason(format!("Failed to start transaction: {}", e)))?;
        
        {
            let mut stmt = tx.prepare_cached(
                "INSERT OR REPLACE INTO cache (key, value, cache_type, updated_at) VALUES (?, ?, ?, cast(strftime('%s','now') as int))"
            ).map_err(|e| Error::from_reason(format!("Failed to prepare statement: {}", e)))?;
            
            for (key, value) in entries {
                let cache_type = if key.starts_with("graph:") { "graph" } else { "artifact" };
                stmt.execute(rusqlite::params![key, value, cache_type])
                    .map_err(|e| Error::from_reason(format!("Failed to batch set: {}", e)))?;
            }
        }
        
        tx.commit()
            .map_err(|e| Error::from_reason(format!("Failed to commit transaction: {}", e)))?;
        Ok(())
    }

    #[napi]
    pub fn clear_target(&self, target: String) -> Result<u32> {
        let conn = self.conn.lock().unwrap();
        let query = format!("{}%", target);
        let count = conn.execute("DELETE FROM cache WHERE key LIKE ?", rusqlite::params![query])
            .map_err(|e| Error::from_reason(format!("Failed to clear target: {}", e)))?;
        Ok(count as u32)
    }

    #[napi]
    pub fn clear_all(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM cache", [])
            .map_err(|e| Error::from_reason(format!("Failed to clear all: {}", e)))?;
        Ok(())
    }

    #[napi]
    pub fn get_stats(&self) -> Result<CacheStats> {
        let conn = self.conn.lock().unwrap();
        let hits = self.hits.load(std::sync::atomic::Ordering::Relaxed);
        let misses = self.misses.load(std::sync::atomic::Ordering::Relaxed);
        let total_requests = hits + misses;
        
        let hit_rate = if total_requests > 0 {
            (hits as f64 / total_requests as f64) * 100.0
        } else {
            0.0
        };
        
        let total_entries: u32 = conn.query_row("SELECT count(*) FROM cache", [], |row| row.get(0))
            .unwrap_or(0);
        
        let size_bytes = if let Ok(metadata) = fs::metadata(&self.db_path) {
            metadata.len() as f64
        } else {
            0.0
        };

        Ok(CacheStats {
            total_entries,
            hits,
            misses,
            hit_rate,
            size_bytes,
        })
    }

    #[napi]
    pub fn compact(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("VACUUM", [])
            .map_err(|e| Error::from_reason(format!("Failed to compact: {}", e)))?;
        Ok(())
    }

    #[napi]
    pub fn close(&self) -> Result<()> {
        // Will close when Arc is dropped natively
        Ok(())
    }
}

#[napi]
pub fn create_input_key(file_path: String, content_hash: String) -> String {
    format!("input:{}:{}", file_path, content_hash)
}

#[napi]
pub fn create_graph_key(graph_hash: String) -> String {
    format!("graph:{}", graph_hash)
}

#[napi]
pub fn create_plan_key(plan_hash: String, target: String) -> String {
    format!("plan:{}:{}", target, plan_hash)
}

#[napi]
pub fn create_artifact_key(artifact_id: String, target: String) -> String {
    format!("artifact:{}:{}", target, artifact_id)
}
