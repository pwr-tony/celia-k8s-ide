import { Menu, X } from 'lucide-react'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/primitives'

export function MobileHeader() {
  const { mobileSidebarOpen, toggleMobileSidebar } = useUIStore()

  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-bg-secondary border-b border-border-subtle">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobileSidebar}
        aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
      <span className="font-semibold text-text-primary">Celia</span>
      <div className="w-9" />
    </header>
  )
}
