import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'flex flex-col bg-bg-secondary border-r border-border-subtle transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      <SidebarHeader />
      <SidebarNav />
    </aside>
  )
}
