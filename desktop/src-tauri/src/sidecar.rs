use std::sync::Arc;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const HEALTH_CHECK_URL: &str = "http://127.0.0.1:9119/health";
const HEALTH_CHECK_TIMEOUT: Duration = Duration::from_secs(2);
const HEALTH_CHECK_INTERVAL: Duration = Duration::from_millis(500);
const MAX_HEALTH_CHECK_ATTEMPTS: u32 = 20;

pub struct SidecarManager {
    child: Arc<Mutex<Option<CommandChild>>>,
}

impl SidecarManager {
    pub fn new() -> Self {
        Self {
            child: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn start(&self, app: &tauri::AppHandle) -> Result<(), String> {
        let shell = app.shell();

        let command = shell
            .sidecar("celia-server")
            .map_err(|e| format!("Failed to create sidecar command: {}", e))?;

        let (rx, child) = command
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

        {
            let mut guard = self.child.lock().await;
            *guard = Some(child);
        }

        tauri::async_runtime::spawn(async move {
            use tauri_plugin_shell::process::CommandEvent;
            let mut rx = rx;
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        log::info!("[sidecar] {}", String::from_utf8_lossy(&line));
                    }
                    CommandEvent::Stderr(line) => {
                        log::warn!("[sidecar] {}", String::from_utf8_lossy(&line));
                    }
                    CommandEvent::Terminated(payload) => {
                        log::info!("[sidecar] Terminated with code: {:?}", payload.code);
                        break;
                    }
                    _ => {}
                }
            }
        });

        self.wait_for_health().await?;

        log::info!("Sidecar started and healthy");
        Ok(())
    }

    async fn wait_for_health(&self) -> Result<(), String> {
        let client = reqwest::Client::builder()
            .timeout(HEALTH_CHECK_TIMEOUT)
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        for attempt in 1..=MAX_HEALTH_CHECK_ATTEMPTS {
            match client.get(HEALTH_CHECK_URL).send().await {
                Ok(response) if response.status().is_success() => {
                    return Ok(());
                }
                Ok(response) => {
                    log::debug!(
                        "Health check attempt {} failed with status: {}",
                        attempt,
                        response.status()
                    );
                }
                Err(e) => {
                    log::debug!("Health check attempt {} failed: {}", attempt, e);
                }
            }
            tokio::time::sleep(HEALTH_CHECK_INTERVAL).await;
        }

        Err("Sidecar failed to become healthy".to_string())
    }

    pub async fn stop(&self) -> Result<(), String> {
        let mut guard = self.child.lock().await;
        if let Some(child) = guard.take() {
            child
                .kill()
                .map_err(|e| format!("Failed to kill sidecar: {}", e))?;
            log::info!("Sidecar stopped");
        }
        Ok(())
    }
}

impl Default for SidecarManager {
    fn default() -> Self {
        Self::new()
    }
}
