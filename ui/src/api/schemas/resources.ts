import { z } from 'zod'

const ContainerStatusSchema = z.object({
  name: z.string(),
  ready: z.boolean(),
  started: z.boolean(),
  restart_count: z.number(),
  state: z.string(),
  state_reason: z.string(),
  image: z.string(),
})

export const PodSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  phase: z.string(),
  status: z.string(),
  reason: z.string(),
  node_name: z.string(),
  ip: z.string(),
  restart_count: z.number(),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
  containers: z.array(ContainerStatusSchema),
  conditions: z.array(
    z.object({
      type: z.string(),
      status: z.string(),
      reason: z.string(),
      message: z.string(),
    })
  ),
  owner_kind: z.string(),
  owner_name: z.string(),
})

export const PodsResponseSchema = z.object({
  pods: z.array(PodSchema),
  total: z.number(),
})

export const DeploymentSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  replicas: z.number(),
  ready_replicas: z.number(),
  available_replicas: z.number(),
  unavailable_replicas: z.number(),
  updated_replicas: z.number(),
  strategy: z.string(),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
  selector: z.record(z.string(), z.string()),
  conditions: z.array(
    z.object({
      type: z.string(),
      status: z.string(),
      reason: z.string(),
      message: z.string(),
      last_transition: z.string(),
    })
  ),
})

export const DeploymentsResponseSchema = z.object({
  deployments: z.array(DeploymentSchema),
  total: z.number(),
})

export const ServiceSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  type: z.string(),
  cluster_ip: z.string(),
  external_ips: z.array(z.string()),
  ports: z.array(
    z.object({
      name: z.string(),
      port: z.number(),
      target_port: z.string(),
      protocol: z.string(),
      node_port: z.number(),
    })
  ),
  selector: z.record(z.string(), z.string()),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
})

export const ServicesResponseSchema = z.object({
  services: z.array(ServiceSchema),
  total: z.number(),
})

export const NodeConditionSchema = z.object({
  type: z.string(),
  status: z.string(),
  reason: z.string(),
  message: z.string(),
  last_heartbeat: z.string(),
  last_transition: z.string(),
})

export const NodeSchema = z.object({
  name: z.string(),
  status: z.string(),
  roles: z.array(z.string()),
  version: z.string(),
  os: z.string(),
  architecture: z.string(),
  container_runtime: z.string(),
  kernel_version: z.string(),
  kubelet_version: z.string(),
  internal_ip: z.string(),
  external_ip: z.string(),
  pod_cidr: z.string(),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
  taints: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      effect: z.string(),
    })
  ),
  conditions: z.array(NodeConditionSchema),
  capacity: z.object({
    cpu: z.string(),
    memory: z.string(),
    pods: z.string(),
  }),
  allocatable: z.object({
    cpu: z.string(),
    memory: z.string(),
    pods: z.string(),
  }),
})

export const NodesResponseSchema = z.object({
  nodes: z.array(NodeSchema),
  total: z.number(),
})

export const EventSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  type: z.string(),
  reason: z.string(),
  message: z.string(),
  source: z.string(),
  first_timestamp: z.string(),
  last_timestamp: z.string(),
  count: z.number(),
  involved_object: z.object({
    kind: z.string(),
    name: z.string(),
    namespace: z.string(),
  }),
})

export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
  total: z.number(),
})

export const ResourceYAMLSchema = z.object({
  yaml: z.string(),
})

export const ConfigMapSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  data: z.record(z.string(), z.string()),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
})

export const ConfigMapsResponseSchema = z.object({
  configmaps: z.array(ConfigMapSchema),
  total: z.number(),
})

export const SecretSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  type: z.string(),
  data_keys: z.array(z.string()),
  created_at: z.string(),
  labels: z.record(z.string(), z.string()),
})

export const SecretsResponseSchema = z.object({
  secrets: z.array(SecretSchema),
  total: z.number(),
})

export type Pod = z.infer<typeof PodSchema>
export type PodsResponse = z.infer<typeof PodsResponseSchema>
export type Deployment = z.infer<typeof DeploymentSchema>
export type DeploymentsResponse = z.infer<typeof DeploymentsResponseSchema>
export type Service = z.infer<typeof ServiceSchema>
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>
export type Node = z.infer<typeof NodeSchema>
export type NodesResponse = z.infer<typeof NodesResponseSchema>
export type Event = z.infer<typeof EventSchema>
export type EventsResponse = z.infer<typeof EventsResponseSchema>
export type ConfigMap = z.infer<typeof ConfigMapSchema>
export type ConfigMapsResponse = z.infer<typeof ConfigMapsResponseSchema>
export type Secret = z.infer<typeof SecretSchema>
export type SecretsResponse = z.infer<typeof SecretsResponseSchema>
