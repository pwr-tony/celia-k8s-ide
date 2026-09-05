import { useConnection } from '@/api/hooks'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface PageHeaderProps {
  title: string
  children?: React.ReactNode
}

function ConnectionStatus() {
  const { data: connection, isLoading } = useConnection()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Connecting...</span>
      </div>
    )
  }

  if (connection?.State !== 'connected') {
    return (
      <div className="flex items-center gap-2 text-warning">
        <AlertCircle className="h-4 w-4" />
        <span>Not connected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-success">
      <CheckCircle2 className="h-4 w-4" />
      <span className="font-medium">{connection.ContextName}</span>
    </div>
  )
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-bg-secondary">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
          {children}
        </div>
        <div className="hidden sm:block shrink-0">
          <ConnectionStatus />
        </div>
      </div>
    </header>
  )
}
