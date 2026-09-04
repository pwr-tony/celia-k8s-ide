import { useEvents } from '@/api/hooks'
import { useMemo, useState } from 'react'
import { AlertCircle, Info, AlertTriangle, List, GitBranch, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventsSkeleton, EmptyState } from '@/components/data'
import type { Event } from '@/api/schemas'

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

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  return `${diffDay}d ago`
}

function EventTimelineView({ events }: { events: Event[] }) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      new Date(b.LastTimestamp).getTime() - new Date(a.LastTimestamp).getTime()
    )
  }, [events])

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border-subtle" />

      {sortedEvents.map((event, index) => (
        <div key={`${event.Name}-${index}`} className="relative pb-6 last:pb-0">
          <div
            className={cn(
              'absolute left-0 w-4 h-4 rounded-full border-2 -translate-x-[7px]',
              event.Type === 'Warning'
                ? 'bg-warning/20 border-warning'
                : 'bg-accent-primary/20 border-accent-primary'
            )}
          />

          <div className="ml-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-tertiary font-mono">
                {formatRelativeTime(event.LastTimestamp)}
              </span>
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  event.Type === 'Warning'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-accent-primary/10 text-accent-primary'
                )}
              >
                {event.Type}
              </span>
              {event.Count > 1 && (
                <span className="text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded">
                  x{event.Count}
                </span>
              )}
            </div>

            <div className="font-medium text-sm text-text-primary mb-0.5">
              {event.Reason}
            </div>

            <p className="text-sm text-text-secondary break-words">
              {event.Message}
            </p>

            <div className="text-xs text-text-tertiary mt-1">
              {event.Source}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ResourceEventsTab({ namespace, resourceName, resourceKind }: ResourceEventsTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('timeline')
  const { data, isLoading } = useEvents(namespace)

  const filteredEvents = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter(
      (event) =>
        event.InvolvedObject.Name === resourceName &&
        event.InvolvedObject.Kind === resourceKind
    )
  }, [data?.items, resourceName, resourceKind])

  if (isLoading) {
    return <EventsSkeleton />
  }

  if (filteredEvents.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No events"
        description="No recent events for this resource. Events appear when Kubernetes records important activities like container starts, scheduling decisions, or errors."
        className="h-64"
      />
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-secondary">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1 bg-bg-tertiary rounded p-0.5">
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'timeline'
                ? 'bg-bg-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Timeline view"
          >
            <GitBranch className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-bg-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <EventTimelineView events={filteredEvents} />
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event, index) => (
            <div
              key={`${event.Name}-${index}`}
              className={cn(
                'p-4 rounded-lg border',
                event.Type === 'Warning'
                  ? 'bg-warning/5 border-warning/20'
                  : 'bg-bg-tertiary border-border-subtle'
              )}
            >
              <div className="flex items-start gap-3">
                {event.Type === 'Warning' ? (
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                ) : event.Type === 'Normal' ? (
                  <Info className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary">{event.Reason}</span>
                    {event.Count > 1 && (
                      <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded">
                        x{event.Count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary break-words">{event.Message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                    <span>Source: {event.Source}</span>
                    <span>Last seen: {formatTimestamp(event.LastTimestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
