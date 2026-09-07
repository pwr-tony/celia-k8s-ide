import { useState } from 'react'
import { TerminalSquare } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives'
import { Terminal } from '@/components/terminal/Terminal'
import type { Pod } from '@/api/schemas'

interface PodTerminalTabProps {
  namespace: string
  podName: string
  containers: Pod['Containers']
}

export function PodTerminalTab({ namespace, podName, containers }: PodTerminalTabProps) {
  const [selectedContainer, setSelectedContainer] = useState(containers?.[0]?.Name ?? '')
  const [terminalKey, setTerminalKey] = useState(0)

  const handleReconnect = () => {
    setTerminalKey(k => k + 1)
  }

  if (!containers?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        <TerminalSquare className="h-8 w-8 mr-2 opacity-50" />
        No containers found
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-border-subtle bg-bg-secondary">
        <Select value={selectedContainer} onValueChange={(value) => {
          setSelectedContainer(value)
          handleReconnect()
        }}>
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

        <span className="text-xs text-text-secondary">
          Press Ctrl+C to interrupt, type 'exit' to close shell
        </span>
      </div>

      <div className="flex-1 min-h-0 p-2 bg-[#1e1e2e]">
        <Terminal
          key={terminalKey}
          namespace={namespace}
          pod={podName}
          container={selectedContainer || undefined}
        />
      </div>
    </div>
  )
}
