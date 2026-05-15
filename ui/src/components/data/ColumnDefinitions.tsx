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
  podHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  podHelper.accessor('Namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  podHelper.accessor((row) => ({ phase: row.Phase, status: row.Status }), {
    id: 'status',
    header: 'Status',
    cell: (info) => {
      const { phase, status } = info.getValue()
      const displayStatus = status || phase
      return (
        <StatusBadge status={getPodStatus(phase, status)}>
          {displayStatus}
        </StatusBadge>
      )
    },
  }),
  podHelper.accessor('NodeName', {
    header: 'Node',
    cell: (info) => info.getValue() || '-',
  }),
  podHelper.accessor('RestartCount', {
    header: 'Restarts',
    cell: (info) => {
      const count = info.getValue()
      if (count > 10) return <span className="text-error">{count}</span>
      if (count > 0) return <span className="text-warning">{count}</span>
      return <span className="text-text-secondary">{count}</span>
    },
  }),
  podHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const podColumns = _podColumns as typeof _podColumns

const deploymentHelper = createColumnHelper<Deployment>()
const _deploymentColumns = [
  deploymentHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  deploymentHelper.accessor('Namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  deploymentHelper.accessor((row) => ({ ready: row.ReadyReplicas, desired: row.Replicas }), {
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
  deploymentHelper.accessor('UpdatedReplicas', {
    header: 'Up-to-date',
    cell: (info) => info.getValue(),
  }),
  deploymentHelper.accessor('AvailableReplicas', {
    header: 'Available',
    cell: (info) => info.getValue(),
  }),
  deploymentHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const deploymentColumns = _deploymentColumns as typeof _deploymentColumns

const serviceHelper = createColumnHelper<Service>()
const _serviceColumns = [
  serviceHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('Namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('Type', {
    header: 'Type',
    cell: (info) => (
      <StatusBadge status={getServiceType(info.getValue())}>
        {info.getValue()}
      </StatusBadge>
    ),
  }),
  serviceHelper.accessor('ClusterIP', {
    header: 'Cluster IP',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  serviceHelper.accessor('Ports', {
    header: 'Ports',
    cell: (info) => {
      const ports = info.getValue()
      if (!ports?.length) return '-'
      return (
        <span className="font-mono text-sm">
          {ports.map((p) => `${p.Port}/${p.Protocol}`).join(', ')}
        </span>
      )
    },
  }),
  serviceHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const serviceColumns = _serviceColumns as typeof _serviceColumns

const configMapHelper = createColumnHelper<ConfigMap>()
const _configMapColumns = [
  configMapHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  configMapHelper.accessor('Namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  configMapHelper.accessor('Data', {
    header: 'Data Keys',
    cell: (info) => {
      const data = info.getValue()
      const keys = Object.keys(data || {})
      return keys.length
    },
  }),
  configMapHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const configMapColumns = _configMapColumns as typeof _configMapColumns

const secretHelper = createColumnHelper<Secret>()
const _secretColumns = [
  secretHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  secretHelper.accessor('Namespace', {
    header: 'Namespace',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  secretHelper.accessor('Type', {
    header: 'Type',
    cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
  }),
  secretHelper.accessor('DataKeys', {
    header: 'Data Keys',
    cell: (info) => info.getValue()?.length ?? 0,
  }),
  secretHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const secretColumns = _secretColumns as typeof _secretColumns

const nodeHelper = createColumnHelper<Node>()
const _nodeColumns = [
  nodeHelper.accessor('Name', {
    header: 'Name',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  nodeHelper.accessor('Status', {
    header: 'Status',
    cell: (info) => (
      <StatusBadge status={getNodeStatus(info.getValue())}>
        {info.getValue()}
      </StatusBadge>
    ),
  }),
  nodeHelper.accessor('Roles', {
    header: 'Roles',
    cell: (info) => info.getValue()?.join(', ') || '-',
  }),
  nodeHelper.accessor('Version', {
    header: 'Version',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  nodeHelper.accessor('CreatedAt', {
    header: 'Age',
    cell: (info) => formatAge(info.getValue()),
  }),
]
export const nodeColumns = _nodeColumns as typeof _nodeColumns
