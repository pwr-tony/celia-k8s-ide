import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '../client'
import {
  ContextsResponseSchema,
  ConnectionSchema,
  ConnectResponseSchema,
  NamespacesResponseSchema,
  ClusterHealthSchema,
  type ContextsResponse,
  type Connection,
  type ConnectResponse,
  type NamespacesResponse,
  type ClusterHealth,
} from '../schemas'

export const clusterKeys = {
  all: ['cluster'] as const,
  contexts: () => [...clusterKeys.all, 'contexts'] as const,
  connection: () => [...clusterKeys.all, 'connection'] as const,
  namespaces: () => [...clusterKeys.all, 'namespaces'] as const,
  health: () => [...clusterKeys.all, 'health'] as const,
}

export function useContexts() {
  return useQuery({
    queryKey: clusterKeys.contexts(),
    queryFn: () => get<ContextsResponse>('/contexts', ContextsResponseSchema),
  })
}

export function useConnection() {
  return useQuery({
    queryKey: clusterKeys.connection(),
    queryFn: () => get<Connection>('/clusters/connection', ConnectionSchema),
    refetchInterval: 30000,
  })
}

export function useNamespaces() {
  return useQuery({
    queryKey: clusterKeys.namespaces(),
    queryFn: () => get<NamespacesResponse>('/clusters/namespaces', NamespacesResponseSchema),
  })
}

export function useClusterHealth() {
  return useQuery({
    queryKey: clusterKeys.health(),
    queryFn: () => get<ClusterHealth>('/clusters/health', ClusterHealthSchema),
    refetchInterval: 15000,
  })
}

export function useConnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contextName: string) =>
      post<ConnectResponse>('/clusters/connect', { context_name: contextName }, ConnectResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clusterKeys.all })
    },
  })
}

export function useDisconnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => post<ConnectResponse>('/clusters/disconnect', {}, ConnectResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clusterKeys.all })
    },
  })
}
