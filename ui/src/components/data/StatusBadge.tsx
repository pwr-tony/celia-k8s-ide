import { cn } from '@/lib/utils'

export type Status = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
  status: Status
  children: React.ReactNode
  className?: string
}

const statusStyles: Record<Status, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
  neutral: 'bg-bg-tertiary text-text-secondary border-border-subtle',
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  )
}

export function getPodStatus(phase: string, reason: string): Status {
  if (phase === 'Running' && !reason) return 'success'
  if (phase === 'Succeeded') return 'success'
  if (phase === 'Pending') return 'warning'
  if (phase === 'Failed' || reason === 'CrashLoopBackOff' || reason === 'ImagePullBackOff')
    return 'error'
  return 'neutral'
}

export function getDeploymentStatus(ready: number, desired: number): Status {
  if (ready === desired && desired > 0) return 'success'
  if (ready === 0) return 'error'
  return 'warning'
}

export function getNodeStatus(status: string): Status {
  if (status === 'Ready') return 'success'
  if (status === 'NotReady') return 'error'
  return 'warning'
}

export function getServiceType(type: string): Status {
  if (type === 'LoadBalancer') return 'info'
  if (type === 'NodePort') return 'warning'
  return 'neutral'
}
