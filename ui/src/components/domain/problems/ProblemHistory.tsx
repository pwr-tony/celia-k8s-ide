import { useProblemHistoryStore } from '@/stores/problem-history'
import { SeverityBadge } from '@/components/data/SeverityBadge'
import { CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/primitives'

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffSec = Math.floor((now - timestamp) / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export function ProblemHistory() {
  const { resolvedProblems, clearHistory } = useProblemHistoryStore()

  if (resolvedProblems.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-6 text-center">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-text-tertiary" />
        <p className="text-sm text-text-tertiary">No recently resolved problems</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-sm text-text-secondary">
          {resolvedProblems.length} resolved
        </span>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {resolvedProblems.slice(0, 10).map((resolved, idx) => (
          <div
            key={`${resolved.problem.id}-${idx}`}
            className="px-4 py-3 border-b border-border-subtle last:border-b-0 flex items-start gap-3"
          >
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={resolved.problem.severity as 1|2|3|4} showLabel={false} />
                <span className="text-sm truncate">{resolved.problem.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <span>{resolved.problem.namespace}/{resolved.problem.resource_name}</span>
                <span>•</span>
                <span>Resolved {formatRelativeTime(resolved.resolvedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
