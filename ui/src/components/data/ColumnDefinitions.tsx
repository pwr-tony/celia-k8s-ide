import { createColumnHelper } from '@tanstack/react-table'
import type { Pod, Deployment, Service, Node, ConfigMap, Secret } from '@/api/schemas'
import { StatusBadge, getPodStatus, getDeploymentStatus, getNodeStatus, getServiceType } from './StatusBadge'

function formatAge(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d`
  if (diffHours > 0) return `${diffHours}h`
  if (diffMins > 0) return `${diffMins}m`
  return '<1m'
}

const podHelper = createColumnHelper<Pod>()
const _podColumns = [
  podHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  podHelper.accessor('namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  podHelper.accessor((row) => ({ phase: row.phase, reason: row.reason }), {
    id: 'status',
    header: 'Status',
    cell: (info) => {
      const { phase, reason } = info.getValue()
      const displayStatus = reason || phase
      return (
        <StatusBadge status={getPodStatus(phase, reason)}>
          {displayStatus}
        </StatusBadge>
      )
    },
  }),
  podHelper.accessor('node_name', {
    header: 'Node',
    cell: (info) => info.getValue() || '-',
  }),
  podHelper.accessor('restart_count', {
    header: 'Restarts',
    cell: (info) => {
      const count = info.getValue()
      if (count > 10) return <span className="text-error">{count}</span>
      if (count > 0) return <span className="text-warning">{count}</span>
      return <span className="text-text-secondary">{count}</span>
    },
  }),
  podHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const podColumns = _podColumns as typeof _podColumns

const deploymentHelper = createColumnHelper<Deployment>()
const _deploymentColumns = [
  deploymentHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  deploymentHelper.accessor('namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  deploymentHelper.accessor((row) => ({ ready: row.ready_replicas, desired: row.replicas }), {
    id: 'ready',
    header: 'Ready',
    cell: (info) => {
      const { ready, desired } = info.getValue()
      return (
        <StatusBadge status={getDeploymentStatus(ready, desired)}>
          {ready}/{desired}
        </StatusBadge>
      )
    },
  }),
  deploymentHelper.accessor('updated_replicas', {
    header: 'Up-to-date',
    cell: (info) => info.getValue(),
  }),
  deploymentHelper.accessor('available_replicas', {
    header: 'Available',
    cell: (info) => info.getValue(),
  }),
  deploymentHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const deploymentColumns = _deploymentColumns as typeof _deploymentColumns

const serviceHelper = createColumnHelper<Service>()
const _serviceColumns = [
  serviceHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('type', {
    header: 'Type',
    cell: (info) => (
      <StatusBadge status={getServiceType(info.getValue())}>
        {info.getValue()}
      </StatusBadge>
    ),
  }),
  serviceHelper.accessor('cluster_ip', {
    header: 'Cluster IP',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('ports', {
    header: 'Ports',
    cell: (info) => {
      const ports = info.getValue()
      if (!ports?.length) return '-'
      return (
        <span className="font-mono text-sm">
          {ports.map((p) => `${p.port}/${p.protocol}`).join(', ')}
        </span>
      )
    },
  }),
  serviceHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const serviceColumns = _serviceColumns as typeof _serviceColumns

const configMapHelper = createColumnHelper<ConfigMap>()
const _configMapColumns = [
  configMapHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  configMapHelper.accessor('namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  configMapHelper.accessor('data', {
    header: 'Data Keys',
    cell: (info) => {
      const data = info.getValue()
      const keys = Object.keys(data || {})
      return keys.length
    },
  }),
  configMapHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const configMapColumns = _configMapColumns as typeof _configMapColumns

const secretHelper = createColumnHelper<Secret>()
const _secretColumns = [
  secretHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  secretHelper.accessor('namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  secretHelper.accessor('type', {
    header: 'Type',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  secretHelper.accessor('data_keys', {
    header: 'Data Keys',
    cell: (info) => info.getValue()?.length ?? 0,
  }),
  secretHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const secretColumns = _secretColumns as typeof _secretColumns

const nodeHelper = createColumnHelper<Node>()
const _nodeColumns = [
  nodeHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  nodeHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <StatusBadge status={getNodeStatus(info.getValue())}>
        {info.getValue()}
      </StatusBadge>
    ),
  }),
  nodeHelper.accessor('roles', {
    header: 'Roles',
    cell: (info) => info.getValue()?.join(', ') || '-',
  }),
  nodeHelper.accessor('version', {
    header: 'Version',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  nodeHelper.accessor('created_at', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const nodeColumns = _nodeColumns as typeof _nodeColumns
