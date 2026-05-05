import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/primitives'
import { SimpleTooltip, TooltipProvider } from '@/components/primitives'
import { useUIStore } from '@/stores/ui'

export function SidebarHeader() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex items-center justify-between px-3 py-4 border-b border-border-subtle">
      {!collapsed && (
        <span className="text-lg font-bold text-text-primary">Celia</span>
      )}
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </SimpleTooltip>
      </TooltipProvider>
    </div>
  )
}
