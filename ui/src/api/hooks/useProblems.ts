import { useQuery } from '@tanstack/react-query'
import { get } from '../client'
import {
  ProblemsResponseSchema,
  ProblemStatsSchema,
  DiagnosisSchema,
  type ProblemsResponse,
  type ProblemStats,
  type Diagnosis,
} from '../schemas'

export const problemKeys = {
  all: ['problems'] as const,
  list: (namespace?: string) => [...problemKeys.all, 'list', namespace] as const,
  stats: () => [...problemKeys.all, 'stats'] as const,
  diagnosis: (kind: string, namespace: string, name: string) =>
    [...problemKeys.all, 'diagnosis', kind, namespace, name] as const,
}

export function useProblems(namespace?: string) {
  const query = namespace ? `?namespace=${namespace}` : ''
  return useQuery({
    queryKey: problemKeys.list(namespace),
    queryFn: () => get<ProblemsResponse>(`/problems${query}`, ProblemsResponseSchema),
    refetchInterval: 10000,
  })
}

export function useProblemStats() {
  return useQuery({
    queryKey: problemKeys.stats(),
    queryFn: () => get<ProblemStats>('/problems/stats', ProblemStatsSchema),
    refetchInterval: 10000,
  })
}

export function useDiagnosis(kind: string, namespace: string, name: string) {
  return useQuery({
    queryKey: problemKeys.diagnosis(kind, namespace, name),
    queryFn: () => get<Diagnosis>(`/diagnosis/${kind}/${namespace}/${name}`, DiagnosisSchema),
    enabled: Boolean(kind && namespace && name),
  })
}
