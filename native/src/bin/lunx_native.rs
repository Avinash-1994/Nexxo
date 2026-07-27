use serde::Deserialize;
use std::fs;
use std::env;
use lunx_native::GraphAnalyzer;

#[derive(Deserialize, Debug)]
struct Snapshot {
    #[allow(dead_code)] // reserved for future selective-replay by entry point
    entry_points: Vec<String>,
    ids: Vec<String>,
    edges: Vec<Vec<String>>,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 || args[1] != "replay" {
        eprintln!("Usage: lunx-native replay <snapshot.json>");
        std::process::exit(1);
    }

    let snapshot_file = &args[2];
    println!("Replaying snapshot: {}", snapshot_file);

    let content = match fs::read_to_string(snapshot_file) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to read snapshot file: {}", e);
            std::process::exit(1);
        }
    };

    let snapshot: Snapshot = match serde_json::from_str(&content) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to parse snapshot JSON: {}", e);
            std::process::exit(1);
        }
    };

    let mut analyzer = GraphAnalyzer::new();
    println!("Loaded graph with {} batch items.", snapshot.ids.len());

    analyzer.add_batch(snapshot.ids, snapshot.edges);
    
    println!("Running cycle detection...");
    
    let cycles = analyzer.detect_cycles();
    if cycles.is_empty() {
        println!("No cycles detected.");
    } else {
        println!("Detected {} cycle(s).", cycles.len());
        for c in cycles {
            println!("  Cycle entry: {} -> {:?}", c.entry_point, c.cycle);
        }
    }

    println!("Graph analysis replay complete.");
}
