import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-bg-tertiary',
        className
      )}
    />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-8 w-8 rounded-full', className)} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-border-subtle bg-bg-secondary p-4', className)}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  )
}
