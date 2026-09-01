import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { get } from '../client'
import { getWebSocket } from '../websocket'
import { useNotificationsStore } from '@/stores/notifications'
import { useProblemHistoryStore } from '@/stores/problem-history'
import { useSettingsStore } from '@/stores/settings'
import {
  ProblemsResponseSchema,
  ProblemStatsSchema,
  DiagnosisSchema,
  type ProblemsResponse,
  type ProblemStats,
  type Diagnosis,
  type Problem,
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

export function useProblemsRealtime() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const trackResolved = useProblemHistoryStore((s) => s.trackResolved)
  const notificationMinSeverity = useSettingsStore((s) => s.notificationMinSeverity)
  const previousProblemsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const ws = getWebSocket()

    if (!ws.isConnected) {
      ws.connect()
    }

    ws.subscribeProblems()

    const unsubscribe = ws.onProblemsUpdate((data) => {
      const payload = data.payload as ProblemsResponse
      const currentIds = new Set(payload.problems.map((p) => p.id))
      const previousIds = previousProblemsRef.current

      payload.problems.forEach((problem: Problem) => {
        if (!previousIds.has(problem.id) && previousIds.size > 0) {
          const severityLabel = problem.severity === 4 ? 'Critical' : problem.severity === 3 ? 'High' : 'Medium'
          const notificationType = problem.severity >= 3 ? 'error' : 'warning'

          if (problem.severity >= notificationMinSeverity) {
            addNotification({
              type: notificationType,
              title: `${severityLabel}: ${problem.title}`,
              message: `${problem.resource_kind} ${problem.namespace}/${problem.resource_name}`,
              problemId: problem.id,
            })
          }
        }
      })

      trackResolved(payload.problems)
      previousProblemsRef.current = currentIds
      queryClient.setQueryData(problemKeys.list(undefined), payload)
    })

    return () => {
      unsubscribe()
      ws.unsubscribeProblems()
    }
  }, [queryClient, addNotification, trackResolved, notificationMinSeverity])
}
