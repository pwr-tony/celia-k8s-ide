import { useContexts, useConnect } from '@/api/hooks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SimpleTooltip } from '@/components/primitives'
import { useUIStore } from '@/stores/ui'
import { Server } from 'lucide-react'

export function ClusterSelector() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const { data: contexts, isLoading } = useContexts()
  const { mutate: connect, isPending } = useConnect()

  if (isLoading) {
    return (
      <div className="px-1 py-2">
        <div className="h-9 animate-pulse bg-bg-tertiary rounded-md" />
      </div>
    )
  }

  if (collapsed) {
    return (
      <SimpleTooltip content={contexts?.current ?? 'Select cluster'} side="right">
        <div className="flex items-center justify-center py-2">
          <Server className="h-4 w-4 text-text-secondary" />
        </div>
      </SimpleTooltip>
    )
  }

  return (
    <div className="px-1 py-2">
      <Select
        value={contexts?.current ?? ''}
        onValueChange={(value) => connect(value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select cluster" />
        </SelectTrigger>
        <SelectContent>
          {contexts?.contexts.map((ctx) => (
            <SelectItem key={ctx.name} value={ctx.name}>
              {ctx.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
