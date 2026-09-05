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
  PERSISTENT_VOLUMES: '/persistentvolumes',
  PERSISTENT_VOLUME_DETAIL: '/persistentvolumes/:name',
  PERSISTENT_VOLUME_CLAIMS: '/persistentvolumeclaims',
  PERSISTENT_VOLUME_CLAIM_DETAIL: '/persistentvolumeclaims/:namespace/:name',
  INGRESSES: '/ingresses',
  INGRESS_DETAIL: '/ingresses/:namespace/:name',
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

export function pvDetailPath(name: string): string {
  return `/persistentvolumes/${encodeURIComponent(name)}`
}

export function pvcDetailPath(namespace: string, name: string): string {
  return `/persistentvolumeclaims/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

export function ingressDetailPath(namespace: string, name: string): string {
  return `/ingresses/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
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
  persistentvolumes: ROUTES.PERSISTENT_VOLUMES,
  persistentvolumeclaims: ROUTES.PERSISTENT_VOLUME_CLAIMS,
  ingresses: ROUTES.INGRESSES,
  audit: ROUTES.AUDIT_LOG,
}
