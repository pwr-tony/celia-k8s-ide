import { type ReactNode } from 'react'
import { type LucideIcon, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { Collapsible, CollapsibleTrigger, CollapsibleContent, SimpleTooltip } from '@/components/primitives'

interface CategoryGroupProps {
  id: string
  label: string
  icon: LucideIcon
  children: ReactNode
}

export function CategoryGroup({ id, label, icon: Icon, children }: CategoryGroupProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const expandedCategories = useUIStore((s) => s.expandedCategories)
  const toggleCategory = useUIStore((s) => s.toggleCategory)
  const isExpanded = expandedCategories.includes(id)

  if (collapsed) {
    return (
      <div className="py-1">
        <SimpleTooltip content={label} side="right">
          <div className="flex items-center justify-center py-2">
            <Icon className="h-4 w-4 text-text-secondary" />
          </div>
        </SimpleTooltip>
      </div>
    )
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(id)}>
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium uppercase tracking-wider',
          'text-text-tertiary hover:text-text-secondary transition-colors'
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-3 pl-2 border-l border-border-subtle space-y-0.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
