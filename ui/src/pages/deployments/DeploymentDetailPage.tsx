import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import { useDeployment } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { ScaleDialog, RestartDialog } from '@/components/operations'
import { Button, Kbd } from '@/components/primitives'
import { getDeploymentStatus, StatusBadge, DetailPageSkeleton, EmptyState } from '@/components/data'
import { PageError } from '@/components/error'
import { ROUTES } from '@/router/routes'
import { Tag, ArrowUpDown, RefreshCw, Server } from 'lucide-react'
import type { Deployment } from '@/api/schemas'

function DeploymentOverview({ deployment }: { deployment: Deployment }) {
  const labelEntries = Object.entries(deployment.Labels || {})

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Replicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Desired</span>
            <p className="text-2xl font-bold">{deployment.Replicas}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Ready</span>
            <p className="text-2xl font-bold">{deployment.ReadyReplicas}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Up-to-date</span>
            <p className="text-2xl font-bold">{deployment.UpdatedReplicas}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Available</span>
            <p className="text-2xl font-bold">{deployment.AvailableReplicas}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Strategy</h3>
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Type:</span>
            <span className="text-text-primary font-medium">{deployment.Strategy.Type}</span>
          </div>
          {deployment.Strategy.MaxUnavailable && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Max Unavailable:</span>
              <span className="text-text-primary">{deployment.Strategy.MaxUnavailable}</span>
            </div>
          )}
          {deployment.Strategy.MaxSurge && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Max Surge:</span>
              <span className="text-text-primary">{deployment.Strategy.MaxSurge}</span>
            </div>
          )}
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
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Type</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Status</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Reason</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {deployment.Conditions?.map((condition, index) => (
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
    </div>
  )
}

export function DeploymentDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: deployment, isLoading, error, refetch } = useDeployment(namespace!, name!)
  const [showScale, setShowScale] = useState(false)
  const [showRestart, setShowRestart] = useState(false)

  const openScale = useCallback(() => setShowScale(true), [])
  const openRestart = useCallback(() => setShowRestart(true), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          openScale()
          break
        case 'r':
          e.preventDefault()
          openRestart()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openScale, openRestart])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <PageError error={error as Error} onRetry={() => refetch()} />
  }

  if (!deployment) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Server}
          title="Deployment not found"
          description={`The deployment "${name}" was not found in namespace "${namespace}". It may have been deleted or you may not have access to it.`}
        />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <DeploymentOverview deployment={deployment} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Deployment" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Deployment" /> },
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={openScale}>
        <ArrowUpDown className="h-4 w-4 mr-1" />
        Scale
        <Kbd className="ml-2">S</Kbd>
      </Button>
      <Button variant="secondary" size="sm" onClick={openRestart}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Restart
        <Kbd className="ml-2">R</Kbd>
      </Button>
    </div>
  )

  return (
    <>
      <ResourceDetailLayout
        kind="Deployment"
        name={deployment.Name}
        namespace={deployment.Namespace}
        status={`${deployment.ReadyReplicas}/${deployment.Replicas}`}
        statusType={getDeploymentStatus(deployment.ReadyReplicas, deployment.Replicas)}
        breadcrumbs={[
          { label: 'Deployments', href: ROUTES.DEPLOYMENTS },
          { label: deployment.Name },
        ]}
        tabs={tabs}
        actions={actions}
      />

      <ScaleDialog
        open={showScale}
        onClose={() => setShowScale(false)}
        namespace={namespace!}
        name={name!}
        currentReplicas={deployment.Replicas}
      />

      <RestartDialog
        open={showRestart}
        onClose={() => setShowRestart(false)}
        kind="Deployment"
        namespace={namespace!}
        name={name!}
      />
    </>
  )
}
