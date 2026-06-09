export const isTauri = (): boolean =>
  typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__

export const getApiBase = (): string =>
  isTauri() ? 'http://127.0.0.1:9119/api/v1' : '/api/v1'

export const getWsUrl = (): string => {
  if (isTauri()) return 'ws://127.0.0.1:9119/api/v1/ws'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/v1/ws`
}
