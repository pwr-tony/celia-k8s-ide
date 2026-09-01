import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/primitives'
import { SeverityBadge } from '@/components/data/SeverityBadge'
import { Button } from '@/components/primitives'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/router/routes'
import {
  ExternalLink,
  Clock,
  AlertCircle,
  Lightbulb,
  Box,
  Server,
  Layers,
} from 'lucide-react'
import type { Problem } from '@/api/schemas'

interface ProblemDetailModalProps {
  problem: Problem | null
  open: boolean
  onClose: () => void
}

function getResourceRoute(kind: string, namespace: string, name: string): string {
  switch (kind.toLowerCase()) {
    case 'pod':
      return `${ROUTES.PODS}/${namespace}/${name}`
    case 'deployment':
      return `${ROUTES.DEPLOYMENTS}/${namespace}/${name}`
    case 'service':
      return `${ROUTES.SERVICES}/${namespace}/${name}`
    case 'node':
      return `${ROUTES.NODES}/${name}`
    case 'configmap':
      return `${ROUTES.CONFIGMAPS}/${namespace}/${name}`
    case 'secret':
      return `${ROUTES.SECRETS}/${namespace}/${name}`
    default:
      return ROUTES.PODS
  }
}

function getResourceIcon(kind: string) {
  switch (kind.toLowerCase()) {
    case 'pod':
      return Box
    case 'node':
      return Server
    default:
      return Layers
  }
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

export function ProblemDetailModal({ problem, open, onClose }: ProblemDetailModalProps) {
  const navigate = useNavigate()

  if (!problem) return null

  const ResourceIcon = getResourceIcon(problem.resource_kind)

  const handleNavigateToResource = () => {
    const route = getResourceRoute(problem.resource_kind, problem.namespace, problem.resource_name)
    navigate(route)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <SeverityBadge severity={problem.severity as 1 | 2 | 3 | 4} showLabel />
            <div className="flex-1">
              <DialogTitle className="text-lg">{problem.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                <span className="font-mono text-xs px-1.5 py-0.5 bg-bg-tertiary rounded">
                  {problem.type}
                </span>
                <span>•</span>
                <span>Seen {problem.count} time{problem.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div
            onClick={handleNavigateToResource}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 cursor-pointer group"
          >
            <ResourceIcon className="h-5 w-5 text-text-secondary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{problem.resource_kind}</p>
              <p className="text-sm text-text-secondary">
                {problem.namespace ? `${problem.namespace}/` : ''}{problem.resource_name}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-text-tertiary group-hover:text-accent-primary" />
          </div>

          <section>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Description</h4>
            <p className="text-sm">{problem.description}</p>
          </section>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="h-4 w-4" />
              <span>First detected: {formatRelativeTime(problem.detected_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="h-4 w-4" />
              <span>Last seen: {formatRelativeTime(problem.last_seen_at)}</span>
            </div>
          </div>

          {problem.possible_causes.length > 0 && (
            <section>
              <h4 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Possible Causes
              </h4>
              <ul className="space-y-1">
                {problem.possible_causes.map((cause, idx) => (
                  <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-text-tertiary">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {problem.suggestions.length > 0 && (
            <section>
              <h4 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Suggestions
              </h4>
              <ul className="space-y-2">
                {problem.suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="text-sm p-2 rounded bg-warning/5 border border-warning/20"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {problem.affected_node && (
            <section>
              <h4 className="text-sm font-medium text-text-secondary mb-2">Affected Node</h4>
              <button
                onClick={() => {
                  navigate(`${ROUTES.NODES}/${problem.affected_node}`)
                  onClose()
                }}
                className="text-sm text-accent-primary hover:underline"
              >
                {problem.affected_node}
              </button>
            </section>
          )}

          {problem.related_pods.length > 0 && (
            <section>
              <h4 className="text-sm font-medium text-text-secondary mb-2">Related Pods</h4>
              <div className="flex flex-wrap gap-2">
                {problem.related_pods.map((pod, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-bg-tertiary rounded font-mono"
                  >
                    {pod}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-subtle">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleNavigateToResource}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Go to Resource
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
