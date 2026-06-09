mod sidecar;

use sidecar::SidecarManager;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let sidecar_manager = Arc::new(SidecarManager::new());
    let sidecar_for_setup = sidecar_manager.clone();
    let sidecar_for_exit = sidecar_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            let handle = app.handle().clone();
            let manager = sidecar_for_setup.clone();

            tauri::async_runtime::spawn(async move {
                if let Err(e) = manager.start(&handle).await {
                    log::error!("Failed to start sidecar: {}", e);
                }
            });

            Ok(())
        })
        .on_window_event(move |_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let manager = sidecar_for_exit.clone();
                tauri::async_runtime::block_on(async {
                    if let Err(e) = manager.stop().await {
                        log::error!("Failed to stop sidecar: {}", e);
                    }
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
