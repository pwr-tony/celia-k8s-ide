import { z } from 'zod'

export const SeveritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
])

export const ProblemSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: SeveritySchema,
  title: z.string(),
  description: z.string(),
  resource_kind: z.string(),
  namespace: z.string(),
  resource_name: z.string(),
  detected_at: z.string(),
  last_seen_at: z.string(),
  count: z.number(),
  related_events: z.array(z.string()),
  related_pods: z.array(z.string()),
  affected_node: z.string(),
  possible_causes: z.array(z.string()),
  suggestions: z.array(z.string()),
})

export const ProblemsResponseSchema = z.object({
  problems: z.array(ProblemSchema),
  total: z.number(),
  by_severity: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
})

export const ProblemStatsSchema = z.object({
  total: z.number(),
  by_severity: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  by_type: z.record(z.string(), z.number()),
  by_namespace: z.record(z.string(), z.number()),
})

export const DiagnosisSchema = z.object({
  resource_kind: z.string(),
  namespace: z.string(),
  resource_name: z.string(),
  status: z.string(),
  problems: z.array(ProblemSchema),
  events: z.array(
    z.object({
      type: z.string(),
      reason: z.string(),
      message: z.string(),
      count: z.number(),
      last_timestamp: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
  related_resources: z.array(
    z.object({
      kind: z.string(),
      name: z.string(),
      namespace: z.string(),
    })
  ),
})

export type Severity = z.infer<typeof SeveritySchema>
export type Problem = z.infer<typeof ProblemSchema>
export type ProblemsResponse = z.infer<typeof ProblemsResponseSchema>
export type ProblemStats = z.infer<typeof ProblemStatsSchema>
export type Diagnosis = z.infer<typeof DiagnosisSchema>
