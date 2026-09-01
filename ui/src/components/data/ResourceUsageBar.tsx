import { cn } from '@/lib/utils'

type UsageStatus = 'low' | 'medium' | 'high' | 'critical'

interface ResourceUsageBarProps {
  used: number
  total: number
  label?: string
  formatValue?: (value: number) => string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 90) return 'critical'
  if (percentage >= 75) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

const statusColors: Record<UsageStatus, string> = {
  low: 'bg-success',
  medium: 'bg-accent-primary',
  high: 'bg-warning',
  critical: 'bg-error',
}

const statusTextColors: Record<UsageStatus, string> = {
  low: 'text-success',
  medium: 'text-accent-primary',
  high: 'text-warning',
  critical: 'text-error',
}

function defaultFormat(value: number): string {
  return value.toFixed(1)
}

export function ResourceUsageBar({
  used,
  total,
  label,
  formatValue = defaultFormat,
  size = 'md',
  className,
}: ResourceUsageBarProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0
  const status = getUsageStatus(percentage)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary">
            {formatValue(used)} / {formatValue(total)}
          </span>
          <span className={cn('font-medium', statusTextColors[status])}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className={cn('bg-bg-tertiary rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            statusColors[status]
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'Ki', 'Mi', 'Gi', 'Ti']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatCPU(cores: number): string {
  if (cores < 1) {
    return `${(cores * 1000).toFixed(0)}m`
  }
  return `${cores.toFixed(2)}`
}
