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
        // Use epoch interruption instead of fuel for better cross-platform support
        config.epoch_interruption(true);
        
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
        // Compile module
        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to compile: {}", e)))?;

        let mut store = Store::new(&self.engine, ());
        
        // Set fuel limit - wasmtime will trap when exhausted
        // Using a smaller limit to ensure quick termination of infinite loops
        if let Err(e) = store.set_fuel(100_000) {
            return Err(Error::new(Status::GenericFailure, format!("Failed to set fuel: {}", e)));
        }
        
        let mut linker = Linker::new(&self.engine);
        
        // Define safe console_log stub
        if let Err(e) = linker.func_wrap("env", "console_log", |_caller: Caller<'_, ()>, _ptr: i32, _len: i32| {
            // No-op for security
        }) {
            return Err(Error::new(Status::GenericFailure, format!("Failed to define imports: {}", e)));
        }

        let instance = linker.instantiate(&mut store, &module)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to instantiate: {}", e)))?;

        let transform = instance.get_typed_func::<(), ()>(&mut store, "transform")
            .or_else(|_| instance.get_typed_func::<(), ()>(&mut store, "main"))
            .map_err(|_| Error::new(Status::GenericFailure, "Plugin must export 'transform' or 'main'".to_string()))?;

        // Execute - wasmtime will return Err on fuel exhaustion
        match transform.call(&mut store, ()) {
            Ok(_) => Ok("Success".to_string()),
            Err(e) => {
                // This is the expected path for CPU bombs - fuel exhaustion
                Err(Error::new(Status::GenericFailure, format!("Execution Failed: {}", e)))
            }
        }
    }
}
