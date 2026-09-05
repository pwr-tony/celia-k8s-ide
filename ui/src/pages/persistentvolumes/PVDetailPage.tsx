import { useParams, useNavigate } from 'react-router'
import { usePersistentVolume } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { getPVStatus, StatusBadge, DetailPageSkeleton, EmptyState } from '@/components/data'
import { PageError } from '@/components/error'
import { ROUTES, pvcDetailPath } from '@/router/routes'
import { Tag, HardDrive, Database, Link2 } from 'lucide-react'
import type { PersistentVolume } from '@/api/schemas'

function PVOverview({ pv }: { pv: PersistentVolume }) {
  const navigate = useNavigate()
  const labelEntries = Object.entries(pv.Labels || {})

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
            <StatusBadge status={getPVStatus(pv.Phase)}>{pv.Phase}</StatusBadge>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Capacity</span>
            </div>
            <span className="font-mono font-medium">{pv.Capacity}</span>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Reclaim Policy</span>
            <p className="font-medium">{pv.ReclaimPolicy}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Storage Class</span>
            <p className="font-medium">{pv.StorageClassName || '-'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Access</h3>
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Access Modes:</span>
            <span className="text-text-primary">
              {pv.AccessModes?.join(', ') || '-'}
            </span>
          </div>
          {pv.VolumeMode && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Volume Mode:</span>
              <span className="text-text-primary">{pv.VolumeMode}</span>
            </div>
          )}
          {pv.MountOptions && pv.MountOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Mount Options:</span>
              <span className="text-text-primary font-mono text-sm">
                {pv.MountOptions.join(', ')}
              </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Source
        </h3>
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Type:</span>
            <span className="text-text-primary font-medium">{pv.Source.Type}</span>
          </div>
          {pv.Source.Path && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Path:</span>
              <span className="text-text-primary font-mono text-sm">{pv.Source.Path}</span>
            </div>
          )}
          {pv.Source.Server && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Server:</span>
              <span className="text-text-primary font-mono text-sm">{pv.Source.Server}</span>
            </div>
          )}
          {pv.Source.Driver && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Driver:</span>
              <span className="text-text-primary">{pv.Source.Driver}</span>
            </div>
          )}
          {pv.Source.VolumeID && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Volume ID:</span>
              <span className="text-text-primary font-mono text-sm">{pv.Source.VolumeID}</span>
            </div>
          )}
          {pv.Source.FSType && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">FS Type:</span>
              <span className="text-text-primary">{pv.Source.FSType}</span>
            </div>
          )}
        </div>
      </section>

      {pv.ClaimRef && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Bound Claim
          </h3>
          <div className="card p-4">
            <button
              onClick={() => navigate(pvcDetailPath(pv.ClaimRef!.Namespace, pv.ClaimRef!.Name))}
              className="text-accent-primary hover:underline"
            >
              {pv.ClaimRef.Namespace}/{pv.ClaimRef.Name}
            </button>
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

export function PVDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: pv, isLoading, error, refetch } = usePersistentVolume(name!)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <PageError error={error as Error} onRetry={() => refetch()} />
  }

  if (!pv) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={HardDrive}
          title="PersistentVolume not found"
          description={`The persistent volume "${name}" was not found. It may have been deleted.`}
        />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <PVOverview pv={pv} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="PersistentVolume" namespace="" name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace="" resourceName={name!} resourceKind="PersistentVolume" /> },
  ]

  return (
    <ResourceDetailLayout
      kind="PersistentVolume"
      name={pv.Name}
      status={pv.Phase}
      statusType={getPVStatus(pv.Phase)}
      breadcrumbs={[
        { label: 'Persistent Volumes', href: ROUTES.PERSISTENT_VOLUMES },
        { label: pv.Name },
      ]}
      tabs={tabs}
    />
  )
}
