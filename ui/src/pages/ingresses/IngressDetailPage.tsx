import { useParams, useNavigate } from 'react-router'
import { useIngress } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { StatusBadge, DetailPageSkeleton, EmptyState } from '@/components/data'
import { PageError } from '@/components/error'
import { ROUTES, serviceDetailPath, secretDetailPath } from '@/router/routes'
import { Tag, Globe, Lock, ArrowRight, Network } from 'lucide-react'
import type { Ingress } from '@/api/schemas'

function IngressOverview({ ingress }: { ingress: Ingress }) {
  const navigate = useNavigate()
  const labelEntries = Object.entries(ingress.Labels || {})
  const hosts = ingress.Rules?.map((r) => r.Host).filter(Boolean) || []
  const hasTLS = (ingress.TLS?.length ?? 0) > 0

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Hosts</span>
            </div>
            <span className="font-medium">{hosts.length || 1}</span>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm">TLS</span>
            </div>
            {hasTLS ? (
              <StatusBadge status="success">Enabled</StatusBadge>
            ) : (
              <StatusBadge status="neutral">Disabled</StatusBadge>
            )}
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Ingress Class</span>
            <p className="font-medium">{ingress.IngressClassName || 'default'}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Address</span>
            <p className="font-mono text-sm">
              {ingress.LoadBalancerIPs?.join(', ') || 'Pending'}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Network className="h-4 w-4" />
          Rules
        </h3>
        <div className="space-y-4">
          {ingress.Rules?.map((rule, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-text-tertiary" />
                <span className="font-medium">{rule.Host || '*'}</span>
                {hasTLS && ingress.TLS?.some((t) => t.Hosts?.includes(rule.Host)) && (
                  <Lock className="h-3.5 w-3.5 text-success" />
                )}
              </div>
              <div className="space-y-2 ml-6">
                {rule.Paths?.map((path, pathIdx) => (
                  <div key={pathIdx} className="flex items-center gap-2 text-sm">
                    <span className="font-mono bg-bg-tertiary px-2 py-0.5 rounded">
                      {path.Path || '/'}
                    </span>
                    <span className="text-text-tertiary text-xs">{path.PathType}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-text-tertiary" />
                    <button
                      onClick={() => navigate(serviceDetailPath(ingress.Namespace, path.ServiceName))}
                      className="text-accent-primary hover:underline"
                    >
                      {path.ServiceName}:{path.ServicePort}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!ingress.Rules || ingress.Rules.length === 0) && ingress.DefaultBackend && (
            <div className="card p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-tertiary">Default backend:</span>
                <button
                  onClick={() =>
                    navigate(serviceDetailPath(ingress.Namespace, ingress.DefaultBackend!.ServiceName))
                  }
                  className="text-accent-primary hover:underline"
                >
                  {ingress.DefaultBackend.ServiceName}:{ingress.DefaultBackend.ServicePort}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {hasTLS && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            TLS Certificates
          </h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Hosts</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Secret</th>
                </tr>
              </thead>
              <tbody>
                {ingress.TLS?.map((tls, idx) => (
                  <tr key={idx} className="border-t border-border-subtle">
                    <td className="px-4 py-2">{tls.Hosts?.join(', ') || '*'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(secretDetailPath(ingress.Namespace, tls.SecretName))}
                        className="text-accent-primary hover:underline"
                      >
                        {tls.SecretName}
                      </button>
                    </td>
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

export function IngressDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: ingress, isLoading, error, refetch } = useIngress(namespace!, name!)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <PageError error={error as Error} onRetry={() => refetch()} />
  }

  if (!ingress) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Globe}
          title="Ingress not found"
          description={`The ingress "${name}" was not found in namespace "${namespace}".`}
        />
      </div>
    )
  }

  const hasTLS = (ingress.TLS?.length ?? 0) > 0

  const tabs = [
    { id: 'overview', label: 'Overview', content: <IngressOverview ingress={ingress} /> },
    {
      id: 'yaml',
      label: 'YAML',
      content: <ResourceYAMLTab kind="Ingress" namespace={namespace!} name={name!} />,
    },
    {
      id: 'events',
      label: 'Events',
      content: (
        <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Ingress" />
      ),
    },
  ]

  return (
    <ResourceDetailLayout
      kind="Ingress"
      name={ingress.Name}
      namespace={ingress.Namespace}
      status={hasTLS ? 'TLS' : 'HTTP'}
      statusType={hasTLS ? 'success' : 'neutral'}
      breadcrumbs={[{ label: 'Ingresses', href: ROUTES.INGRESSES }, { label: ingress.Name }]}
      tabs={tabs}
    />
  )
}
