import type { Pod } from '@/api/schemas'
import { StatusBadge } from '@/components/data'
import { Container, RefreshCw } from 'lucide-react'

interface PodContainersTabProps {
  pod: Pod | undefined
}

function getContainerStatus(state: string, ready: boolean): 'success' | 'warning' | 'error' | 'neutral' {
  if (state === 'running' && ready) return 'success'
  if (state === 'waiting') return 'warning'
  if (state === 'terminated') return 'neutral'
  return 'error'
}

export function PodContainersTab({ pod }: PodContainersTabProps) {
  if (!pod || !pod.containers?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No containers found
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 overflow-auto">
      {pod.containers.map((container) => (
        <div key={container.name} className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Container className="h-5 w-5 text-text-secondary" />
              <span className="font-medium">{container.name}</span>
            </div>
            <StatusBadge status={getContainerStatus(container.state, container.ready)}>
              {container.state}
              {container.state_reason && ` (${container.state_reason})`}
            </StatusBadge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-tertiary">Image</span>
              <p className="font-mono text-xs break-all mt-1">{container.image}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Ready</span>
              <p className="mt-1">{container.ready ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Started</span>
              <p className="mt-1">{container.started ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {container.restart_count > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-warning">
              <RefreshCw className="h-4 w-4" />
              <span>{container.restart_count} restart{container.restart_count > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
