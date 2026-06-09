import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type StatStatus = 'success' | 'warning' | 'error' | 'neutral'

interface StatCardProps {
  label: string
  value: number | string
  detail?: string
  icon: LucideIcon
  status: StatStatus
  progress?: {
    current: number
    total: number
  }
}

const statusStyles: Record<StatStatus, { card: string; icon: string; progress: string }> = {
  success: {
    card: 'bg-success/5 border-success/20 hover:bg-success/10',
    icon: 'text-success',
    progress: 'bg-success',
  },
  warning: {
    card: 'bg-warning/5 border-warning/20 hover:bg-warning/10',
    icon: 'text-warning',
    progress: 'bg-warning',
  },
  error: {
    card: 'bg-error/5 border-error/20 hover:bg-error/10',
    icon: 'text-error',
    progress: 'bg-error',
  },
  neutral: {
    card: 'bg-bg-secondary border-border-subtle hover:bg-bg-tertiary',
    icon: 'text-text-secondary',
    progress: 'bg-text-tertiary',
  },
}

export function StatCard({ label, value, detail, icon: Icon, status, progress }: StatCardProps) {
  const styles = statusStyles[status]
  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : null

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors duration-200',
        styles.card
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm font-medium">{label}</span>
        <div className={cn('rounded-md p-1.5 bg-current/10', styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {detail && (
          <span className="text-text-tertiary text-sm ml-2">{detail}</span>
        )}
      </div>

      {progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">
              {progress.current} / {progress.total}
            </span>
            <span className={cn('font-medium', styles.icon)}>{percentage}%</span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', styles.progress)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
