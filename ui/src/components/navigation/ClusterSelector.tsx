import { useContexts, useConnect, useConnection } from '@/api/hooks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SimpleTooltip } from '@/components/primitives'
import { useUIStore } from '@/stores/ui'
import { Server } from 'lucide-react'

export function ClusterSelector() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const { data: contexts, isLoading } = useContexts()
  const { data: connection } = useConnection()
  const { mutate: connect, isPending } = useConnect()

  const currentContext = connection?.State === 'connected' ? connection.ContextName : ''
  const currentContextDisplay = currentContext || 'Select cluster'

  if (isLoading) {
    return (
      <div className="px-1 py-2">
        <div className="h-9 animate-pulse bg-bg-tertiary rounded-md" />
      </div>
    )
  }

  if (collapsed) {
    return (
      <SimpleTooltip content={currentContextDisplay} side="right">
        <div className="flex items-center justify-center py-2">
          <Server className="h-4 w-4 text-text-secondary" />
        </div>
      </SimpleTooltip>
    )
  }

  return (
    <div className="px-1 py-2">
      <Select
        value={currentContext}
        onValueChange={(value) => connect(value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select cluster" />
        </SelectTrigger>
        <SelectContent>
          {contexts?.map((ctx) => (
            <SelectItem key={ctx.Name} value={ctx.Name}>
              {ctx.Name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
