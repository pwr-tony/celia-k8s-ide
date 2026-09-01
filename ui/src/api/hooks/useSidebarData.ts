import { useMemo } from 'react'
import { usePods, useDeployments, useServices, useNodes, useConfigMaps, useSecrets } from './useResources'
import { useProblems } from './useProblems'
import { useNamespaces, useClusterHealth } from './useCluster'
import { useUIStore } from '@/stores/ui'

interface SidebarCounts {
  pods: number
  deployments: number
  statefulsets: number
  daemonsets: number
  jobs: number
  cronjobs: number
  services: number
  ingresses: number
  endpoints: number
  configmaps: number
  secrets: number
  pvcs: number
  pvs: number
  nodes: number
  namespaces: number
}

interface SidebarProblems {
  pods: number
  deployments: number
  nodes: number
  total: number
}

const defaultProblems: SidebarProblems = {
  pods: 0,
  deployments: 0,
  nodes: 0,
  total: 0,
}

export function useSidebarData() {
  const selectedNamespace = useUIStore((s) => s.selectedNamespace)

  const { data: podsData } = usePods(selectedNamespace ?? undefined)
  const { data: deploymentsData } = useDeployments(selectedNamespace ?? undefined)
  const { data: servicesData } = useServices(selectedNamespace ?? undefined)
  const { data: configmapsData } = useConfigMaps(selectedNamespace ?? undefined)
  const { data: secretsData } = useSecrets(selectedNamespace ?? undefined)
  const { data: nodesData } = useNodes()
  const { data: namespacesData } = useNamespaces()
  const { data: healthData } = useClusterHealth()
  const { data: problemsData } = useProblems(selectedNamespace ?? undefined)

  const counts = useMemo<SidebarCounts>(() => {
    return {
      pods: podsData?.items.length ?? 0,
      deployments: deploymentsData?.items.length ?? 0,
      statefulsets: 0,
      daemonsets: 0,
      jobs: 0,
      cronjobs: 0,
      services: servicesData?.items.length ?? 0,
      ingresses: 0,
      endpoints: 0,
      configmaps: configmapsData?.items.length ?? 0,
      secrets: secretsData?.items.length ?? 0,
      pvcs: 0,
      pvs: 0,
      nodes: nodesData?.items.length ?? healthData?.nodes.total ?? 0,
      namespaces: namespacesData?.namespaces.length ?? 0,
    }
  }, [podsData, deploymentsData, servicesData, configmapsData, secretsData, nodesData, namespacesData, healthData])

  const problems = useMemo<SidebarProblems>(() => {
    if (!problemsData?.problems) return defaultProblems

    const podProblems = problemsData.problems.filter(
      (p) => p.resource_kind === 'Pod'
    ).length

    const deploymentProblems = problemsData.problems.filter(
      (p) => p.resource_kind === 'Deployment'
    ).length

    const nodeProblems = problemsData.problems.filter(
      (p) => p.resource_kind === 'Node'
    ).length

    return {
      pods: podProblems,
      deployments: deploymentProblems,
      nodes: nodeProblems,
      total: problemsData.problems.length,
    }
  }, [problemsData])

  return {
    counts,
    problems,
    isLoading: false,
  }
}
