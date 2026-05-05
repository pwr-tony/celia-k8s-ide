import { cn } from '@/lib/utils'

interface ProblemBadgeProps {
  count: number
  className?: string
}

export function ProblemBadge({ count, className }: ProblemBadgeProps) {
  if (count === 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full',
        'bg-error text-white',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
