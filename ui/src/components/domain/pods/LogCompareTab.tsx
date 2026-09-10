import { useQuery } from '@tanstack/react-query'
import { get } from '@/api/client'
import { z } from 'zod'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Loader2, Download, RefreshCw, Search, X, Plus, Minus, Link, Unlink } from 'lucide-react'
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

interface LogPanelProps {
  namespace: string
  podName: string
  container: string
  containers: Pod['Containers']
  tailLines: string
  searchQuery: string
  onContainerChange: (container: string) => void
  onRemove?: () => void
  canRemove: boolean
  syncScroll: boolean
  scrollTop: number
  onScroll: (scrollTop: number) => void
  panelIndex: number
}

function LogPanel({
  namespace,
  podName,
  container,
  containers,
  tailLines,
  searchQuery,
  onContainerChange,
  onRemove,
  canRemove,
  syncScroll,
  scrollTop,
  onScroll,
  panelIndex,
}: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['logs', namespace, podName, container, tailLines],
    queryFn: () =>
      get<{ logs: string }>(
        `/logs/${namespace}/${podName}?container=${container}&tail=${tailLines}`,
        LogsResponseSchema
      ),
    enabled: Boolean(container),
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

  useEffect(() => {
    if (syncScroll && scrollRef.current && !isScrolling.current) {
      scrollRef.current.scrollTop = scrollTop
    }
  }, [syncScroll, scrollTop])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (syncScroll) {
      isScrolling.current = true
      onScroll(e.currentTarget.scrollTop)
      setTimeout(() => {
        isScrolling.current = false
      }, 50)
    }
  }, [syncScroll, onScroll])

  const panelColors = [
    'border-blue-500/50',
    'border-green-500/50',
    'border-purple-500/50',
    'border-orange-500/50',
  ]

  return (
    <div className={`flex flex-col flex-1 min-w-0 border-l-2 ${panelColors[panelIndex % 4]} first:border-l-0`}>
      <div className="flex items-center gap-2 p-2 bg-bg-tertiary border-b border-border-subtle">
        <Select value={container} onValueChange={onContainerChange}>
          <SelectTrigger className="flex-1 min-w-0">
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
        {canRemove && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="shrink-0">
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-[#1e1e1e] p-2"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
          </div>
        ) : processedLines.length > 0 ? (
          <pre className="font-mono text-xs whitespace-pre-wrap break-all">
            {processedLines.map(({ key, text, level }) => (
              <div key={key} className={levelStyles[level]}>
                {searchQuery ? highlightMatch(text, searchQuery) : text}
              </div>
            ))}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            {searchQuery ? 'No matching logs' : 'No logs'}
          </div>
        )}
      </div>

      {isFetching && !isLoading && (
        <div className="absolute top-2 right-2">
          <Loader2 className="h-3 w-3 animate-spin text-text-secondary" />
        </div>
      )}
    </div>
  )
}

interface LogCompareTabProps {
  namespace: string
  podName: string
  containers: Pod['Containers']
}

export function LogCompareTab({ namespace, podName, containers }: LogCompareTabProps) {
  const [panels, setPanels] = useState<string[]>(() => {
    const initialContainers = containers?.slice(0, 2).map(c => c.Name) ?? []
    if (initialContainers.length === 1) {
      return [initialContainers[0], initialContainers[0]]
    }
    return initialContainers.length >= 2 ? initialContainers : []
  })
  const [tailLines, setTailLines] = useState('100')
  const [searchQuery, setSearchQuery] = useState('')
  const [syncScroll, setSyncScroll] = useState(true)
  const [scrollTop, setScrollTop] = useState(0)

  const addPanel = useCallback(() => {
    if (panels.length < 4 && containers?.length) {
      const usedContainers = new Set(panels)
      const nextContainer = containers.find(c => !usedContainers.has(c.Name))?.Name ?? containers[0].Name
      setPanels(prev => [...prev, nextContainer])
    }
  }, [panels, containers])

  const removePanel = useCallback((index: number) => {
    setPanels(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updatePanel = useCallback((index: number, container: string) => {
    setPanels(prev => prev.map((c, i) => i === index ? container : c))
  }, [])

  const handleDownloadAll = useCallback(() => {
    panels.forEach(container => {
      const link = document.createElement('a')
      link.href = `/api/v1/logs/${namespace}/${podName}?container=${container}&tail=${tailLines}`
      link.download = `${podName}-${container}.log`
      link.click()
    })
  }, [panels, namespace, podName, tailLines])

  if (!containers?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No containers found
      </div>
    )
  }

  if (containers.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        At least 2 containers required for comparison
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-3 border-b border-border-subtle bg-bg-secondary">
        <Select value={tailLines} onValueChange={setTailLines}>
          <SelectTrigger className="w-28">
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
            type="text"
            placeholder="Filter all panels..."
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

        <div className="flex-1" />

        <Button
          variant={syncScroll ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSyncScroll(!syncScroll)}
          title={syncScroll ? 'Disable sync scroll' : 'Enable sync scroll'}
        >
          {syncScroll ? <Link className="h-4 w-4 mr-1" /> : <Unlink className="h-4 w-4 mr-1" />}
          Sync
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={addPanel}
          disabled={panels.length >= 4 || panels.length >= containers.length}
          title="Add panel"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>

        <Button variant="ghost" size="sm" onClick={handleDownloadAll}>
          <Download className="h-4 w-4 mr-1" />
          Download All
        </Button>
      </div>

      <div className="flex-1 flex min-h-0">
        {panels.map((container, index) => (
          <LogPanel
            key={`${index}-${container}`}
            namespace={namespace}
            podName={podName}
            container={container}
            containers={containers}
            tailLines={tailLines}
            searchQuery={searchQuery}
            onContainerChange={(c) => updatePanel(index, c)}
            onRemove={() => removePanel(index)}
            canRemove={panels.length > 2}
            syncScroll={syncScroll}
            scrollTop={scrollTop}
            onScroll={setScrollTop}
            panelIndex={index}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 p-2 bg-bg-secondary border-t border-border-subtle text-xs text-text-secondary">
        <span>{panels.length} panels</span>
        <span>|</span>
        <span>Sync: {syncScroll ? 'On' : 'Off'}</span>
        <span>|</span>
        <span>Lines: {tailLines}</span>
      </div>
    </div>
  )
}
