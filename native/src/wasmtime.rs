use napi_derive::napi;
use napi::{Env, Result, Error, Status};
use wasmtime::*;
use anyhow::Context;
use std::sync::Mutex;

#[napi]
pub struct PluginRuntime {
    engine: Engine,
}

#[napi]
impl PluginRuntime {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let mut config = Config::new();
        config.consume_fuel(true);       // Enable CPU limits via fuel
        
        // Memory Limits (64MB)
        // Static memory max: 64MB
        config.static_memory_maximum_size(64 * 1024 * 1024);
        config.static_memory_guard_size(0);
        config.dynamic_memory_guard_size(0);
        
        let engine = Engine::new(&config).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        
        Ok(PluginRuntime { engine })
    }

    #[napi]
    pub fn verify_plugin(&self, wasm_bytes: &[u8]) -> Result<bool> {
        // Just checking if it compiles for now (Verification logic in Day 9)
        Module::validate(&self.engine, wasm_bytes)
            .map(|_| true)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid WASM: {}", e)))
    }

    #[napi]
    pub fn execute(&self, wasm_bytes: &[u8], input: String, timeout_ms: u32) -> Result<String> {
        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to compile: {}", e)))?;

        let mut store = Store::new(&self.engine, ());
        
        // Set Fuel (CPU limit approx) or use Epochs
        // 1 fuel ~ 1 instruction (roughly). 
        // 100ms is hard to map exactly to fuel without calibration, but let's say 1M instructions.
        store.set_fuel(1_000_000).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        
        // Create Linker (Sandbox: No WASI, only safe imports)
        let mut linker = Linker::new(&self.engine);
        
        // Define 'env.console_log' for debugging (safe)
        linker.func_wrap("env", "console_log", |mut caller: Caller<'_, ()>, ptr: i32, len: i32| {
            // In a real impl, we'd read memory. For MVP, just a stub or simple integer log if changed signature
            // Reading string from WASM memory requires knowning memory export.
            println!("[WASM] Log called"); 
        }).unwrap();

        let instance = linker.instantiate(&mut store, &module)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to instantiate: {}", e)))?;

        // Expect 'transform' export
        let transform = instance.get_typed_func::<(), ()>(&mut store, "transform")
            .or_else(|_| instance.get_typed_func::<(), ()>(&mut store, "main")) // Fallback
            .map_err(|_| Error::new(Status::GenericFailure, "Plugin must export 'transform' or 'main'".to_string()))?;

        // Execute with limit
        // Wasmtime traps if fuel runs out
        match transform.call(&mut store, ()) {
            Ok(_) => Ok("Success".to_string()), // We need to return actual output. MVP: Just success status.
            Err(e) => {
                // Check if it was a fuel trap
                // For now, return error string
                Err(Error::new(Status::GenericFailure, format!("Execution Failed: {}", e)))
            }
        }
    }
}
