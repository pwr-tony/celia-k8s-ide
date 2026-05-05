import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { useSelectionStore } from '@/stores/selection'
import { SimpleTooltip } from '@/components/primitives'
import { ProblemBadge } from './ProblemBadge'

interface NavItemProps {
  icon: LucideIcon
  label: string
  resourceType: string
  count?: number
  problemCount?: number
}

export function NavItem({ icon: Icon, label, resourceType, count, problemCount = 0 }: NavItemProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const activeResourceType = useSelectionStore((s) => s.activeResourceType)
  const setActiveResourceType = useSelectionStore((s) => s.setActiveResourceType)
  const isActive = activeResourceType === resourceType

  const content = (
    <button
      onClick={() => setActiveResourceType(resourceType)}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
        'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        isActive && 'bg-bg-tertiary text-text-primary border-l-2 border-accent-primary -ml-0.5 pl-[calc(0.75rem-2px)]',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {problemCount > 0 ? (
            <ProblemBadge count={problemCount} />
          ) : count !== undefined ? (
            <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">
              {count}
            </span>
          ) : null}
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <SimpleTooltip content={label} side="right">
        {content}
      </SimpleTooltip>
    )
  }

  return content
}
