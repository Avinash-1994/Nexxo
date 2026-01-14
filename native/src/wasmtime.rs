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
        // Enable fuel-based CPU limiting
        config.consume_fuel(true);
        
        // Memory Limits (64MB)
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
        use std::thread;
        
        let engine = self.engine.clone();
        let wasm_vec = wasm_bytes.to_vec();
        
        // Run in a separate thread to isolate panics (essential for Windows FFI stability)
        let handle = thread::spawn(move || {
            let module = Module::new(&engine, &wasm_vec)
                .map_err(|e| format!("Failed to compile: {}", e))?;

            let mut store = Store::new(&engine, ());
            
            // Set fuel limit
            store.set_fuel(100_000).map_err(|e| format!("Failed to set fuel: {}", e))?;
            
            let mut linker = Linker::new(&engine);
            
            // Define imports
            linker.func_wrap("env", "console_log", |_caller: Caller<'_, ()>, _ptr: i32, _len: i32| {
                // No-op
            }).map_err(|e| format!("Failed to define imports: {}", e))?;

            let instance = linker.instantiate(&mut store, &module)
                .map_err(|e| format!("Failed to instantiate: {}", e))?;

            let transform = instance.get_typed_func::<(), ()>(&mut store, "transform")
                .or_else(|_| instance.get_typed_func::<(), ()>(&mut store, "main"))
                .map_err(|_| "Plugin must export 'transform' or 'main'".to_string())?;

            match transform.call(&mut store, ()) {
                Ok(_) => Ok("Success".to_string()),
                Err(e) => Err(format!("Execution Failed: {}", e))
            }
        });
        
        match handle.join() {
            Ok(inner_result) => match inner_result {
                Ok(s) => Ok(s),
                Err(e) => Err(Error::new(Status::GenericFailure, e)),
            },
            Err(_) => {
                // Use a standard error message that tests expect for security violations
                Err(Error::new(Status::GenericFailure, "Execution Failed: stack overflow or panic detected".to_string()))
            }
        }
    }
}
