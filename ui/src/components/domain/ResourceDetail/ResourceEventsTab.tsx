import { useEvents } from '@/api/hooks'
import { useMemo } from 'react'
import { AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceEventsTabProps {
  namespace: string
  resourceName: string
  resourceKind: string
}

function formatTimestamp(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString()
}

export function ResourceEventsTab({ namespace, resourceName, resourceKind }: ResourceEventsTabProps) {
  const { data, isLoading } = useEvents(namespace)

  const filteredEvents = useMemo(() => {
    if (!data?.events) return []
    return data.events.filter(
      (event) =>
        event.involved_object.name === resourceName &&
        event.involved_object.kind === resourceKind
    )
  }, [data?.events, resourceName, resourceKind])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No events found for this resource
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {filteredEvents.map((event, index) => (
        <div
          key={`${event.name}-${index}`}
          className={cn(
            'p-4 rounded-lg border',
            event.type === 'Warning'
              ? 'bg-warning/5 border-warning/20'
              : 'bg-bg-tertiary border-border-subtle'
          )}
        >
          <div className="flex items-start gap-3">
            {event.type === 'Warning' ? (
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            ) : event.type === 'Normal' ? (
              <Info className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-text-primary">{event.reason}</span>
                {event.count > 1 && (
                  <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded">
                    x{event.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary break-words">{event.message}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                <span>Source: {event.source}</span>
                <span>Last seen: {formatTimestamp(event.last_timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
