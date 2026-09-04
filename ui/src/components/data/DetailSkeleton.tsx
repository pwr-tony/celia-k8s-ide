import { Skeleton, SkeletonCard } from '@/components/primitives/Skeleton'

export function DetailHeaderSkeleton() {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-bg-secondary">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      <div className="px-6 flex gap-1 border-t border-border-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20" />
        ))}
      </div>
    </header>
  )
}

export function DetailOverviewSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <section>
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-32 rounded-md" />
          ))}
        </div>
      </section>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <DetailHeaderSkeleton />
      <div className="flex-1 overflow-auto">
        <DetailOverviewSkeleton />
      </div>
    </div>
  )
}

export function YAMLSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-border-subtle bg-bg-tertiary">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton
              className="h-4"
              style={{ width: `${Math.random() * 40 + 20}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventsSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-bg-secondary">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
