import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNav } from './SidebarNav'
import { X } from 'lucide-react'
import { Button } from '@/components/primitives'

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const location = useLocation()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-bg-secondary border-r border-border-subtle transition-all duration-200',
          'fixed lg:relative inset-y-0 left-0 z-50',
          'lg:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-14' : 'lg:w-64',
          'w-72'
        )}
      >
        <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border-subtle">
          <span className="font-semibold text-text-primary">Celia</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden lg:block">
          <SidebarHeader />
        </div>
        <div className="lg:hidden p-2">
          <SidebarHeader />
        </div>
        <SidebarNav />
      </aside>
    </>
  )
}
