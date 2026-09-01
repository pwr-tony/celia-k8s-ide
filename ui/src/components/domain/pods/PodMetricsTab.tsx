import { usePodMetrics } from '@/api/hooks'
import { Loader2, Cpu, MemoryStick, AlertCircle, Container } from 'lucide-react'
import { formatBytes, formatCPU } from '@/components/data/ResourceUsageBar'

interface PodMetricsTabProps {
  namespace: string
  podName: string
}

export function PodMetricsTab({ namespace, podName }: PodMetricsTabProps) {
  const { data, isLoading, error } = usePodMetrics(namespace)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-2">
        <AlertCircle className="h-8 w-8 text-warning" />
        <span>Metrics not available</span>
        <span className="text-xs text-text-tertiary">Ensure metrics-server is installed in your cluster</span>
      </div>
    )
  }

  const podMetrics = data?.items?.find(p => p.Name === podName)

  if (!podMetrics || !podMetrics.Containers?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No metrics available for this pod
      </div>
    )
  }

  const totalCPU = podMetrics.Containers.reduce((sum, c) => sum + c.CPUCores, 0)
  const totalMemory = podMetrics.Containers.reduce((sum, c) => sum + c.MemoryBytes, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-accent-primary" />
            <span className="text-sm font-medium">Total CPU</span>
          </div>
          <p className="text-2xl font-bold">{formatCPU(totalCPU)}</p>
          <p className="text-xs text-text-tertiary">cores</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MemoryStick className="h-4 w-4 text-accent-secondary" />
            <span className="text-sm font-medium">Total Memory</span>
          </div>
          <p className="text-2xl font-bold">{formatBytes(totalMemory)}</p>
          <p className="text-xs text-text-tertiary">in use</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Container className="h-4 w-4" />
          Container Metrics
        </h3>

        <div className="space-y-4">
          {podMetrics.Containers.map((container) => (
            <div key={container.Name} className="card p-4">
              <h4 className="font-medium mb-4">{container.Name}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" />
                      CPU
                    </span>
                    <span className="text-sm font-mono">{formatCPU(container.CPUCores)}</span>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all"
                      style={{ width: `${Math.min((container.CPUCores / totalCPU) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <MemoryStick className="h-3.5 w-3.5" />
                      Memory
                    </span>
                    <span className="text-sm font-mono">{formatBytes(container.MemoryBytes)}</span>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-secondary rounded-full transition-all"
                      style={{ width: `${Math.min((container.MemoryBytes / totalMemory) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-xs text-text-tertiary text-center">
        Last updated: {new Date(podMetrics.Timestamp).toLocaleString()}
      </div>
    </div>
  )
}
