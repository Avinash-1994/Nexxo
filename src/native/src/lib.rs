use napi_derive::napi;
// use napi::bindgen_prelude::*;
use sha2::{Sha256, Digest};
use rayon::prelude::*;
use std::sync::Arc;
use std::fs;

pub mod pipeline;
pub mod cache;
pub mod graph;

use pipeline::resolver::Resolver;
use pipeline::transformer::Transformer;
use cache::{AssetCache, CacheEntry};
use graph::DependencyGraph;

#[napi]
pub struct NativeWorker {
  pub pool_size: u32,
  cache: Arc<AssetCache>,
  graph: Arc<DependencyGraph>,
  resolver: Arc<Resolver>,
  transformer: Arc<Transformer>,
}

#[napi]
impl NativeWorker {
  #[napi(constructor)]
  pub fn new(pool_size: Option<u32>) -> Self {
    let size = pool_size.unwrap_or(4);
    
    NativeWorker {
      pool_size: size,
      cache: Arc::new(AssetCache::new()),
      graph: Arc::new(DependencyGraph::new()),
      resolver: Arc::new(Resolver::new()),
      transformer: Arc::new(Transformer::new()),
    }
  }

  #[napi]
  pub fn process_batch(&self, files: Vec<String>) -> Vec<String> {
    files.par_iter().map(|file_path| {
      self.process_file(file_path.clone())
    }).collect()
  }

  #[napi]
  pub fn process_file(&self, file_path: String) -> String {
    let file_path = file_path.as_str();
    // 1. Read file
    let content = match fs::read(file_path) {
        Ok(c) => c,
        Err(_) => return format!("Error: Could not read {}", file_path),
    };

    // 2. Compute Hash
    let mut hasher = Sha256::new();
    hasher.update(&content);
    let hash = hex::encode(hasher.finalize());

    // 3. Check Cache
    if let Some(entry) = self.cache.get(file_path) {
        if entry.hash == hash {
            return entry.content;
        }
    }

    // 4. Transform
    let code_str = String::from_utf8_lossy(&content);
    let transformed = self.transformer.transform(&code_str, file_path);

    // 5. Update Cache
    self.cache.insert(file_path.to_string(), CacheEntry {
        hash: hash.clone(),
        content: transformed.clone(),
    });

    // 6. Update Graph (Placeholder)
    self.graph.add_node(file_path.to_string());

    transformed
  }

  #[napi]
  pub fn get_cache_stats(&self) -> String {
    format!("Cache size: {}", self.cache.len())
  }
  
  #[napi]
  pub fn clear_cache(&self) {
    self.cache.clear();
  }

  #[napi]
  pub fn invalidate(&self, file_path: String) {
    // Remove from cache
    // Note: DashMap doesn't have a simple remove that returns nothing, but remove works.
    self.cache.remove(&file_path);
    // We don't remove from graph because the file still exists, just needs rebuild.
  }

  #[napi]
  pub fn rebuild(&self, file_path: String) -> Vec<String> {
    let mut affected = Vec::new();
    affected.push(file_path.clone());

    // Find dependents
    let dependents = self.graph.get_dependents(&file_path);
    for dep in dependents {
        // Invalidate dependent in cache too
        self.cache.remove(&dep);
        affected.push(dep);
    }
    
    // In a real scenario, we might recursively find dependents of dependents (transitive).
    // For now, direct dependents is a good start.
    
    affected
  }

  #[napi]
  pub fn resolve_dependency(&self, from: String, specifier: String) -> Option<String> {
      self.resolver.resolve(&specifier, &from)
  }
}


