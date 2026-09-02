export const ROUTES = {
  DASHBOARD: '/',
  PODS: '/pods',
  POD_DETAIL: '/pods/:namespace/:name',
  DEPLOYMENTS: '/deployments',
  DEPLOYMENT_DETAIL: '/deployments/:namespace/:name',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:namespace/:name',
  CONFIGMAPS: '/configmaps',
  CONFIGMAP_DETAIL: '/configmaps/:namespace/:name',
  SECRETS: '/secrets',
  SECRET_DETAIL: '/secrets/:namespace/:name',
  NODES: '/nodes',
  NODE_DETAIL: '/nodes/:name',
  AUDIT_LOG: '/audit',
} as const

export function podDetailPath(namespace: string, name: string): string {
  return `/pods/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function deploymentDetailPath(namespace: string, name: string): string {
  return `/deployments/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function serviceDetailPath(namespace: string, name: string): string {
  return `/services/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function configMapDetailPath(namespace: string, name: string): string {
  return `/configmaps/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function secretDetailPath(namespace: string, name: string): string {
  return `/secrets/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function nodeDetailPath(name: string): string {
  return `/nodes/${encodeURIComponent(name)}`
}

export type ResourceType =
  | 'pods'
  | 'deployments'
  | 'services'
  | 'configmaps'
  | 'secrets'
  | 'nodes'
  | 'statefulsets'
  | 'daemonsets'
  | 'jobs'
  | 'cronjobs'
  | 'ingresses'
  | 'endpoints'
  | 'pvcs'
  | 'pvs'
  | 'namespaces'
  | 'events'
  | 'logs'
  | 'problems'
  | 'diagnosis'

export const RESOURCE_TO_ROUTE: Record<string, string> = {
  pods: ROUTES.PODS,
  deployments: ROUTES.DEPLOYMENTS,
  services: ROUTES.SERVICES,
  configmaps: ROUTES.CONFIGMAPS,
  secrets: ROUTES.SECRETS,
  nodes: ROUTES.NODES,
  audit: ROUTES.AUDIT_LOG,
}
