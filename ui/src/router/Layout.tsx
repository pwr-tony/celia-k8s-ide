import { Outlet } from 'react-router'
import { TooltipProvider } from '@/components/primitives'
import { Sidebar, ShortcutHintsBar } from '@/components/layout'
import { CommandPalette, ShortcutsHelpModal } from '@/components/command-palette'
import { ErrorBoundary, ErrorFallback } from '@/components/error'

export function Layout() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-bg-primary">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ErrorBoundary
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <ErrorFallback
                  error={null}
                  title="Page Error"
                  description="Something went wrong loading this page. Try refreshing or navigating to a different page."
                />
              </div>
            }
          >
            <div className="flex-1 min-h-0 overflow-auto">
              <Outlet />
            </div>
          </ErrorBoundary>
          <ShortcutHintsBar />
        </div>
        <CommandPalette />
        <ShortcutsHelpModal />
      </div>
    </TooltipProvider>
  )
}
