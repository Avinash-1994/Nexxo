use napi_derive::napi;
use napi::{Error, Status};
use wasmtime::*;
// use anyhow::Context; // Unused
// use std::sync::Mutex; // Unused

#[napi]
pub struct PluginRuntime {
    engine: Engine,
}

#[napi]
impl PluginRuntime {
    #[napi(constructor)]
    pub fn new() -> napi::Result<Self> {
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
    pub fn verify_plugin(&self, wasm_bytes: &[u8]) -> napi::Result<bool> {
        // Just checking if it compiles for now (Verification logic in Day 9)
        Module::validate(&self.engine, wasm_bytes)
            .map(|_| true)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid WASM: {}", e)))
    }

    #[napi]
    pub fn execute(&self, wasm_bytes: &[u8], _input: String, _timeout_ms: u32) -> napi::Result<String> {
        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to compile: {}", e)))?;

        let mut store = Store::new(&self.engine, ());
        
        // 1 fuel ~ 1 instruction (roughly). 
        // 1M instructions is generous for small tests.
        store.set_fuel(1_000_000).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        
        let mut linker = Linker::new(&self.engine);
        
        // Define 'env.console_log' safetly
        linker.func_wrap("env", "console_log", |mut _caller: Caller<'_, ()>, _ptr: i32, _len: i32| {
            // println!("[WASM] Log called"); // Avoid printing during potential stress tests to keep noise down
        }).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to define imports: {}", e)))?;

        let instance = linker.instantiate(&mut store, &module)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to instantiate: {}", e)))?;

        let transform = instance.get_typed_func::<(), ()>(&mut store, "transform")
            .or_else(|_| instance.get_typed_func::<(), ()>(&mut store, "main"))
            .map_err(|_| Error::new(Status::GenericFailure, "Plugin must export 'transform' or 'main'".to_string()))?;

        // Execute with limit
        match transform.call(&mut store, ()) {
            Ok(_) => Ok("Success".to_string()),
            Err(e) => {
                // Return the error string to be handled by JS (checking for "fuel" or "timeout")
                Err(Error::new(Status::GenericFailure, format!("Execution Failed: {}", e)))
            }
        }
    }
}
