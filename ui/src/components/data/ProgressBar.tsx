import { cn } from '@/lib/utils'

type ProgressStatus = 'success' | 'warning' | 'error' | 'neutral'

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

function getProgressStatus(percentage: number): ProgressStatus {
  if (percentage >= 100) return 'success'
  if (percentage >= 70) return 'warning'
  if (percentage > 0) return 'error'
  return 'neutral'
}

const statusColors: Record<ProgressStatus, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-text-tertiary',
}

const statusTextColors: Record<ProgressStatus, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-text-tertiary',
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  const status = getProgressStatus(percentage)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">
            {current} / {total}
          </span>
          <span className={cn('font-medium', statusTextColors[status])}>
            {percentage}%
          </span>
        </div>
      )}
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
