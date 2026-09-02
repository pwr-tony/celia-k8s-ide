import { useState } from 'react'
import { useActionHistory, useUndoAction } from '@/api/hooks/useOperations'
import { Button } from '@/components/primitives'
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  RefreshCcw,
  Trash2,
  FileEdit,
  Download,
  Filter,
  Undo2,
} from 'lucide-react'
import type { Action } from '@/api/schemas'

const actionTypeIcons: Record<string, typeof ArrowUpDown> = {
  scale: ArrowUpDown,
  restart: RefreshCcw,
  delete: Trash2,
  update: FileEdit,
  purge: Trash2,
}

const actionTypeColors: Record<string, string> = {
  scale: 'text-blue-400',
  restart: 'text-yellow-400',
  delete: 'text-red-400',
  update: 'text-purple-400',
  purge: 'text-red-400',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diffSec = Math.floor((now - time) / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(timestamp).toLocaleDateString()
}

interface ActionRowProps {
  action: Action
  onUndo: (actionId: string) => void
  isUndoing: boolean
}

function ActionRow({ action, onUndo, isUndoing }: ActionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = actionTypeIcons[action.type] || FileEdit
  const iconColor = actionTypeColors[action.type] || 'text-text-secondary'
  const isSuccess = action.status === 'success' || action.status === 'completed'
  const isUndone = Boolean(action.undone_by)

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-bg-tertiary transition-colors text-left"
      >
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-success/10' : 'bg-error/10'} ${isUndone ? 'opacity-50' : ''}`}>
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-error" />
          )}
        </div>

        <div className={`flex-1 min-w-0 ${isUndone ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <span className="font-medium capitalize">{action.type}</span>
            <span className="text-text-tertiary">•</span>
            <span className="text-text-secondary">{action.resource_kind}</span>
            {isUndone && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning">Undone</span>
            )}
          </div>
          <p className="text-sm text-text-tertiary truncate">
            {action.namespace}/{action.resource_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {action.can_undo && !isUndone && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onUndo(action.id)
              }}
              disabled={isUndoing}
              className="shrink-0"
            >
              {isUndoing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1">Undo</span>
            </Button>
          )}
          <div className="text-right shrink-0">
            <p className="text-sm text-text-secondary">{formatRelativeTime(action.started_at)}</p>
            <p className="text-xs text-text-tertiary">{action.status}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-bg-tertiary/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-tertiary">Action ID</p>
              <p className="font-mono text-xs">{action.id}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Status</p>
              <p className={isSuccess ? 'text-success' : 'text-error'}>{action.status}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Started</p>
              <p>{formatTimestamp(action.started_at)}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Completed</p>
              <p>{formatTimestamp(action.completed_at)}</p>
            </div>
            {action.message && (
              <div className="col-span-2">
                <p className="text-text-tertiary">Message</p>
                <p>{action.message}</p>
              </div>
            )}
            {action.undone_by && (
              <div className="col-span-2">
                <p className="text-text-tertiary">Undone By</p>
                <p className="font-mono text-xs">{action.undone_by}</p>
              </div>
            )}
            {Object.keys(action.parameters).length > 0 && (
              <div className="col-span-2">
                <p className="text-text-tertiary mb-1">Parameters</p>
                <pre className="text-xs bg-bg-primary p-2 rounded overflow-x-auto">
                  {JSON.stringify(action.parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function AuditLogPage() {
  const [limit, setLimit] = useState(50)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [undoingId, setUndoingId] = useState<string | null>(null)
  const { data, isLoading, refetch, isFetching } = useActionHistory(limit)
  const undoMutation = useUndoAction()

  const filteredActions = data?.actions.filter((action) =>
    typeFilter ? action.type === typeFilter : true
  ) ?? []

  const actionTypes = [...new Set(data?.actions.map((a) => a.type) ?? [])]

  const handleUndo = (actionId: string) => {
    setUndoingId(actionId)
    undoMutation.mutate(
      { actionId },
      {
        onSettled: () => setUndoingId(null),
      }
    )
  }

  const handleExport = () => {
    if (!data?.actions) return

    const content = JSON.stringify(data.actions, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header className="shrink-0 border-b border-border-subtle bg-bg-secondary">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Audit Log</h1>
            <p className="text-sm text-text-tertiary mt-0.5">
              History of operations performed on the cluster
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} disabled={!data?.actions.length}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-tertiary" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-border-subtle bg-bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All types</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-md border border-border-subtle bg-bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>Last 500</option>
              </select>
            </div>

            {data && (
              <span className="text-sm text-text-tertiary">
                Showing {filteredActions.length} of {data.count} actions
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-bg-secondary p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-text-tertiary" />
              <p className="text-text-secondary font-medium">No actions recorded</p>
              <p className="text-sm text-text-tertiary mt-1">
                Operations like scale, restart, and delete will appear here
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border-subtle bg-bg-secondary overflow-hidden">
              {filteredActions.map((action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  onUndo={handleUndo}
                  isUndoing={undoingId === action.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
