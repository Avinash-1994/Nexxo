// RocksDB-based persistent cache for Nexxo v2.0
// Day 2: Module 1 - Speed Mastery
//
// This module provides enterprise-grade persistent caching with:
// - LSM tree architecture for efficient writes
// - Automatic compaction and cleanup
// - Multi-target support (dev/prod/lib)
// - Cache warming and invalidation

use napi::bindgen_prelude::*;
use napi_derive::napi;
use rocksdb::{DB, Options, WriteBatch, IteratorMode};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;

/// Cache entry metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub key: String,
    pub value: String,
    pub timestamp: i64,
    pub target: String, // dev, prod, or lib
}

/// Cache statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct CacheStats {
    pub total_entries: u32,
    pub hits: u32,
    pub misses: u32,
    pub hit_rate: f64,
    pub size_bytes: f64,
}

/// RocksDB-based build cache
#[napi]
pub struct BuildCache {
    db: Arc<DB>,
    hits: Arc<std::sync::atomic::AtomicU32>,
    misses: Arc<std::sync::atomic::AtomicU32>,
}

#[napi]
impl BuildCache {
    /// Create a new build cache at the specified path
    #[napi(constructor)]
    pub fn new(cache_path: String) -> Result<Self> {
        let path = PathBuf::from(cache_path);
        
        // Configure RocksDB options for optimal performance
        let mut opts = Options::default();
        opts.create_if_missing(true);
        opts.set_max_open_files(1000);
        opts.set_use_fsync(false); // Faster writes, acceptable for cache
        opts.set_bytes_per_sync(1048576); // 1MB
        opts.set_write_buffer_size(64 * 1024 * 1024); // 64MB
        opts.set_max_write_buffer_number(3);
        opts.set_target_file_size_base(64 * 1024 * 1024); // 64MB
        
        // Enable compression
        opts.set_compression_type(rocksdb::DBCompressionType::Lz4);
        
        let db = DB::open(&opts, path)
            .map_err(|e| Error::from_reason(format!("Failed to open RocksDB: {}", e)))?;
        
        Ok(Self {
            db: Arc::new(db),
            hits: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            misses: Arc::new(std::sync::atomic::AtomicU32::new(0)),
        })
    }
    
    /// Get a value from the cache
    #[napi]
    pub fn get(&self, key: String) -> Option<String> {
        match self.db.get(key.as_bytes()) {
            Ok(Some(value)) => {
                self.hits.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                String::from_utf8(value).ok()
            }
            _ => {
                self.misses.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                None
            }
        }
    }
    
    /// Set a value in the cache
    #[napi]
    pub fn set(&self, key: String, value: String) -> Result<()> {
        self.db.put(key.as_bytes(), value.as_bytes())
            .map_err(|e| Error::from_reason(format!("Failed to set cache: {}", e)))
    }
    
    /// Delete a value from the cache
    #[napi]
    pub fn delete(&self, key: String) -> Result<()> {
        self.db.delete(key.as_bytes())
            .map_err(|e| Error::from_reason(format!("Failed to delete cache: {}", e)))
    }
    
    /// Check if a key exists in the cache
    #[napi]
    pub fn has(&self, key: String) -> bool {
        self.db.get(key.as_bytes()).ok().flatten().is_some()
    }
    
    /// Batch set multiple key-value pairs
    #[napi]
    pub fn batch_set(&self, entries: std::collections::HashMap<String, String>) -> Result<()> {
        let mut batch = WriteBatch::default();
        for (key, value) in entries {
            batch.put(key.as_bytes(), value.as_bytes());
        }
        self.db.write(batch)
            .map_err(|e| Error::from_reason(format!("Failed to batch set: {}", e)))
    }
    
    /// Clear all entries for a specific target (dev/prod/lib)
    #[napi]
    pub fn clear_target(&self, target: String) -> Result<u32> {
        let mut count = 0u32;
        let mut batch = WriteBatch::default();
        
        // Iterate through all keys and delete those matching the target
        let iter = self.db.iterator(IteratorMode::Start);
        for item in iter {
            if let Ok((key, _)) = item {
                let key_str = String::from_utf8_lossy(&key);
                if key_str.starts_with(&format!("{}:", target)) {
                    batch.delete(&key);
                    count += 1;
                }
            }
        }
        
        self.db.write(batch)
            .map_err(|e| Error::from_reason(format!("Failed to clear target: {}", e)))?;
        
        Ok(count)
    }
    
    /// Clear all cache entries
    #[napi]
    pub fn clear_all(&self) -> Result<()> {
        let mut batch = WriteBatch::default();
        
        let iter = self.db.iterator(IteratorMode::Start);
        for item in iter {
            if let Ok((key, _)) = item {
                batch.delete(&key);
            }
        }
        
        self.db.write(batch)
            .map_err(|e| Error::from_reason(format!("Failed to clear all: {}", e)))
    }
    
    /// Get cache statistics
    #[napi]
    pub fn get_stats(&self) -> Result<CacheStats> {
        let hits = self.hits.load(std::sync::atomic::Ordering::Relaxed);
        let misses = self.misses.load(std::sync::atomic::Ordering::Relaxed);
        let total_requests = hits + misses;
        
        let hit_rate = if total_requests > 0 {
            (hits as f64 / total_requests as f64) * 100.0
        } else {
            0.0
        };
        
        // Count total entries
        let mut total_entries = 0u32;
        let iter = self.db.iterator(IteratorMode::Start);
        for _ in iter {
            total_entries += 1;
        }
        
        // Estimate size (approximate)
        let size_bytes = self.db.property_int_value("rocksdb.total-sst-files-size")
            .ok()
            .flatten()
            .unwrap_or(0);
        
        Ok(CacheStats {
            total_entries,
            hits,
            misses,
            hit_rate,
            size_bytes: size_bytes as f64,
        })
    }
    
    /// Compact the database to reclaim space
    #[napi]
    pub fn compact(&self) -> Result<()> {
        self.db.compact_range::<&[u8], &[u8]>(None, None);
        Ok(())
    }
    
    /// Close the cache (cleanup)
    #[napi]
    pub fn close(&self) -> Result<()> {
        // RocksDB will be closed when the Arc is dropped
        Ok(())
    }
}

/// Create cache key for input fingerprint
#[napi]
pub fn create_input_key(file_path: String, content_hash: String) -> String {
    format!("input:{}:{}", file_path, content_hash)
}

/// Create cache key for graph hash
#[napi]
pub fn create_graph_key(graph_hash: String) -> String {
    format!("graph:{}", graph_hash)
}

/// Create cache key for plan hash
#[napi]
pub fn create_plan_key(plan_hash: String, target: String) -> String {
    format!("plan:{}:{}", target, plan_hash)
}

/// Create cache key for artifact
#[napi]
pub fn create_artifact_key(artifact_id: String, target: String) -> String {
    format!("artifact:{}:{}", target, artifact_id)
}
