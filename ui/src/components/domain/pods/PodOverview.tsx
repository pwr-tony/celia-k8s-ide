import type { Pod } from '@/api/schemas'
import { StatusBadge, getPodStatus } from '@/components/data'
import { Box, Server, RefreshCw, Calendar, Tag } from 'lucide-react'

interface PodOverviewProps {
  pod: Pod | undefined
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

export function PodOverview({ pod }: PodOverviewProps) {
  if (!pod) return null

  const labelEntries = Object.entries(pod.Labels || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Box className="h-4 w-4" />
              <span className="text-sm">Phase</span>
            </div>
            <StatusBadge status={getPodStatus(pod.Phase, pod.Status)}>
              {pod.Status || pod.Phase}
            </StatusBadge>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Server className="h-4 w-4" />
              <span className="text-sm">Node</span>
            </div>
            <span className="font-medium">{pod.NodeName || '-'}</span>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Restarts</span>
            </div>
            <span className="font-medium">{pod.RestartCount}</span>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Created</span>
            </div>
            <span className="font-medium text-sm">{formatDate(pod.CreatedAt)}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Network</h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Pod IP</span>
              <p className="font-mono">{pod.PodIP || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Node</span>
              <p className="font-mono">{pod.NodeName || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Ownership</h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Owner Kind</span>
              <p>{pod.OwnerKind || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Owner Name</span>
              <p>{pod.OwnerName || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      {labelEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Labels
          </h3>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">
              {labelEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-bg-tertiary border border-border-subtle"
                >
                  <span className="text-text-secondary">{key}:</span>
                  <span className="ml-1 text-text-primary">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Conditions</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Type</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Status</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {pod.Conditions?.map((condition, index) => (
                <tr key={index} className="border-t border-border-subtle">
                  <td className="px-4 py-2">{condition.Type}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={condition.Status === 'True' ? 'success' : 'neutral'}>
                      {condition.Status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2 text-text-secondary">{condition.Reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
