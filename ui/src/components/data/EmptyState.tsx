import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Box,
  Server,
  Globe,
  FileText,
  Lock,
  HardDrive,
  Calendar,
  ScrollText,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/primitives'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-text-tertiary" />
        </div>
      )}
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-tertiary max-w-sm mb-4">{description}</p>
      )}
      {children}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action && (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.icon && <action.icon className="h-4 w-4 mr-1" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface ResourceEmptyStateProps {
  resourceType: string
  hasFilter?: boolean
  onClearFilter?: () => void
  onRefresh?: () => void
}

const resourceIcons: Record<string, LucideIcon> = {
  pods: Box,
  deployments: Server,
  services: Globe,
  configmaps: FileText,
  secrets: Lock,
  nodes: Server,
  statefulsets: Server,
  daemonsets: Server,
  jobs: Calendar,
  cronjobs: Calendar,
  events: ScrollText,
  problems: AlertTriangle,
  persistentvolumeclaims: HardDrive,
  persistentvolumes: HardDrive,
}

const resourceMessages: Record<string, { title: string; description: string; filteredDescription: string }> = {
  pods: {
    title: 'No pods found',
    description: 'There are no pods in this namespace. Deploy a workload to see pods here.',
    filteredDescription: 'No pods match your search criteria. Try adjusting your filters.',
  },
  deployments: {
    title: 'No deployments found',
    description: 'There are no deployments in this namespace. Create a deployment to get started.',
    filteredDescription: 'No deployments match your search criteria.',
  },
  services: {
    title: 'No services found',
    description: 'There are no services in this namespace. Services expose your workloads to network traffic.',
    filteredDescription: 'No services match your search criteria.',
  },
  configmaps: {
    title: 'No configmaps found',
    description: 'There are no configmaps in this namespace. ConfigMaps store configuration data.',
    filteredDescription: 'No configmaps match your search criteria.',
  },
  secrets: {
    title: 'No secrets found',
    description: 'There are no secrets in this namespace. Secrets store sensitive data like passwords and tokens.',
    filteredDescription: 'No secrets match your search criteria.',
  },
  nodes: {
    title: 'No nodes found',
    description: 'Unable to retrieve node information. Check your cluster connection.',
    filteredDescription: 'No nodes match your search criteria.',
  },
  events: {
    title: 'No events',
    description: 'No recent events for this resource. Events show important cluster activities.',
    filteredDescription: 'No events match your filter.',
  },
  problems: {
    title: 'No problems detected',
    description: 'Your cluster looks healthy! No issues were found during the last scan.',
    filteredDescription: 'No problems match your filter criteria.',
  },
}

export function ResourceEmptyState({
  resourceType,
  hasFilter = false,
  onClearFilter,
  onRefresh,
}: ResourceEmptyStateProps) {
  const Icon = resourceIcons[resourceType] || Box
  const messages = resourceMessages[resourceType] || {
    title: `No ${resourceType} found`,
    description: `There are no ${resourceType} in this namespace.`,
    filteredDescription: `No ${resourceType} match your search criteria.`,
  }

  if (hasFilter && onClearFilter) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={messages.filteredDescription}
        action={{
          label: 'Clear filters',
          onClick: onClearFilter,
          icon: Filter,
        }}
        secondaryAction={onRefresh ? { label: 'Refresh', onClick: onRefresh } : undefined}
      />
    )
  }

  return (
    <EmptyState
      icon={Icon}
      title={messages.title}
      description={messages.description}
      action={onRefresh ? { label: 'Refresh', onClick: onRefresh, icon: RefreshCw } : undefined}
    />
  )
}

export function NoDataEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={Box}
      title="No data available"
      description="Unable to load data. This could be a temporary issue."
      action={onRetry ? { label: 'Try again', onClick: onRetry, icon: RefreshCw } : undefined}
    />
  )
}

export function SearchEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No results for "${query}". Try a different search term.`}
      action={{ label: 'Clear search', onClick: onClear, icon: Filter }}
    />
  )
}
