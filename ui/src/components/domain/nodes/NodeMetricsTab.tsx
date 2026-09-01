import { useNodeMetrics } from '@/api/hooks'
import { Loader2, Cpu, MemoryStick, AlertCircle } from 'lucide-react'
import { ResourceUsageBar, formatBytes, formatCPU } from '@/components/data/ResourceUsageBar'

interface NodeMetricsTabProps {
  nodeName: string
}

export function NodeMetricsTab({ nodeName }: NodeMetricsTabProps) {
  const { data, isLoading, error } = useNodeMetrics()

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

  const nodeMetrics = data?.items?.find(n => n.Name === nodeName)

  if (!nodeMetrics) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No metrics available for this node
      </div>
    )
  }

  const cpuPercent = nodeMetrics.CPUCapacity > 0
    ? (nodeMetrics.CPUCores / nodeMetrics.CPUCapacity) * 100
    : 0
  const memPercent = nodeMetrics.MemoryCapacity > 0
    ? (nodeMetrics.MemoryBytes / nodeMetrics.MemoryCapacity) * 100
    : 0

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-primary/10">
              <Cpu className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="font-medium">CPU Usage</h3>
              <p className="text-xs text-text-tertiary">Current utilization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{cpuPercent.toFixed(1)}%</span>
            </div>

            <ResourceUsageBar
              used={nodeMetrics.CPUCores}
              total={nodeMetrics.CPUCapacity}
              label="Cores"
              formatValue={formatCPU}
              size="lg"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                <p className="text-text-tertiary text-xs">Used</p>
                <p className="font-mono font-medium">{formatCPU(nodeMetrics.CPUCores)} cores</p>
              </div>
              <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                <p className="text-text-tertiary text-xs">Capacity</p>
                <p className="font-mono font-medium">{formatCPU(nodeMetrics.CPUCapacity)} cores</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-secondary/10">
              <MemoryStick className="h-5 w-5 text-accent-secondary" />
            </div>
            <div>
              <h3 className="font-medium">Memory Usage</h3>
              <p className="text-xs text-text-tertiary">Current utilization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{memPercent.toFixed(1)}%</span>
            </div>

            <ResourceUsageBar
              used={nodeMetrics.MemoryBytes}
              total={nodeMetrics.MemoryCapacity}
              label="Memory"
              formatValue={formatBytes}
              size="lg"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                <p className="text-text-tertiary text-xs">Used</p>
                <p className="font-mono font-medium">{formatBytes(nodeMetrics.MemoryBytes)}</p>
              </div>
              <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                <p className="text-text-tertiary text-xs">Capacity</p>
                <p className="font-mono font-medium">{formatBytes(nodeMetrics.MemoryCapacity)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-text-tertiary text-center">
        Last updated: {new Date(nodeMetrics.Timestamp).toLocaleString()}
      </div>
    </div>
  )
}
