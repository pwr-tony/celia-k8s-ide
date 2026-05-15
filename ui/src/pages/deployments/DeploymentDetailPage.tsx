import { useParams } from 'react-router'
import { useDeployment } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { getDeploymentStatus, StatusBadge } from '@/components/data'
import { ROUTES } from '@/router/routes'
import { Loader2, Tag } from 'lucide-react'
import type { Deployment } from '@/api/schemas'

function DeploymentOverview({ deployment }: { deployment: Deployment }) {
  const labelEntries = Object.entries(deployment.Labels || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
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
        <div className="card p-4">
          <span className="text-text-primary font-medium">{deployment.Strategy}</span>
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
  const { data: deployment, isLoading } = useDeployment(namespace!, name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Deployment not found
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <DeploymentOverview deployment={deployment} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Deployment" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Deployment" /> },
  ]

  return (
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
    />
  )
}
