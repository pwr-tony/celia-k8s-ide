import { useConnection, useClusterHealth } from '@/api/hooks'
import { useProblems } from '@/api/hooks'
import { Button } from '@/components/primitives'
import { AlertCircle, CheckCircle2, Loader2, Server, Box, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/router/routes'

function ConnectionStatus() {
  const { data: connection, isLoading } = useConnection()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Connecting...</span>
      </div>
    )
  }

  if (connection?.State !== 'connected') {
    return (
      <div className="flex items-center gap-2 text-warning">
        <AlertCircle className="h-4 w-4" />
        <span>Not connected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-success">
      <CheckCircle2 className="h-4 w-4" />
      <span className="font-medium">{connection.ContextName}</span>
    </div>
  )
}

function ClusterStats() {
  const { data: health, isLoading } = useClusterHealth()

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse bg-bg-tertiary rounded-lg" />
        ))}
      </div>
    )
  }

  if (!health) return null

  const stats = [
    {
      label: 'Nodes',
      value: health.nodes.total,
      detail: `${health.nodes.ready} ready`,
      icon: Server,
      status: health.nodes.not_ready > 0 ? 'warning' : 'success',
    },
    {
      label: 'Pods',
      value: health.pods.total,
      detail: `${health.pods.running} running`,
      icon: Box,
      status: health.pods.failed > 0 ? 'error' : 'success',
    },
    {
      label: 'Pending',
      value: health.pods.pending,
      detail: 'pods waiting',
      icon: Loader2,
      status: health.pods.pending > 10 ? 'warning' : 'success',
    },
    {
      label: 'Failed',
      value: health.pods.failed,
      detail: 'pods failed',
      icon: AlertTriangle,
      status: health.pods.failed > 0 ? 'error' : 'success',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">{stat.label}</span>
            <stat.icon
              className={cn(
                'h-5 w-5',
                stat.status === 'success' && 'text-success',
                stat.status === 'warning' && 'text-warning',
                stat.status === 'error' && 'text-error'
              )}
            />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-text-tertiary text-sm ml-2">{stat.detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProblemsList() {
  const { data: problems, isLoading } = useProblems()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-bg-tertiary rounded-lg" />
        ))}
      </div>
    )
  }

  if (!problems?.problems.length) {
    return (
      <div className="card p-8 text-center text-text-secondary">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
        <p>No problems detected</p>
      </div>
    )
  }

  const severityColors: Record<number, string> = {
    4: 'border-l-severity-critical',
    3: 'border-l-severity-high',
    2: 'border-l-severity-medium',
    1: 'border-l-severity-low',
  }

  return (
    <div className="space-y-2">
      {problems.problems.slice(0, 10).map((problem) => (
        <div
          key={problem.id}
          className={cn(
            'card p-4 border-l-4 cursor-pointer hover:bg-bg-hover transition-colors',
            severityColors[problem.severity]
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{problem.title}</div>
              <div className="text-sm text-text-secondary mt-1">
                {problem.namespace}/{problem.resource_name}
              </div>
            </div>
            <span className="badge bg-bg-tertiary text-text-secondary">{problem.type}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()

  return (
    <>
      <header className="shrink-0 border-b border-border-subtle bg-bg-secondary">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
          <ConnectionStatus />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <ClusterStats />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Problems</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PODS)}>
                View all
              </Button>
            </div>
            <ProblemsList />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="card p-4 space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                Scale Deployment
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Rollout Restart
              </Button>
              <Button variant="danger" className="w-full justify-start">
                Purge Failed Pods
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
