import { useQuery } from '@tanstack/react-query'
import { get } from '../client'
import {
  PodsResponseSchema,
  DeploymentsResponseSchema,
  ServicesResponseSchema,
  NodesResponseSchema,
  EventsResponseSchema,
  ResourceYAMLSchema,
  type PodsResponse,
  type DeploymentsResponse,
  type ServicesResponse,
  type NodesResponse,
  type EventsResponse,
} from '../schemas'

export const resourceKeys = {
  all: ['resources'] as const,
  pods: (namespace?: string) => [...resourceKeys.all, 'pods', namespace] as const,
  pod: (namespace: string, name: string) => [...resourceKeys.all, 'pod', namespace, name] as const,
  deployments: (namespace?: string) => [...resourceKeys.all, 'deployments', namespace] as const,
  deployment: (namespace: string, name: string) =>
    [...resourceKeys.all, 'deployment', namespace, name] as const,
  services: (namespace?: string) => [...resourceKeys.all, 'services', namespace] as const,
  service: (namespace: string, name: string) =>
    [...resourceKeys.all, 'service', namespace, name] as const,
  nodes: () => [...resourceKeys.all, 'nodes'] as const,
  node: (name: string) => [...resourceKeys.all, 'node', name] as const,
  events: (namespace?: string) => [...resourceKeys.all, 'events', namespace] as const,
  yaml: (kind: string, namespace: string, name: string) =>
    [...resourceKeys.all, 'yaml', kind, namespace, name] as const,
}

export function usePods(namespace?: string) {
  const query = namespace ? `?namespace=${namespace}` : ''
  return useQuery({
    queryKey: resourceKeys.pods(namespace),
    queryFn: () => get<PodsResponse>(`/pods${query}`, PodsResponseSchema),
    refetchInterval: 10000,
  })
}

export function useDeployments(namespace?: string) {
  const query = namespace ? `?namespace=${namespace}` : ''
  return useQuery({
    queryKey: resourceKeys.deployments(namespace),
    queryFn: () => get<DeploymentsResponse>(`/deployments${query}`, DeploymentsResponseSchema),
    refetchInterval: 15000,
  })
}

export function useServices(namespace?: string) {
  const query = namespace ? `?namespace=${namespace}` : ''
  return useQuery({
    queryKey: resourceKeys.services(namespace),
    queryFn: () => get<ServicesResponse>(`/services${query}`, ServicesResponseSchema),
    refetchInterval: 30000,
  })
}

export function useNodes() {
  return useQuery({
    queryKey: resourceKeys.nodes(),
    queryFn: () => get<NodesResponse>('/nodes', NodesResponseSchema),
    refetchInterval: 30000,
  })
}

export function useEvents(namespace?: string) {
  const query = namespace ? `?namespace=${namespace}` : ''
  return useQuery({
    queryKey: resourceKeys.events(namespace),
    queryFn: () => get<EventsResponse>(`/events${query}`, EventsResponseSchema),
    refetchInterval: 5000,
  })
}

export function useResourceYAML(kind: string, namespace: string, name: string) {
  return useQuery({
    queryKey: resourceKeys.yaml(kind, namespace, name),
    queryFn: () =>
      get<{ yaml: string }>(`/resources/${kind}/${namespace}/${name}/yaml`, ResourceYAMLSchema),
    enabled: Boolean(kind && namespace && name),
  })
}
