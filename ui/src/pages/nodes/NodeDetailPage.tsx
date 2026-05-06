import { useParams } from 'react-router'
import { useNode } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { getNodeStatus, StatusBadge } from '@/components/data'
import { ROUTES } from '@/router/routes'
import { Loader2, Tag, Server, Cpu, HardDrive } from 'lucide-react'
import type { Node } from '@/api/schemas'

function NodeOverview({ node }: { node: Node }) {
  const labelEntries = Object.entries(node.labels || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">System Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">OS</span>
            <p className="font-medium">{node.os}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Architecture</span>
            <p className="font-medium">{node.architecture}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Kernel</span>
            <p className="font-medium text-sm">{node.kernel_version}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Container Runtime</span>
            <p className="font-medium text-sm">{node.container_runtime}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Kubelet Version</span>
            <p className="font-medium">{node.kubelet_version}</p>
          </div>
          <div className="card p-4">
            <span className="text-sm text-text-tertiary">Roles</span>
            <p className="font-medium">{node.roles?.join(', ') || '-'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Server className="h-4 w-4" />
          Network
        </h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Internal IP</span>
              <p className="font-mono">{node.internal_ip || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">External IP</span>
              <p className="font-mono">{node.external_ip || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Pod CIDR</span>
              <p className="font-mono">{node.pod_cidr || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Capacity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <h4 className="font-medium mb-3">Capacity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">CPU</span>
                <span>{node.capacity?.cpu || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Memory</span>
                <span>{node.capacity?.memory || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Pods</span>
                <span>{node.capacity?.pods || '-'}</span>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <h4 className="font-medium mb-3">Allocatable</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">CPU</span>
                <span>{node.allocatable?.cpu || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Memory</span>
                <span>{node.allocatable?.memory || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Pods</span>
                <span>{node.allocatable?.pods || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {node.taints && node.taints.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Taints
          </h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Key</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Value</th>
                  <th className="text-left px-4 py-2 text-text-secondary font-medium">Effect</th>
                </tr>
              </thead>
              <tbody>
                {node.taints.map((taint, index) => (
                  <tr key={index} className="border-t border-border-subtle">
                    <td className="px-4 py-2">{taint.key}</td>
                    <td className="px-4 py-2">{taint.value || '-'}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={taint.effect === 'NoSchedule' ? 'warning' : 'error'}>
                        {taint.effect}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {node.conditions?.map((condition, index) => (
                <tr key={index} className="border-t border-border-subtle">
                  <td className="px-4 py-2">{condition.type}</td>
                  <td className="px-4 py-2">
                    <StatusBadge
                      status={
                        condition.type === 'Ready'
                          ? condition.status === 'True'
                            ? 'success'
                            : 'error'
                          : condition.status === 'False'
                            ? 'success'
                            : 'warning'
                      }
                    >
                      {condition.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2 text-text-secondary">{condition.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  )
}

export function NodeDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: node, isLoading } = useNode(name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Node not found
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <NodeOverview node={node} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Node" namespace="" name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace="" resourceName={name!} resourceKind="Node" /> },
  ]

  return (
    <ResourceDetailLayout
      kind="Node"
      name={node.name}
      status={node.status}
      statusType={getNodeStatus(node.status)}
      breadcrumbs={[
        { label: 'Nodes', href: ROUTES.NODES },
        { label: node.name },
      ]}
      tabs={tabs}
    />
  )
}
