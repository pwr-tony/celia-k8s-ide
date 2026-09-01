import { useQuery } from '@tanstack/react-query'
import { get } from '@/api/client'
import { z } from 'zod'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Loader2, Download, RefreshCw, Search, X } from 'lucide-react'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives'
import type { Pod } from '@/api/schemas'

const LogsResponseSchema = z.object({
  logs: z.string(),
})

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'default'

function detectLogLevel(line: string): LogLevel {
  const lower = line.toLowerCase()
  if (/\berror\b|\bfatal\b|\bpanic\b|\bfailed\b/.test(lower)) return 'error'
  if (/\bwarn(ing)?\b/.test(lower)) return 'warn'
  if (/\binfo\b/.test(lower)) return 'info'
  if (/\bdebug\b|\btrace\b/.test(lower)) return 'debug'
  return 'default'
}

const levelStyles: Record<LogLevel, string> = {
  error: 'text-red-400',
  warn: 'text-yellow-400',
  info: 'text-blue-400',
  debug: 'text-gray-500',
  default: 'text-gray-300',
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-500/40 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

interface PodLogsTabProps {
  namespace: string
  podName: string
  containers: Pod['Containers']
}

export function PodLogsTab({ namespace, podName, containers }: PodLogsTabProps) {
  const [selectedContainer, setSelectedContainer] = useState(containers?.[0]?.Name ?? '')
  const [tailLines, setTailLines] = useState('100')
  const [searchQuery, setSearchQuery] = useState('')
  const logsEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs', namespace, podName, selectedContainer, tailLines],
    queryFn: () =>
      get<{ logs: string }>(
        `/logs/${namespace}/${podName}?container=${selectedContainer}&tail=${tailLines}`,
        LogsResponseSchema
      ),
    enabled: Boolean(selectedContainer),
    refetchInterval: 5000,
  })

  const processedLines = useMemo(() => {
    if (!data?.logs) return []
    const lines = data.logs.split('\n')
    const query = searchQuery.toLowerCase().trim()

    return lines
      .filter(line => !query || line.toLowerCase().includes(query))
      .map((line, idx) => ({
        key: idx,
        text: line,
        level: detectLogLevel(line),
      }))
  }, [data?.logs, searchQuery])

  const matchCount = useMemo(() => {
    if (!searchQuery.trim() || !data?.logs) return 0
    return processedLines.length
  }, [processedLines.length, searchQuery, data?.logs])

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [data?.logs])

  const handleDownload = () => {
    if (data?.logs) {
      const blob = new Blob([data.logs], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${podName}-${selectedContainer}.log`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (!containers?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No containers found
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-border-subtle bg-bg-secondary">
        <Select value={selectedContainer} onValueChange={setSelectedContainer}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select container" />
          </SelectTrigger>
          <SelectContent>
            {containers.map((c) => (
              <SelectItem key={c.Name} value={c.Name}>
                {c.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tailLines} onValueChange={setTailLines}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">Last 50</SelectItem>
            <SelectItem value="100">Last 100</SelectItem>
            <SelectItem value="500">Last 500</SelectItem>
            <SelectItem value="1000">Last 1000</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded focus:outline-none focus:border-accent-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-xs text-text-secondary">
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </span>
        )}

        <div className="flex-1" />

        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!data?.logs}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>

      <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
          </div>
        ) : processedLines.length > 0 ? (
          <pre className="font-mono text-xs whitespace-pre-wrap break-all">
            {processedLines.map(({ key, text, level }) => (
              <div key={key} className={levelStyles[level]}>
                {searchQuery ? highlightMatch(text, searchQuery) : text}
              </div>
            ))}
            <div ref={logsEndRef} />
          </pre>
        ) : searchQuery ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            No matching logs
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            No logs available
          </div>
        )}
      </div>
    </div>
  )
}
