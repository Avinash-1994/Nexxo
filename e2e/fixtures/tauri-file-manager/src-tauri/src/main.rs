// Tauri file manager Rust backend
// Lunx IPC type generator parses #[tauri::command] fns to emit TypeScript declarations

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn read_file(path: String) -> String {
    std::fs::read_to_string(&path).unwrap_or_default()
}

#[tauri::command]
fn list_directory(path: String) -> Vec<String> {
    std::fs::read_dir(&path)
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .map(|e| e.file_name().to_string_lossy().to_string())
                .collect()
        })
        .unwrap_or_default()
}

#[tauri::command]
fn delete_file(path: String) -> bool {
    std::fs::remove_file(&path).is_ok()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            list_directory,
            delete_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
