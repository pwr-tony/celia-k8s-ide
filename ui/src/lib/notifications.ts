import { isTauri } from './environment'

type Severity = 1 | 2 | 3 | 4

let tauriNotification: typeof import('@tauri-apps/plugin-notification') | null = null

async function loadTauriNotification() {
  if (tauriNotification) return tauriNotification
  if (!isTauri()) return null
  try {
    tauriNotification = await import('@tauri-apps/plugin-notification')
    return tauriNotification
  } catch {
    return null
  }
}

async function requestWebNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

async function sendTauriNotification(title: string, body: string): Promise<boolean> {
  const notification = await loadTauriNotification()
  if (!notification) return false
  try {
    let granted = await notification.isPermissionGranted()
    if (!granted) {
      const permission = await notification.requestPermission()
      granted = permission === 'granted'
    }
    if (!granted) return false
    await notification.sendNotification({ title, body })
    return true
  } catch {
    return false
  }
}

async function sendWebNotification(title: string, body: string): Promise<boolean> {
  const hasPermission = await requestWebNotificationPermission()
  if (!hasPermission) return false
  new Notification(title, { body, icon: '/favicon.ico' })
  return true
}

export async function sendDesktopNotification(
  title: string,
  body: string,
  severity: Severity
): Promise<boolean> {
  const severityPrefix = severity === 4 ? '[CRITICAL]' : severity === 3 ? '[HIGH]' : ''
  const fullTitle = severityPrefix ? `${severityPrefix} ${title}` : title

  if (isTauri()) {
    return sendTauriNotification(fullTitle, body)
  }
  return sendWebNotification(fullTitle, body)
}
