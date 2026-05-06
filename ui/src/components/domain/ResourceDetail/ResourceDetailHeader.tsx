import { useConnection } from '@/api/hooks'
import { Breadcrumbs } from '../Breadcrumbs'
import { StatusBadge, type Status } from '@/components/data'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ResourceDetailHeaderProps {
  kind: string
  name: string
  namespace?: string | undefined
  status?: string | undefined
  statusType?: Status | undefined
  breadcrumbs: BreadcrumbItem[]
  actions?: React.ReactNode
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

  if (!connection?.connected) {
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
      <span className="font-medium">{connection.context}</span>
    </div>
  )
}

export function ResourceDetailHeader({
  kind,
  name,
  namespace,
  status,
  statusType = 'neutral',
  breadcrumbs,
  actions,
}: ResourceDetailHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-bg-secondary">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Breadcrumbs items={breadcrumbs} />
          <ConnectionStatus />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary uppercase">{kind}</span>
                {namespace && (
                  <span className="text-xs text-text-tertiary">in {namespace}</span>
                )}
              </div>
              <h1 className="text-xl font-semibold text-text-primary">{name}</h1>
            </div>
            {status && <StatusBadge status={statusType}>{status}</StatusBadge>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
