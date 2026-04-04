import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, del } from '../client'
import {
  OperationResultSchema,
  PurgeResultSchema,
  ActionHistoryResponseSchema,
  type OperationResult,
  type PurgeResult,
  type ActionHistoryResponse,
} from '../schemas'
import { resourceKeys } from './useResources'

export const operationKeys = {
  all: ['operations'] as const,
  history: () => [...operationKeys.all, 'history'] as const,
}

export function useActionHistory(limit = 50) {
  return useQuery({
    queryKey: operationKeys.history(),
    queryFn: () =>
      get<ActionHistoryResponse>(`/operations/history?limit=${limit}`, ActionHistoryResponseSchema),
  })
}

export function useScaleDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      namespace,
      name,
      replicas,
    }: {
      namespace: string
      name: string
      replicas: number
    }) =>
      post<OperationResult>(
        `/operations/scale/${namespace}/${name}`,
        { replicas },
        OperationResultSchema
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.deployments() })
      queryClient.invalidateQueries({ queryKey: operationKeys.history() })
    },
  })
}

export function useRolloutRestart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ kind, namespace, name }: { kind: string; namespace: string; name: string }) =>
      post<OperationResult>(
        `/operations/restart/${kind}/${namespace}/${name}`,
        {},
        OperationResultSchema
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.deployments() })
      queryClient.invalidateQueries({ queryKey: resourceKeys.pods() })
      queryClient.invalidateQueries({ queryKey: operationKeys.history() })
    },
  })
}

export function useDeletePod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      namespace,
      name,
      gracePeriod,
    }: {
      namespace: string
      name: string
      gracePeriod?: number
    }) => {
      const query = gracePeriod !== undefined ? `?grace_period=${gracePeriod}` : ''
      return del<OperationResult>(
        `/operations/pods/${namespace}/${name}${query}`,
        OperationResultSchema
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.pods() })
      queryClient.invalidateQueries({ queryKey: operationKeys.history() })
    },
  })
}

export function usePurgePods() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ namespace, states }: { namespace?: string; states?: string[] }) =>
      post<PurgeResult>('/operations/purge', { namespace, states }, PurgeResultSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.pods() })
      queryClient.invalidateQueries({ queryKey: operationKeys.history() })
    },
  })
}
