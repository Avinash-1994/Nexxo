use napi_derive::napi;
// use napi::bindgen_prelude::*;
// use sha2::{Sha256, Digest};
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

    // 2. Compute Faster Hash (XXH3 - Phase 4.2)
    use xxhash_rust::xxh3::xxh3_64;
    let hash = format!("{:x}", xxh3_64(&content));

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

    // 6. Update Graph (Local)
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
    self.cache.remove(&file_path);
  }

  #[napi]
  pub fn rebuild(&self, file_path: String) -> Vec<String> {
    let mut affected = Vec::new();
    affected.push(file_path.clone());

    let dependents = self.graph.get_dependents(&file_path);
    for dep in dependents {
        self.cache.remove(&dep);
        affected.push(dep);
    }
    
    affected
  }

  #[napi]
  pub fn resolve_dependency(&self, from: String, specifier: String) -> Option<String> {
      self.resolver.resolve(&specifier, &from)
  }

  #[napi]
  pub fn fast_hash(&self, content: String) -> String {
    use xxhash_rust::xxh3::xxh3_64;
    format!("{:x}", xxh3_64(content.as_bytes()))
  }

  #[napi]
  pub fn process_asset(&self, content: napi::bindgen_prelude::Uint8Array) -> String {
    use xxhash_rust::xxh3::xxh3_64;
    format!("{:x}", xxh3_64(content.as_ref()))
  }

  #[napi]
  pub fn scan_imports(&self, code: String) -> Vec<String> {
    use regex::Regex;
    use std::collections::HashSet;
    use lazy_static::lazy_static;

    lazy_static! {
        static ref RE: Regex = Regex::new(r#"(?:import|export)\s+.*?\s+from\s+['"](.*?)['"]|import\(['"](.*?)['"]\)|require\(['"](.*?)['"]\)"#).unwrap();
    }

    let mut imports = HashSet::new();
    for cap in RE.captures_iter(&code) {
        if let Some(m) = cap.get(1).or(cap.get(2)).or(cap.get(3)) {
            imports.insert(m.as_str().to_string());
        }
    }
    
    imports.into_iter().collect()
  }
}

#[napi]
pub struct GraphAnalyzer {
    inner: graph::DependencyGraph,
}

#[napi]
impl GraphAnalyzer {
    #[napi(constructor)]
    pub fn new() -> Self {
        GraphAnalyzer {
            inner: graph::DependencyGraph::new(),
        }
    }

    #[napi]
    pub fn add_node(&self, id: String) {
        self.inner.add_node(id);
    }

    #[napi]
    pub fn add_dependency(&self, from: String, to: String) {
        self.inner.add_dependency(&from, &to);
    }

    #[napi]
    pub fn add_batch(&self, ids: Vec<String>, edges: Vec<Vec<String>>) {
        for (i, id) in ids.iter().enumerate() {
            self.inner.add_node(id.clone());
            if let Some(current_edges) = edges.get(i) {
                for edge in current_edges {
                    self.inner.add_dependency(id, edge);
                }
            }
        }
    }

    #[napi]
    pub fn detect_cycles(&self) -> Vec<String> {
        self.inner.detect_cycles()
    }
}


