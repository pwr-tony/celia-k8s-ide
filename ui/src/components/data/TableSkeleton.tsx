import { Skeleton } from '@/components/primitives/Skeleton'

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 5, rows = 8 }: TableSkeletonProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex-1 border rounded-lg border-border-subtle bg-bg-secondary overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-bg-tertiary">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="text-left px-4 py-3 border-b border-border-subtle">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border-subtle last:border-b-0">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <Skeleton
                      className={`h-4 ${
                        colIndex === 0 ? 'w-32' :
                        colIndex === columns - 1 ? 'w-16' :
                        'w-24'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border-subtle">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </td>
      ))}
    </tr>
  )
}
