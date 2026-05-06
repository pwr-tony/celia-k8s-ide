import { useQuery } from '@tanstack/react-query'
import { get } from '@/api/client'
import { z } from 'zod'
import { useState, useRef, useEffect } from 'react'
import { Loader2, Download, RefreshCw } from 'lucide-react'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives'
import type { Pod } from '@/api/schemas'

const LogsResponseSchema = z.object({
  logs: z.string(),
})

interface PodLogsTabProps {
  namespace: string
  podName: string
  containers: Pod['containers']
}

export function PodLogsTab({ namespace, podName, containers }: PodLogsTabProps) {
  const [selectedContainer, setSelectedContainer] = useState(containers?.[0]?.name ?? '')
  const [tailLines, setTailLines] = useState('100')
  const logsEndRef = useRef<HTMLDivElement>(null)

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
              <SelectItem key={c.name} value={c.name}>
                {c.name}
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
        ) : data?.logs ? (
          <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">
            {data.logs}
            <div ref={logsEndRef} />
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            No logs available
          </div>
        )}
      </div>
    </div>
  )
}
