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
    pub fn execute(&self, wasm_bytes: &[u8], _input: String, timeout_ms: u32) -> napi::Result<String> {
        use std::sync::Arc;
        use std::sync::atomic::{AtomicBool, Ordering};
        use std::thread;
        use std::time::Duration;

        let module = Module::new(&self.engine, wasm_bytes)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to compile: {}", e)))?;

        let mut store = Store::new(&self.engine, ());
        
        // Set up epoch-based deadline (more reliable than fuel on Windows)
        store.set_epoch_deadline(1);
        
        let mut linker = Linker::new(&self.engine);
        
        // Define safe imports
        linker.func_wrap("env", "console_log", |_caller: Caller<'_, ()>, _ptr: i32, _len: i32| {
            // Safe no-op for security tests
        }).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to define imports: {}", e)))?;

        let instance = linker.instantiate(&mut store, &module)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to instantiate: {}", e)))?;

        let transform = instance.get_typed_func::<(), ()>(&mut store, "transform")
            .or_else(|_| instance.get_typed_func::<(), ()>(&mut store, "main"))
            .map_err(|_| Error::new(Status::GenericFailure, "Plugin must export 'transform' or 'main'".to_string()))?;

        // Set up timeout using epoch interruption
        let engine = self.engine.clone();
        let timeout_flag = Arc::new(AtomicBool::new(false));
        let timeout_flag_clone = timeout_flag.clone();
        
        if timeout_ms > 0 {
            thread::spawn(move || {
                thread::sleep(Duration::from_millis(timeout_ms as u64));
                timeout_flag_clone.store(true, Ordering::SeqCst);
                engine.increment_epoch();
            });
        }

        // Execute with timeout protection
        match transform.call(&mut store, ()) {
            Ok(_) => {
                if timeout_flag.load(Ordering::SeqCst) {
                    Err(Error::new(Status::GenericFailure, "Execution Failed: timeout".to_string()))
                } else {
                    Ok("Success".to_string())
                }
            },
            Err(e) => {
                Err(Error::new(Status::GenericFailure, format!("Execution Failed: {}", e)))
            }
        }
    }
}
