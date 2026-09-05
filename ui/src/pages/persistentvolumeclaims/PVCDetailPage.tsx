import { useParams, useNavigate } from 'react-router'
import { usePersistentVolumeClaim } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { getPVCStatus, StatusBadge, DetailPageSkeleton, EmptyState } from '@/components/data'
import { PageError } from '@/components/error'
import { ROUTES, pvDetailPath } from '@/router/routes'
import { Tag, HardDrive, Database, Link2 } from 'lucide-react'
import type { PersistentVolumeClaim } from '@/api/schemas'

function PVCOverview({ pvc }: { pvc: PersistentVolumeClaim }) {
  const navigate = useNavigate()
  const labelEntries = Object.entries(pvc.Labels || {})

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm">Phase</span>
            </div>
            <StatusBadge status={getPVCStatus(pvc.Phase)}>{pvc.Phase}</StatusBadge>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Capacity</span>
            </div>
            <span className="font-mono font-medium">{pvc.Capacity || '-'}</span>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Requested</span>
            <p className="font-mono font-medium">{pvc.RequestedStorage || '-'}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Storage Class</span>
            <p className="font-medium">{pvc.StorageClassName || '-'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Access</h3>
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Access Modes:</span>
            <span className="text-text-primary">
              {pvc.AccessModes?.join(', ') || '-'}
            </span>
          </div>
          {pvc.VolumeMode && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Volume Mode:</span>
              <span className="text-text-primary">{pvc.VolumeMode}</span>
            </div>
          )}
        </div>
      </section>

      {pvc.VolumeName && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Bound Volume
          </h3>
          <div className="card p-4">
            <button
              onClick={() => navigate(pvDetailPath(pvc.VolumeName))}
              className="text-accent-primary hover:underline"
            >
              {pvc.VolumeName}
            </button>
          </div>
        </section>
      )}

      {pvc.Conditions && pvc.Conditions.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4">Conditions</h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Type</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Reason</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {pvc.Conditions.map((condition, index) => (
                  <tr key={index} className="border-t border-border-subtle">
                    <td className="px-4 py-2">{condition.Type}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={condition.Status === 'True' ? 'success' : 'neutral'}>
                        {condition.Status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{condition.Reason || '-'}</td>
                    <td className="px-4 py-2 text-text-secondary text-xs">{condition.Message || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
    </div>
  )
}

export function PVCDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: pvc, isLoading, error, refetch } = usePersistentVolumeClaim(namespace!, name!)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <PageError error={error as Error} onRetry={() => refetch()} />
  }

  if (!pvc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={HardDrive}
          title="PersistentVolumeClaim not found"
          description={`The PVC "${name}" was not found in namespace "${namespace}".`}
        />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <PVCOverview pvc={pvc} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="PersistentVolumeClaim" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="PersistentVolumeClaim" /> },
  ]

  return (
    <ResourceDetailLayout
      kind="PersistentVolumeClaim"
      name={pvc.Name}
      namespace={pvc.Namespace}
      status={pvc.Phase}
      statusType={getPVCStatus(pvc.Phase)}
      breadcrumbs={[
        { label: 'PersistentVolumeClaims', href: ROUTES.PERSISTENT_VOLUME_CLAIMS },
        { label: pvc.Name },
      ]}
      tabs={tabs}
    />
  )
}
