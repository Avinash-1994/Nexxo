use napi_derive::napi;
use std::collections::{HashMap, VecDeque};

/// Fast graph operations for dependency analysis
/// 
/// Performance-critical operations implemented in Rust:
/// - Circular dependency detection (DFS-based, O(V+E))
/// - Topological sorting (Kahn's algorithm, O(V+E))
/// - Reachability analysis (BFS, O(V+E))
/// - Tree shaking (mark-and-sweep, O(V+E))

#[napi(object)]
pub struct GraphNode {
    pub id: String,
    pub dependencies: Vec<String>,
}

#[napi(object)]
pub struct CircularDependency {
    pub cycle: Vec<String>,
    pub entry_point: String,
}

#[napi(object)]
pub struct GraphAnalysisResult {
    pub has_cycles: bool,
    pub cycles: Vec<CircularDependency>,
    pub orphaned_nodes: Vec<String>,
    pub entry_points: Vec<String>,
    pub total_nodes: u32,
    pub total_edges: u32,
}

/// High-performance graph analyzer using Integer-based Adjacency List
/// Uses string interning to map Strings <-> usize IDs for O(1) lookups and cache efficiency
#[napi]
pub struct GraphAnalyzer {
    // String Interning
    node_to_id: HashMap<String, usize>,
    id_to_node: Vec<String>,
    
    // Adjacency List (Integer based)
    adj_list: Vec<Vec<usize>>,
}

#[napi]
impl GraphAnalyzer {
    /// Create a new graph analyzer
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            node_to_id: HashMap::new(),
            id_to_node: Vec::new(),
            adj_list: Vec::new(),
        }
    }

    /// Internal helper: Get or create ID for a string
    fn get_or_create_id(&mut self, id: String) -> usize {
        if let Some(&uid) = self.node_to_id.get(&id) {
            uid
        } else {
            let uid = self.id_to_node.len();
            self.node_to_id.insert(id.clone(), uid);
            self.id_to_node.push(id);
            self.adj_list.push(Vec::new()); // Grow adjacency list
            uid
        }
    }
    
    /// Internal helper: Get ID for a string (if exists)
    fn get_id(&self, id: &str) -> Option<usize> {
        self.node_to_id.get(id).copied()
    }

    /// Add a node with its dependencies
    #[napi]
    pub fn add_node(&mut self, id: String, dependencies: Vec<String>) {
        let u_id = self.get_or_create_id(id);
        
        let mut deps_indices = Vec::with_capacity(dependencies.len());
        for dep in dependencies {
            deps_indices.push(self.get_or_create_id(dep));
        }
        
        // Update adjacency list
        self.adj_list[u_id] = deps_indices;
    }

    /// Batch add nodes to minimize NAPI bridge overhead
    /// Format: ids list, and flat list of dependencies with counts
    /// This avoids creating thousands of small arrays
    #[napi]
    pub fn add_batch(&mut self, ids: Vec<String>, edges: Vec<Vec<String>>) {
        // Pre-allocate to avoid resizing
        self.id_to_node.reserve(ids.len());
        
        for (i, id) in ids.into_iter().enumerate() {
            let u_id = self.get_or_create_id(id);
            
            // Getting deps from the parallel vector
            if let Some(deps) = edges.get(i) {
                let mut deps_indices = Vec::with_capacity(deps.len());
                for dep in deps {
                    deps_indices.push(self.get_or_create_id(dep.clone()));
                }
                self.adj_list[u_id] = deps_indices;
            }
        }
    }

    /// Detect circular dependencies using Iterative DFS
    /// Uses explicit stack to avoid stack overflow on deep graphs (unlike JS recursion)
    #[napi]
    pub fn detect_cycles(&self) -> Vec<CircularDependency> {
        let node_count = self.adj_list.len();
        let mut cycles = Vec::new();
        
        let mut visited = vec![false; node_count];
        let mut on_stack = vec![false; node_count];
        let mut path = Vec::with_capacity(node_count);
        
        // Stack for DFS: (u, child_index)
        let mut stack: Vec<(usize, usize)> = Vec::new();

        for i in 0..node_count {
            if visited[i] { continue; }

            stack.push((i, 0));
            visited[i] = true;
            on_stack[i] = true;
            path.push(i);

            while let Some((u, child_idx)) = stack.pop() {
                if child_idx < self.adj_list[u].len() {
                    // Push node back with next child index
                    stack.push((u, child_idx + 1));
                    
                    let v = self.adj_list[u][child_idx];
                    
                    if !visited[v] {
                        visited[v] = true;
                        on_stack[v] = true;
                        path.push(v);
                        stack.push((v, 0)); // Start DFS on child
                    } else if on_stack[v] {
                        // Cycle detected
                        if let Some(cycle_start_idx) = path.iter().position(|&x| x == v) {
                            let cycle_ids = &path[cycle_start_idx..];
                            let cycle_strs: Vec<String> = cycle_ids
                                .iter()
                                .map(|&id| self.id_to_node[id].clone())
                                .collect();
                                
                            cycles.push(CircularDependency {
                                cycle: cycle_strs,
                                entry_point: self.id_to_node[v].clone(),
                            });
                        }
                    }
                } else {
                    // Finished processing all children of u
                    on_stack[u] = false;
                    path.pop();
                }
            }
        }

        cycles
    }

    // Removed recursive dfs_detect_cycle helper

    /// Find orphaned nodes (not reachable from any entry point)
    #[napi]
    pub fn find_orphaned_nodes(&self, entry_points: Vec<String>) -> Vec<String> {
        let node_count = self.adj_list.len();
        let mut reachable = vec![false; node_count];
        let mut queue = VecDeque::new();

        // Convert entry points to IDs
        for entry in entry_points {
            if let Some(id) = self.get_id(&entry) {
                if !reachable[id] {
                    reachable[id] = true;
                    queue.push_back(id);
                }
            }
        }

        // BFS using integers
        while let Some(u) = queue.pop_front() {
            for &v in &self.adj_list[u] {
                if !reachable[v] {
                    reachable[v] = true;
                    queue.push_back(v);
                }
            }
        }

        // Collect unreachable nodes
        let mut orphaned = Vec::new();
        for i in 0..node_count {
            if !reachable[i] {
                orphaned.push(self.id_to_node[i].clone());
            }
        }
        
        orphaned
    }

    /// Perform complete graph analysis
    #[napi]
    pub fn analyze(&self, entry_points: Vec<String>) -> GraphAnalysisResult {
        let cycles = self.detect_cycles();
        let orphaned = self.find_orphaned_nodes(entry_points.clone());
        
        let total_edges: usize = self.adj_list.iter().map(|deps| deps.len()).sum();

        GraphAnalysisResult {
            has_cycles: !cycles.is_empty(),
            cycles,
            orphaned_nodes: orphaned,
            entry_points,
            total_nodes: self.id_to_node.len() as u32,
            total_edges: total_edges as u32,
        }
    }

    /// Topological sort using Kahn's algorithm
    #[napi]
    pub fn topological_sort(&self) -> Option<Vec<String>> {
        let node_count = self.adj_list.len();
        let mut in_degree = vec![0; node_count];
        let mut queue = VecDeque::new();
        let mut result_ids = Vec::with_capacity(node_count);

        // Calculate in-degrees
        for deps in &self.adj_list {
            for &v in deps {
                in_degree[v] += 1;
            }
        }

        // Init queue
        for i in 0..node_count {
            if in_degree[i] == 0 {
                queue.push_back(i);
            }
        }

        // Process
        while let Some(u) = queue.pop_front() {
            result_ids.push(u);

            for &v in &self.adj_list[u] {
                in_degree[v] -= 1;
                if in_degree[v] == 0 {
                    queue.push_back(v);
                }
            }
        }

        if result_ids.len() == node_count {
            // Map back to strings
            Some(result_ids.into_iter().map(|id| self.id_to_node[id].clone()).collect())
        } else {
            None // Cycle detected
        }
    }

    /// Get node count
    #[napi]
    pub fn node_count(&self) -> u32 {
        self.id_to_node.len() as u32
    }

    /// Get edge count
    #[napi]
    pub fn edge_count(&self) -> u32 {
        self.adj_list.iter().map(|deps| deps.len()).sum::<usize>() as u32
    }

    /// Clear all nodes
    #[napi]
    pub fn clear(&mut self) {
        self.node_to_id.clear();
        self.id_to_node.clear();
        self.adj_list.clear();
    }
}

/// Fast content hashing for cache keys
/// Uses XXH3 (ultra-fast non-cryptographic hash)
#[napi]
pub fn fast_hash(content: String) -> String {
    use xxhash_rust::xxh3::xxh3_64;
    let hash = xxh3_64(content.as_bytes());
    format!("{:x}", hash)
}

/// Batch hash multiple files (parallel processing in future)
#[napi]
pub fn batch_hash(contents: Vec<String>) -> Vec<String> {
    contents
        .into_iter()
        .map(|content| fast_hash(content))
        .collect()
}

/// Natively scan for imports/requires (Phase 4.2 Hot Path)
/// This is significantly faster than JS-based regex or full AST parsing
#[napi]
pub fn scan_imports(code: String) -> Vec<String> {
    use regex::Regex;
    use std::collections::HashSet;

    lazy_static::lazy_static! {
        static ref RE: Regex = Regex::new(r#"(?:import|export)\s+.*\s+from\s+['"](.*)['"]|import\(['"](.*)['"]\)|require\(['"](.*)['"]\)"#).unwrap();
    }

    let mut imports = HashSet::new();
    for cap in RE.captures_iter(&code) {
        if let Some(m) = cap.get(1).or(cap.get(2)).or(cap.get(3)) {
            imports.insert(m.as_str().to_string());
        }
    }
    
    imports.into_iter().collect()
}

/// Fast string operations for module resolution
#[napi]
pub fn normalize_path(path: String) -> String {
    path.replace('\\', "/")
}

/// Benchmark graph operations
#[napi]
pub fn benchmark_graph_analysis(node_count: u32, edge_density: f64) -> f64 {
    use std::time::Instant;

    let mut analyzer = GraphAnalyzer::new();

    // Generate test graph
    for i in 0..node_count {
        let mut deps = Vec::new();
        let dep_count = (node_count as f64 * edge_density) as usize;
        for j in 0..dep_count {
            let dep_id = ((i + j as u32 + 1) % node_count).to_string();
            deps.push(dep_id);
        }
        analyzer.add_node(i.to_string(), deps);
    }

    // Benchmark cycle detection
    let start = Instant::now();
    let _ = analyzer.detect_cycles();
    let duration = start.elapsed();

    duration.as_secs_f64()
}
