type MessageHandler = (data: unknown) => void
type ConnectionHandler = () => void

interface WSMessage {
  type: string
  payload?: unknown
}

interface LogSubscribePayload {
  namespace: string
  pod: string
  container: string
  follow: boolean
  tailLines: number
  timestamps: boolean
}

interface LogMessage {
  type: 'log'
  namespace: string
  pod: string
  container: string
  line: string
  timestamp: string
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private messageQueue: WSMessage[] = []
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private onConnectHandlers: Set<ConnectionHandler> = new Set()
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set()
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isIntentionalClose = false

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.isIntentionalClose = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.flushMessageQueue()
      this.onConnectHandlers.forEach((handler) => handler())
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type: string }
        const handlers = this.handlers.get(data.type)
        handlers?.forEach((handler) => handler(data))

        const allHandlers = this.handlers.get('*')
        allHandlers?.forEach((handler) => handler(data))
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      this.onDisconnectHandlers.forEach((handler) => handler())
      if (!this.isIntentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.ws?.close()
    this.ws = null
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.sendImmediate(message)
      }
    }
  }

  private sendImmediate(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendImmediate(message)
    } else {
      this.messageQueue.push(message)
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler)
    return () => {
      this.onConnectHandlers.delete(handler)
    }
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler)
    return () => {
      this.onDisconnectHandlers.delete(handler)
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  subscribeLogs(options: LogSubscribePayload): void {
    this.send({
      type: 'logs.subscribe',
      payload: options,
    })
  }

  unsubscribeLogs(): void {
    this.send({ type: 'logs.unsubscribe' })
  }

  onLogMessage(handler: (message: LogMessage) => void): () => void {
    return this.on('log', handler as MessageHandler)
  }

  ping(): void {
    this.send({ type: 'ping' })
  }

  subscribeProblems(): void {
    this.send({ type: 'problems.subscribe' })
  }

  unsubscribeProblems(): void {
    this.send({ type: 'problems.unsubscribe' })
  }

  onProblemsUpdate(handler: (data: { type: string; payload: unknown }) => void): () => void {
    return this.on('problems.update', handler as MessageHandler)
  }
}

import { getWsUrl } from '@/lib/environment'

let wsInstance: WebSocketManager | null = null

export function getWebSocket(): WebSocketManager {
  if (!wsInstance) {
    wsInstance = new WebSocketManager(getWsUrl())
  }
  return wsInstance
}
