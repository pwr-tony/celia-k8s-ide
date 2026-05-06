import { Outlet } from 'react-router'
import { TooltipProvider } from '@/components/primitives'
import { Sidebar } from '@/components/layout'

export function Layout() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-bg-primary">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </div>
      </div>
    </TooltipProvider>
  )
}
