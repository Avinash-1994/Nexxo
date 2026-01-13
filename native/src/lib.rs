// High-performance native modules for Nexxo
// Focus: Speed and minimal bundle size

mod graph;
mod orchestrator; // Day 2: Tokio orchestrator
mod cache;        // Day 2: RocksDB cache
mod wasmtime;     // Day 8: WASM Runtime

// Re-export wasmtime module
pub use wasmtime::{PluginRuntime};

// Re-export graph module
pub use graph::{
  GraphAnalyzer, GraphNode, CircularDependency, GraphAnalysisResult, 
  fast_hash, batch_hash, scan_imports, normalize_path
};

// Re-export orchestrator module
pub use orchestrator::{
  BuildOrchestrator, BuildEvent, OrchestratorStats,
  get_optimal_parallelism, benchmark_parallelism
};

// Re-export cache module
pub use cache::{
  BuildCache, CacheStats,
  create_input_key, create_graph_key, create_plan_key, create_artifact_key
};

use napi::bindgen_prelude::*;
use napi_derive::napi;

/// High-performance native worker for plugin transformations
#[napi]
pub struct NativeWorker {
  pool_size: u32,
}

#[napi]
impl NativeWorker {
  /// Create a new native worker with specified pool size
  #[napi(constructor)]
  pub fn new(pool_size: Option<u32>) -> Self {
    Self {
      pool_size: pool_size.unwrap_or(4),
    }
  }

  /// Transform code using a simple regex-based approach
  /// In a real implementation, this would load and execute actual plugins
  #[napi]
  pub fn transform_sync(&self, code: String, _id: String) -> String {
    // Simple example: replace console.log with console.debug
    // In production, this would load and execute actual Rust plugins
    code.replace("console.log", "console.debug")
  }

  /// Async version of transform for non-blocking operations
  #[napi]
  pub async fn transform(&self, code: String, id: String) -> Result<String> {
    // Simulate async plugin execution
    let result = self.transform_sync(code, id);
    Ok(result)
  }

  /// Get the pool size
  #[napi(getter)]
  pub fn get_pool_size(&self) -> u32 {
    self.pool_size
  }
}

/// Simple function to test native bindings
#[napi]
pub fn hello_rust() -> String {
  "Hello from Rust Native Worker!".to_string()
}

/// Benchmark function to compare performance
#[napi]
pub fn benchmark_transform(code: String, iterations: u32) -> f64 {
  use std::time::Instant;
  
  let start = Instant::now();
  for _ in 0..iterations {
    let _ = code.replace("console.log", "console.debug");
  }
  let duration = start.elapsed();
  
  duration.as_secs_f64()
}
