import { useNamespaces } from '@/api/hooks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SimpleTooltip } from '@/components/primitives'
import { useUIStore } from '@/stores/ui'
import { Folder } from 'lucide-react'

export function NamespaceSelector() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const selectedNamespace = useUIStore((s) => s.selectedNamespace)
  const setSelectedNamespace = useUIStore((s) => s.setSelectedNamespace)
  const { data: namespaces, isLoading } = useNamespaces()

  if (isLoading) {
    return (
      <div className="px-1 py-2">
        <div className="h-9 animate-pulse bg-bg-tertiary rounded-md" />
      </div>
    )
  }

  if (collapsed) {
    return (
      <SimpleTooltip content={selectedNamespace ?? 'All namespaces'} side="right">
        <div className="flex items-center justify-center py-2">
          <Folder className="h-4 w-4 text-text-secondary" />
        </div>
      </SimpleTooltip>
    )
  }

  return (
    <div className="px-1 py-2">
      <Select
        value={selectedNamespace ?? 'all'}
        onValueChange={(value) => setSelectedNamespace(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All namespaces" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All namespaces</SelectItem>
          {namespaces?.namespaces.map((ns) => (
            <SelectItem key={ns} value={ns}>
              {ns}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
