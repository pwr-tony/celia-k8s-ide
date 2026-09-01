import { useQuery } from '@tanstack/react-query'
import { get } from '../client'
import {
  NodeMetricsResponseSchema,
  PodMetricsResponseSchema,
  ClusterMetricsSchema,
  type NodeMetricsResponse,
  type PodMetricsResponse,
  type ClusterMetrics,
} from '../schemas'

export function useNodeMetrics() {
  return useQuery({
    queryKey: ['metrics', 'nodes'],
    queryFn: () => get<NodeMetricsResponse>('/metrics/nodes', NodeMetricsResponseSchema),
    refetchInterval: 15000,
    retry: false,
  })
}

export function usePodMetrics(namespace?: string) {
  const url = namespace ? `/metrics/pods?namespace=${namespace}` : '/metrics/pods'
  return useQuery({
    queryKey: ['metrics', 'pods', namespace ?? 'all'],
    queryFn: () => get<PodMetricsResponse>(url, PodMetricsResponseSchema),
    refetchInterval: 15000,
    retry: false,
  })
}

export function useClusterMetrics() {
  return useQuery({
    queryKey: ['metrics', 'cluster'],
    queryFn: () => get<ClusterMetrics>('/metrics/cluster', ClusterMetricsSchema),
    refetchInterval: 15000,
    retry: false,
  })
}
