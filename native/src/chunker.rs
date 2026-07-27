/// Phase 3.1 — Chunker + DCE (Dead Code Elimination / Tree Shaking)
use napi_derive::napi;
use napi::bindgen_prelude::*;
use serde_json::Value;
use std::collections::{HashMap, HashSet, VecDeque};

// ─── Public Config Types ───────────────────────────────────────────────────────

#[napi(object)]
#[derive(Clone)]
pub struct ChunkerConfig {
    pub strategy: String,
    pub max_chunk_size_kb: u32,
    pub entry_points: Vec<String>,
}

#[napi(object)]
pub struct ChunkOutput {
    pub hash: String,
    pub modules: Vec<String>,
    pub is_entry: bool,
    pub size_bytes: u32,
}

#[napi(object)]
pub struct ChunkerResult {
    pub chunks: Vec<ChunkOutput>,
    pub eliminated: Vec<String>,
    pub total_modules: u32,
    pub live_modules: u32,
}

// ─── Internal Graph ───────────────────────────────────────────────────────────

struct ModuleNode {
    #[allow(dead_code)] // stored for diagnostics and future source-map labeling
    id: String,
    imports: Vec<String>,
    size_bytes: u32,
}

struct DepGraph {
    nodes: HashMap<String, ModuleNode>,
}

impl DepGraph {
    fn from_json(graph_json: &str) -> std::result::Result<Self, String> {
        let v: Value = serde_json::from_str(graph_json)
            .map_err(|e| format!("Invalid graph JSON: {}", e))?;

        let mut nodes = HashMap::new();

        let modules: Vec<Value> = match &v {
            Value::Array(arr) => arr.iter().cloned().collect(),
            Value::Object(map) => {
                if let Some(Value::Array(mods)) = map.get("modules") {
                    mods.iter().cloned().collect()
                } else {
                    map.values().cloned().collect()
                }
            }
            _ => return Err("graph_json must be an array or object".to_string()),
        };

        for module in modules {
            let id = module["id"].as_str().unwrap_or("").to_string();
            if id.is_empty() { continue; }

            let imports = module["imports"]
                .as_array()
                .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                .unwrap_or_default();

            let size_bytes = module["sizeBytes"].as_u64().unwrap_or(0) as u32;
            nodes.insert(id.clone(), ModuleNode { id, imports, size_bytes });
        }

        Ok(Self { nodes })
    }

    fn reachable_from(&self, entries: &[String]) -> HashSet<String> {
        let mut visited: HashSet<String> = HashSet::new();
        let mut queue: VecDeque<String> = VecDeque::new();

        for entry in entries {
            if self.nodes.contains_key(entry.as_str()) {
                queue.push_back(entry.clone());
            }
        }

        while let Some(id) = queue.pop_front() {
            if visited.contains(&id) { continue; }
            visited.insert(id.clone());
            if let Some(node) = self.nodes.get(&id) {
                for dep in &node.imports {
                    if !visited.contains(dep.as_str()) {
                        queue.push_back(dep.clone());
                    }
                }
            }
        }

        visited
    }
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

fn short_hash(s: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut h = DefaultHasher::new();
    s.hash(&mut h);
    format!("{:016x}", h.finish())
}

fn split_into_chunks(
    live_modules: &[String],
    graph: &DepGraph,
    config: &ChunkerConfig,
) -> Vec<ChunkOutput> {
    if config.strategy == "manual" || config.max_chunk_size_kb == 0 {
        let content_key: String = live_modules.join("|");
        let size: u32 = live_modules.iter()
            .filter_map(|id| graph.nodes.get(id.as_str()))
            .map(|n| n.size_bytes)
            .sum();
        return vec![ChunkOutput {
            hash: short_hash(&content_key),
            modules: live_modules.to_vec(),
            is_entry: true,
            size_bytes: size,
        }];
    }

    let max_bytes = config.max_chunk_size_kb * 1024;
    let mut chunks: Vec<ChunkOutput> = Vec::new();
    let mut current: Vec<String> = Vec::new();
    let mut current_size: u32 = 0;
    let mut is_first = true;

    for id in live_modules {
        let size = graph.nodes.get(id.as_str()).map(|n| n.size_bytes).unwrap_or(0);
        if current_size + size > max_bytes && !current.is_empty() {
            chunks.push(ChunkOutput {
                hash: short_hash(&current.join("|")),
                modules: current.clone(),
                is_entry: is_first,
                size_bytes: current_size,
            });
            current.clear();
            current_size = 0;
            is_first = false;
        }
        current.push(id.clone());
        current_size += size;
    }

    if !current.is_empty() {
        chunks.push(ChunkOutput {
            hash: short_hash(&current.join("|")),
            modules: current,
            is_entry: is_first,
            size_bytes: current_size,
        });
    }

    chunks
}

// ─── N-API Export ─────────────────────────────────────────────────────────────

#[napi(js_name = "lunxChunk")]
pub fn lunx_chunk(graph_json: String, config: ChunkerConfig) -> Result<ChunkerResult> {
    let graph = DepGraph::from_json(&graph_json)
        .map_err(|e| Error::new(Status::GenericFailure, e))?;

    let total_modules = graph.nodes.len() as u32;
    let live_set = graph.reachable_from(&config.entry_points);

    let eliminated: Vec<String> = graph.nodes.keys()
        .filter(|id| !live_set.contains(id.as_str()))
        .cloned()
        .collect();

    let mut live_modules: Vec<String> = live_set.iter().cloned().collect();
    live_modules.sort();

    let live_count = live_modules.len() as u32;
    let chunks = split_into_chunks(&live_modules, &graph, &config);

    Ok(ChunkerResult { chunks, eliminated, total_modules, live_modules: live_count })
}
