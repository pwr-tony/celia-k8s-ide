import { useParams } from 'react-router'
import { useService } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { getServiceType } from '@/components/data'
import { ROUTES } from '@/router/routes'
import { Loader2, Tag, Network } from 'lucide-react'
import type { Service } from '@/api/schemas'

function ServiceOverview({ service }: { service: Service }) {
  const labelEntries = Object.entries(service.labels || {})
  const selectorEntries = Object.entries(service.selector || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Network</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Type</span>
            <p className="font-medium">{service.type}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Cluster IP</span>
            <p className="font-mono">{service.cluster_ip || '-'}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">External IPs</span>
            <p className="font-mono">{service.external_ips?.join(', ') || '-'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Network className="h-4 w-4" />
          Ports
        </h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Name</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Port</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Target Port</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Protocol</th>
                <th className="text-left px-4 py-2 text-text-secondary font-medium">Node Port</th>
              </tr>
            </thead>
            <tbody>
              {service.ports?.map((port, index) => (
                <tr key={index} className="border-t border-border-subtle">
                  <td className="px-4 py-2">{port.name || '-'}</td>
                  <td className="px-4 py-2 font-mono">{port.port}</td>
                  <td className="px-4 py-2 font-mono">{port.target_port}</td>
                  <td className="px-4 py-2">{port.protocol}</td>
                  <td className="px-4 py-2 font-mono">{port.node_port || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectorEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4">Selector</h3>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">
              {selectorEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-primary/10 border border-accent-primary/20"
                >
                  <span className="text-text-secondary">{key}:</span>
                  <span className="ml-1 text-accent-primary">{value}</span>
                </span>
              ))}
            </div>
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

export function ServiceDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: service, isLoading } = useService(namespace!, name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Service not found
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <ServiceOverview service={service} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Service" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Service" /> },
  ]

  return (
    <ResourceDetailLayout
      kind="Service"
      name={service.name}
      namespace={service.namespace}
      status={service.type}
      statusType={getServiceType(service.type)}
      breadcrumbs={[
        { label: 'Services', href: ROUTES.SERVICES },
        { label: service.name },
      ]}
      tabs={tabs}
    />
  )
}
