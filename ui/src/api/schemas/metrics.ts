import { z } from 'zod'

export const ContainerMetricsSchema = z.object({
  Name: z.string(),
  CPUCores: z.number(),
  MemoryBytes: z.number(),
})

export const PodMetricsSchema = z.object({
  Namespace: z.string(),
  Name: z.string(),
  Containers: z.array(ContainerMetricsSchema),
  Timestamp: z.string(),
})

export const PodMetricsResponseSchema = z.object({
  items: z.array(PodMetricsSchema),
  count: z.number(),
})

export const NodeMetricsSchema = z.object({
  Name: z.string(),
  CPUCores: z.number(),
  CPUCapacity: z.number(),
  MemoryBytes: z.number(),
  MemoryCapacity: z.number(),
  Timestamp: z.string(),
})

export const NodeMetricsResponseSchema = z.object({
  items: z.array(NodeMetricsSchema),
  count: z.number(),
})

export const ClusterMetricsSchema = z.object({
  NodeCount: z.number(),
  PodCount: z.number(),
  CPUCores: z.number(),
  CPUCapacity: z.number(),
  MemoryBytes: z.number(),
  MemoryCapacity: z.number(),
  Timestamp: z.string(),
})

export type ContainerMetrics = z.infer<typeof ContainerMetricsSchema>
export type PodMetrics = z.infer<typeof PodMetricsSchema>
export type PodMetricsResponse = z.infer<typeof PodMetricsResponseSchema>
export type NodeMetrics = z.infer<typeof NodeMetricsSchema>
export type NodeMetricsResponse = z.infer<typeof NodeMetricsResponseSchema>
export type ClusterMetrics = z.infer<typeof ClusterMetricsSchema>
