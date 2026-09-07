import { useEffect, useRef, useCallback, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface TerminalProps {
  namespace: string
  pod: string
  container?: string
  onClose?: () => void
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function Terminal({ namespace, pod, container, onClose }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!terminalRef.current) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const baseUrl = import.meta.env.DEV ? 'localhost:9119' : window.location.host
    let url = `${protocol}//${baseUrl}/api/v1/exec/${namespace}/${pod}`
    if (container) {
      url += `?container=${encodeURIComponent(container)}`
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      setErrorMessage(null)

      if (fitAddonRef.current) {
        const dims = fitAddonRef.current.proposeDimensions()
        if (dims) {
          ws.send(JSON.stringify({
            type: 'resize',
            data: { cols: dims.cols, rows: dims.rows }
          }))
        }
      }
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'output':
            if (msg.data?.data && xtermRef.current) {
              xtermRef.current.write(msg.data.data)
            }
            break
          case 'error':
            setErrorMessage(msg.data?.message || 'Unknown error')
            setStatus('error')
            break
          case 'pong':
            break
        }
      } catch {
        if (xtermRef.current) {
          xtermRef.current.write(event.data)
        }
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
    }

    ws.onerror = () => {
      setStatus('error')
      setErrorMessage('WebSocket connection failed')
    }

    return ws
  }, [namespace, pod, container])

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        selectionBackground: '#585b7066',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#f5c2e7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'input',
          data: { data }
        }))
      }
    })

    const ws = connect()

    const handleResize = () => {
      fitAddon.fit()
      if (ws?.readyState === WebSocket.OPEN) {
        const dims = fitAddon.proposeDimensions()
        if (dims) {
          ws.send(JSON.stringify({
            type: 'resize',
            data: { cols: dims.cols, rows: dims.rows }
          }))
        }
      }
    }

    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(terminalRef.current)

    const pingInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      ws?.close()
      term.dispose()
    }
  }, [connect])

  const reconnect = useCallback(() => {
    wsRef.current?.close()
    setStatus('connecting')
    setErrorMessage(null)
    xtermRef.current?.clear()
    connect()
  }, [connect])

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#f38ba8] hover:bg-[#f38ba8]/80 transition-colors"
              title="Close"
            />
            <button
              onClick={reconnect}
              className="w-3 h-3 rounded-full bg-[#f9e2af] hover:bg-[#f9e2af]/80 transition-colors"
              title="Reconnect"
            />
            <div
              className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-[#a6e3a1]' :
                status === 'connecting' ? 'bg-[#f9e2af] animate-pulse' :
                'bg-[#f38ba8]'
              }`}
              title={status}
            />
          </div>
          <span className="text-xs text-[#a6adc8] font-mono">
            {namespace}/{pod}{container ? `/${container}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${
            status === 'connected' ? 'text-[#a6e3a1]' :
            status === 'connecting' ? 'text-[#f9e2af]' :
            'text-[#f38ba8]'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="px-3 py-2 bg-[#f38ba8]/10 border-b border-[#f38ba8]/20 text-[#f38ba8] text-sm">
          {errorMessage}
        </div>
      )}

      <div
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ minHeight: 0 }}
      />
    </div>
  )
}
