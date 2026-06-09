import { useConnection, useClusterHealth } from '@/api/hooks'
import { useProblems } from '@/api/hooks'
import { Button } from '@/components/primitives'
import { StatCard } from '@/components/data/StatCard'
import { ProblemCard } from '@/components/data/ProblemCard'
import { AlertCircle, CheckCircle2, Loader2, Server, Box, AlertTriangle, Clock } from 'lucide-react'
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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
      </span>
      <span className="text-sm font-medium text-success">{connection.ContextName}</span>
    </div>
  )
}

function ClusterStats() {
  const { data: health, isLoading } = useClusterHealth()

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse bg-bg-tertiary rounded-lg" />
        ))}
      </div>
    )
  }

  if (!health) return null

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Nodes"
        value={health.nodes.total}
        detail="total"
        icon={Server}
        status={health.nodes.not_ready > 0 ? 'warning' : 'success'}
        progress={{ current: health.nodes.ready, total: health.nodes.total }}
      />
      <StatCard
        label="Pods"
        value={health.pods.total}
        detail="total"
        icon={Box}
        status={health.pods.failed > 0 ? 'error' : health.pods.pending > 0 ? 'warning' : 'success'}
        progress={{ current: health.pods.running, total: health.pods.total }}
      />
      <StatCard
        label="Pending"
        value={health.pods.pending}
        detail="pods waiting"
        icon={Clock}
        status={health.pods.pending > 10 ? 'warning' : health.pods.pending > 0 ? 'neutral' : 'success'}
      />
      <StatCard
        label="Failed"
        value={health.pods.failed}
        detail="pods failed"
        icon={AlertTriangle}
        status={health.pods.failed > 0 ? 'error' : 'success'}
      />
    </div>
  )
}

function ProblemsList() {
  const { data: problems, isLoading } = useProblems()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse bg-bg-tertiary rounded-lg" />
        ))}
      </div>
    )
  }

  if (!problems?.problems.length) {
    return (
      <div className="rounded-lg border border-success/20 bg-success/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
        <p className="text-text-secondary font-medium">No problems detected</p>
        <p className="text-text-tertiary text-sm mt-1">Your cluster is healthy</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {problems.problems.slice(0, 10).map((problem) => (
        <ProblemCard
          key={problem.id}
          id={problem.id}
          title={problem.title}
          type={problem.type}
          namespace={problem.namespace}
          resourceName={problem.resource_name}
          severity={problem.severity as 1 | 2 | 3 | 4}
          onClick={() => navigate(`${ROUTES.PODS}?highlight=${problem.resource_name}`)}
        />
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
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-tertiary mt-0.5">Cluster overview and health status</p>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <ClusterStats />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Active Problems</h2>
                <p className="text-sm text-text-tertiary">Issues requiring attention</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PODS)}>
                View all
              </Button>
            </div>
            <ProblemsList />
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-text-tertiary">Common operations</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4 space-y-2">
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
