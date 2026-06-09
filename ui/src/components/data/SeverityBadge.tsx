import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, Info, AlertOctagon } from 'lucide-react'

type Severity = 1 | 2 | 3 | 4

interface SeverityBadgeProps {
  severity: Severity
  showLabel?: boolean
  className?: string
}

const severityConfig: Record<Severity, {
  label: string
  icon: typeof AlertCircle
  styles: string
}> = {
  4: {
    label: 'Critical',
    icon: AlertOctagon,
    styles: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  },
  3: {
    label: 'High',
    icon: AlertCircle,
    styles: 'bg-severity-high/15 text-severity-high border-severity-high/30',
  },
  2: {
    label: 'Medium',
    icon: AlertTriangle,
    styles: 'bg-severity-medium/15 text-severity-medium border-severity-medium/30',
  },
  1: {
    label: 'Low',
    icon: Info,
    styles: 'bg-severity-low/15 text-severity-low border-severity-low/30',
  },
}

export function SeverityBadge({ severity, showLabel = true, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
        config.styles,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </span>
  )
}

export function getSeverityLabel(severity: Severity): string {
  return severityConfig[severity].label
}
