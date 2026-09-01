import { cn } from '@/lib/utils'
import { SeverityBadge } from './SeverityBadge'
import { ChevronRight, Box, Server, Layers, Settings } from 'lucide-react'

type Severity = 1 | 2 | 3 | 4

interface ProblemCardProps {
  id: string
  title: string
  type: string
  namespace: string
  resourceName: string
  resourceKind?: string
  severity: Severity
  onClick?: () => void
}

function getResourceIcon(kind?: string) {
  switch (kind?.toLowerCase()) {
    case 'pod':
      return Box
    case 'node':
      return Server
    case 'deployment':
      return Layers
    default:
      return Settings
  }
}

const severityGradients: Record<Severity, string> = {
  4: 'from-severity-critical/10 via-transparent',
  3: 'from-severity-high/10 via-transparent',
  2: 'from-severity-medium/10 via-transparent',
  1: 'from-severity-low/10 via-transparent',
}

const severityBorders: Record<Severity, string> = {
  4: 'border-l-severity-critical',
  3: 'border-l-severity-high',
  2: 'border-l-severity-medium',
  1: 'border-l-severity-low',
}

export function ProblemCard({
  title,
  type,
  namespace,
  resourceName,
  resourceKind,
  severity,
  onClick,
}: ProblemCardProps) {
  const ResourceIcon = getResourceIcon(resourceKind)

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border-subtle',
        'bg-gradient-to-r',
        severityGradients[severity],
        'to-bg-secondary',
        'border-l-4',
        severityBorders[severity],
        'p-4 cursor-pointer',
        'hover:border-border-default hover:shadow-md',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={severity} showLabel={false} />
            <span className="font-medium text-text-primary truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <ResourceIcon className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <span className="truncate">
              {namespace ? `${namespace}/` : ''}{resourceName}
            </span>
            <span className="text-text-tertiary">•</span>
            <span className="text-text-tertiary font-mono text-xs">{type}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>
  )
}
