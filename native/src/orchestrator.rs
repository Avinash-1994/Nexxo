// Tokio-based parallel orchestrator for Nexxo v2.0
// Day 2: Module 1 - Speed Mastery
//
// This module provides multi-core parallel orchestration with:
// - Work-stealing scheduler for optimal CPU utilization
// - Parallel workers for graph/plan/execute stages
// - Deterministic stable IDs
// - Structured event logging

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use rayon::prelude::*;

/// Build stage for orchestration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(string_enum)]
pub enum BuildStage {
    Init,
    Graph,
    Plan,
    DeterminismCheck,
    Execute,
    Emit,
}

/// Build event for structured logging
#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct BuildEvent {
    pub stage: String,
    pub message: String,
    pub timestamp: i64,
    pub duration_ms: Option<f64>,
    pub metadata: Option<String>, // JSON string
}

/// Orchestrator statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct OrchestratorStats {
    pub total_tasks: u32,
    pub completed_tasks: u32,
    pub failed_tasks: u32,
    pub total_duration_ms: f64,
    pub parallelism: u32,
}

// Unused TaskResult struct removed
// pub struct TaskResult { ... }

/// Tokio-based build orchestrator
#[napi]
pub struct BuildOrchestrator {
    runtime: Arc<tokio::runtime::Runtime>,
    events: Arc<RwLock<Vec<BuildEvent>>>,
    stats: Arc<RwLock<OrchestratorStats>>,
    parallelism: u32,
}

#[napi]
impl BuildOrchestrator {
    /// Create a new orchestrator with specified parallelism
    #[napi(constructor)]
    pub fn new(parallelism: Option<u32>) -> Result<Self> {
        let parallelism = parallelism.unwrap_or_else(|| num_cpus::get() as u32);
        
        // Create Tokio runtime with work-stealing scheduler
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(parallelism as usize)
            .thread_name("nexxo-worker")
            .enable_all()
            .build()
            .map_err(|e| Error::from_reason(format!("Failed to create runtime: {}", e)))?;
        
        Ok(Self {
            runtime: Arc::new(runtime),
            events: Arc::new(RwLock::new(Vec::new())),
            stats: Arc::new(RwLock::new(OrchestratorStats {
                total_tasks: 0,
                completed_tasks: 0,
                failed_tasks: 0,
                total_duration_ms: 0.0,
                parallelism,
            })),
            parallelism,
        })
    }
    
    /// Log a build event
    #[napi]
    pub async fn log_event(&self, stage: String, message: String, duration_ms: Option<f64>) -> Result<()> {
        let event = BuildEvent {
            stage,
            message,
            timestamp: chrono::Utc::now().timestamp_millis(),
            duration_ms,
            metadata: None,
        };
        
        let mut events = self.events.write().await;
        events.push(event);
        Ok(())
    }
    
    /// Get all logged events
    #[napi]
    pub async fn get_events(&self) -> Result<Vec<BuildEvent>> {
        let events = self.events.read().await;
        Ok(events.clone())
    }
    
    /// Clear all events
    #[napi]
    pub async fn clear_events(&self) -> Result<()> {
        let mut events = self.events.write().await;
        events.clear();
        Ok(())
    }
    
    /// Execute tasks in parallel
    #[napi]
    pub async fn execute_parallel(&self, task_count: u32) -> Result<OrchestratorStats> {
        let start = std::time::Instant::now();
        
        // Simulate parallel task execution
        let tasks: Vec<_> = (0..task_count)
            .map(|i| {
                let runtime = self.runtime.clone();
                runtime.spawn(async move {
                    // Simulate work
                    tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                    i
                })
            })
            .collect();
        
        // Wait for all tasks to complete
        let mut completed = 0u32;
        for task in tasks {
            if task.await.is_ok() {
                completed += 1;
            }
        }
        
        let duration = start.elapsed();
        
        // Update stats
        let mut stats = self.stats.write().await;
        stats.total_tasks += task_count;
        stats.completed_tasks += completed;
        stats.failed_tasks += task_count - completed;
        stats.total_duration_ms += duration.as_secs_f64() * 1000.0;
        
        Ok(stats.clone())
    }
    
    /// Process items in parallel using Rayon
    #[napi]
    pub fn process_parallel_sync(&self, items: Vec<String>) -> Result<Vec<String>> {
        // Use Rayon for CPU-bound parallel processing
        let results: Vec<String> = items
            .par_iter()
            .map(|item| {
                // Simulate processing (e.g., hashing, parsing)
                format!("processed:{}", item)
            })
            .collect();
        
        Ok(results)
    }
    
    /// Generate deterministic stable ID from content
    #[napi]
    pub fn generate_stable_id(&self, content: String, prefix: String) -> String {
        use xxhash_rust::xxh3::xxh3_64;
        let hash = xxh3_64(content.as_bytes());
        format!("{}:{:016x}", prefix, hash)
    }
    
    /// Batch generate stable IDs
    #[napi]
    pub fn batch_generate_ids(&self, items: Vec<String>, prefix: String) -> Result<Vec<String>> {
        let ids: Vec<String> = items
            .par_iter()
            .map(|item| self.generate_stable_id(item.clone(), prefix.clone()))
            .collect();
        
        Ok(ids)
    }
    
    /// Get orchestrator statistics
    #[napi]
    pub async fn get_stats(&self) -> Result<OrchestratorStats> {
        let stats = self.stats.read().await;
        Ok(stats.clone())
    }
    
    /// Get parallelism level
    #[napi(getter)]
    pub fn get_parallelism(&self) -> u32 {
        self.parallelism
    }
    
    /// Shutdown the orchestrator
    #[napi]
    pub fn shutdown(&self) -> Result<()> {
        // Runtime will be dropped when Arc count reaches 0
        Ok(())
    }
}

/// Helper function to get optimal parallelism
#[napi]
pub fn get_optimal_parallelism() -> u32 {
    num_cpus::get() as u32
}

/// Benchmark parallel vs sequential processing
#[napi]
pub fn benchmark_parallelism(item_count: u32) -> Result<HashMap<String, f64>> {
    use std::time::Instant;
    
    let items: Vec<String> = (0..item_count)
        .map(|i| format!("item_{}", i))
        .collect();
    
    // Sequential processing
    let start = Instant::now();
    let _seq_results: Vec<String> = items
        .iter()
        .map(|item| format!("processed:{}", item))
        .collect();
    let seq_duration = start.elapsed().as_secs_f64() * 1000.0;
    
    // Parallel processing
    let start = Instant::now();
    let _par_results: Vec<String> = items
        .par_iter()
        .map(|item| format!("processed:{}", item))
        .collect();
    let par_duration = start.elapsed().as_secs_f64() * 1000.0;
    
    let mut results = HashMap::new();
    results.insert("sequential_ms".to_string(), seq_duration);
    results.insert("parallel_ms".to_string(), par_duration);
    results.insert("speedup".to_string(), seq_duration / par_duration);
    
    Ok(results)
}

// Add num_cpus dependency helper
mod num_cpus {
    pub fn get() -> usize {
        std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(4)
    }
}
