import { Outlet } from 'react-router'
import { TooltipProvider } from '@/components/primitives'
import { Sidebar, ShortcutHintsBar } from '@/components/layout'
import { CommandPalette, ShortcutsHelpModal } from '@/components/command-palette'

export function Layout() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-bg-primary">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 overflow-auto">
            <Outlet />
          </div>
          <ShortcutHintsBar />
        </div>
        <CommandPalette />
        <ShortcutsHelpModal />
      </div>
    </TooltipProvider>
  )
}
