use petgraph::graph::{Graph, NodeIndex};
use petgraph::Directed;
use std::collections::HashMap;
use std::sync::Mutex;

pub struct DependencyGraph {
    graph: Mutex<Graph<String, (), Directed>>,
    indices: Mutex<HashMap<String, NodeIndex>>,
}

impl DependencyGraph {
    pub fn new() -> Self {
        DependencyGraph {
            graph: Mutex::new(Graph::new()),
            indices: Mutex::new(HashMap::new()),
        }
    }

    pub fn add_node(&self, id: String) {
        let mut indices = self.indices.lock().unwrap();
        if !indices.contains_key(&id) {
            let mut graph = self.graph.lock().unwrap();
            let idx = graph.add_node(id.clone());
            indices.insert(id, idx);
        }
    }

    pub fn add_dependency(&self, from: &str, to: &str) {
        self.add_node(from.to_string());
        self.add_node(to.to_string());

        let indices = self.indices.lock().unwrap();
        let from_idx = indices.get(from).unwrap();
        let to_idx = indices.get(to).unwrap();

        let mut graph = self.graph.lock().unwrap();
        // Check if edge already exists to avoid duplicates
        if !graph.contains_edge(*from_idx, *to_idx) {
            graph.add_edge(*from_idx, *to_idx, ());
        }
    }

    pub fn get_dependents(&self, file: &str) -> Vec<String> {
        let indices = self.indices.lock().unwrap();
        if let Some(idx) = indices.get(file) {
            let graph = self.graph.lock().unwrap();
            // Find nodes that have an edge pointing TO this file (if A imports B, A -> B)
            graph.neighbors_directed(*idx, petgraph::Direction::Incoming)
                .map(|i| graph[i].clone())
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn detect_cycles(&self) -> Vec<String> {
        use petgraph::algo::tarjan_scc;
        let graph = self.graph.lock().unwrap();
        let scc = tarjan_scc(&*graph);
        
        let mut cycles = Vec::new();
        for component in scc {
            if component.len() > 1 {
                // It's a cycle
                let cycle_names: Vec<String> = component.iter().map(|idx| graph[*idx].clone()).collect();
                cycles.push(cycle_names.join(" -> "));
            } else if component.len() == 1 {
                // Check for self-loop
                let idx = component[0];
                if graph.contains_edge(idx, idx) {
                    cycles.push(graph[idx].clone());
                }
            }
        }
        cycles
    }
}
