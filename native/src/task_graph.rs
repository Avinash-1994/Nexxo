/// Phase 4.1 — Incremental Task Graph (beats Turbopack's core model)
///
/// Every build step is a Task with stable input hashes + a fn_hash.
/// fn_hash = SWC version + LightningCSS version + config hash combined.
/// A dependency version upgrade automatically invalidates all affected tasks.
///
/// N-API export (new, additive): planBuild(manifest: string): TaskPlan
use napi_derive::napi;
use napi::bindgen_prelude::*;
use serde_json::Value;
use std::collections::{HashMap, VecDeque};
use xxhash_rust::xxh3::xxh3_64;

// ─── Types ────────────────────────────────────────────────────────────────────

#[napi(object)]
#[derive(Clone)]
pub struct Task {
    /// Stable content-addressable ID
    pub id: String,
    /// The ID of the module this task belongs to
    pub module_id: String,
    /// File hashes of all inputs (source files)
    pub inputs: Vec<String>,
    /// Cache keys of expected outputs (artifact keys)
    pub outputs: Vec<String>,
    /// Hash of the transform function version used for this task.
    /// SWC version + LightningCSS version + config hash.
    /// When a dep upgrades, fn_hash changes → task auto-invalidates.
    pub fn_hash: String,
    /// true = cache hit, skip transform
    pub cached: bool,
}

#[napi(object)]
pub struct TaskPlan {
    /// Ordered list of tasks (topological, respecting deps)
    pub tasks: Vec<Task>,
    /// Total number of tasks
    pub total: u32,
    /// How many are already cached
    pub cached_count: u32,
    /// How many need executing
    pub pending_count: u32,
    /// Stable plan fingerprint (changes when ANY input or fn_hash changes)
    pub plan_hash: String,
}

// ─── Internal graph ───────────────────────────────────────────────────────────

struct TaskNode {
    #[allow(dead_code)] // stable task ID, exposed in future plan diffing API
    id: String,
    inputs: Vec<String>,
    outputs: Vec<String>,
    #[allow(dead_code)] // retained for future fn-level cache invalidation
    fn_hash: u64,
    deps: Vec<String>, // task IDs this task depends on
    #[allow(dead_code)] // cache-hit flag, wired into pending_count via plan
    cached: bool,
}

fn compute_fn_hash(swc_version: &str, css_version: &str, config_hash: &str) -> u64 {
    let combined = format!("{}:{}:{}", swc_version, css_version, config_hash);
    xxh3_64(combined.as_bytes())
}

fn compute_task_id(inputs: &[String], fn_hash: u64) -> String {
    let content = format!("{}:{}", inputs.join("|"), fn_hash);
    format!("{:016x}", xxh3_64(content.as_bytes()))
}

/// Topological sort (Kahn's algorithm) — stable ordering
fn topo_sort(nodes: &HashMap<String, TaskNode>) -> Vec<String> {
    let mut in_degree: HashMap<String, usize> = nodes.keys().map(|k| (k.clone(), 0)).collect();
    let mut dependents: HashMap<String, Vec<String>> = HashMap::new();

    for (id, node) in nodes {
        for dep in &node.deps {
            *in_degree.entry(id.clone()).or_insert(0) += 1;
            dependents.entry(dep.clone()).or_default().push(id.clone());
        }
    }

    let mut queue: VecDeque<String> = in_degree
        .iter()
        .filter(|(_, &deg)| deg == 0)
        .map(|(id, _)| id.clone())
        .collect();
    queue = {
        let mut v: Vec<_> = queue.into_iter().collect();
        v.sort(); // deterministic
        VecDeque::from(v)
    };

    let mut order = Vec::new();
    while let Some(id) = queue.pop_front() {
        order.push(id.clone());
        if let Some(deps_on) = dependents.get(&id) {
            let mut next: Vec<_> = deps_on.iter()
                .filter_map(|dep_id| {
                    let deg = in_degree.get_mut(dep_id)?;
                    *deg -= 1;
                    if *deg == 0 { Some(dep_id.clone()) } else { None }
                })
                .collect();
            next.sort();
            queue.extend(next);
        }
    }

    order
}

// ─── N-API Export ─────────────────────────────────────────────────────────────

/// planBuild(manifest: string): TaskPlan
///
/// manifest JSON schema:
/// {
///   "swcVersion": "0.90.x",
///   "cssVersion": "1.0.0-alpha.58",
///   "configHash": "<xxh3 of lunx.config>",
///   "modules": [
///     {
///       "id": "abc123",
///       "inputFiles": ["src/main.ts"],
///       "inputHashes": ["<content hash>"],
///       "outputs": ["dist/main.js"],
///       "deps": ["dep-task-id"],
///       "cachedHash": "<previously stored plan hash or empty>"
///     }
///   ]
/// }
#[napi(js_name = "planBuild")]
pub fn plan_build(manifest_json: String) -> Result<TaskPlan> {
    let v: Value = serde_json::from_str(&manifest_json)
        .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid manifest: {}", e)))?;

    let swc_version = v["swcVersion"].as_str().unwrap_or("0.90");
    let css_version = v["cssVersion"].as_str().unwrap_or("1.0.0");
    let config_hash = v["configHash"].as_str().unwrap_or("");
    let fn_hash_val = compute_fn_hash(swc_version, css_version, config_hash);
    let fn_hash_str = format!("{:016x}", fn_hash_val);

    let modules = v["modules"].as_array().map(|a| a.as_slice()).unwrap_or(&[]);

    let mut nodes: HashMap<String, TaskNode> = HashMap::new();

    for m in modules {
        let mod_id = m["id"].as_str().unwrap_or("").to_string();
        if mod_id.is_empty() { continue; }

        let input_hashes: Vec<String> = m["inputHashes"]
            .as_array()
            .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default();

        let outputs: Vec<String> = m["outputs"]
            .as_array()
            .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default();

        let deps: Vec<String> = m["deps"]
            .as_array()
            .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default();

        let cached_hash = m["cachedHash"].as_str().unwrap_or("");
        let task_id = compute_task_id(&input_hashes, fn_hash_val);

        // Cache hit: task ID (= fingerprint of inputs + fn_hash) matches stored hash
        let cached = !cached_hash.is_empty() && cached_hash == task_id;

        nodes.insert(mod_id.clone(), TaskNode {
            id: "".to_string(), // Will compute in topo order
            inputs: input_hashes,
            outputs,
            fn_hash: fn_hash_val,
            deps,
            cached, // true = cache hit, skip transform
        });
    }

    // Topological ordering
    let order = topo_sort(&nodes);

    let mut tasks: Vec<Task> = Vec::with_capacity(order.len());
    let mut cached_count = 0u32;
    let mut plan_content = String::new();

    // Map module ID -> computed task ID
    let mut computed_task_ids: HashMap<String, String> = HashMap::new();

    for mod_id in &order {
        if let Some(node) = nodes.get(mod_id) {
            // Collect deps' task IDs
            let mut dep_task_ids: Vec<String> = Vec::new();
            for dep in &node.deps {
                if let Some(dep_id) = computed_task_ids.get(dep) {
                    dep_task_ids.push(dep_id.clone());
                }
            }
            dep_task_ids.sort(); // Deterministic

            // Compute task ID including deps
            let mut combined_inputs = node.inputs.clone();
            combined_inputs.extend(dep_task_ids);
            
            let task_id = compute_task_id(&combined_inputs, fn_hash_val);
            computed_task_ids.insert(mod_id.clone(), task_id.clone());

            // Look up the cached hash from the original manifest to see if it matches
            let mut cached = false;
            for m in modules {
                if m["id"].as_str().unwrap_or("") == mod_id {
                    let cached_hash = m["cachedHash"].as_str().unwrap_or("");
                    cached = !cached_hash.is_empty() && cached_hash == task_id;
                    break;
                }
            }

            plan_content.push_str(&task_id);
            if cached { cached_count += 1; }
            tasks.push(Task {
                id: task_id.clone(),
                module_id: mod_id.clone(),
                inputs: node.inputs.clone(),
                outputs: node.outputs.clone(),
                fn_hash: fn_hash_str.clone(),
                cached,
            });
        }
    }

    let total = tasks.len() as u32;
    let pending_count = total - cached_count;
    let plan_hash = format!("{:016x}", xxh3_64(plan_content.as_bytes()));

    Ok(TaskPlan { tasks, total, cached_count, pending_count, plan_hash })
}
