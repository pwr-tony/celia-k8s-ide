import { z } from 'zod'

const ContainerStateSchema = z.object({
  Type: z.string(),
  Reason: z.string(),
  Message: z.string(),
  StartedAt: z.string().nullable(),
  FinishedAt: z.string().nullable(),
  ExitCode: z.number(),
})

const ContainerStatusSchema = z.object({
  Name: z.string(),
  Image: z.string(),
  Ready: z.boolean(),
  Started: z.boolean(),
  RestartCount: z.number(),
  State: ContainerStateSchema,
  LastState: ContainerStateSchema.optional(),
  Resources: z.object({
    CPURequest: z.string(),
    CPULimit: z.string(),
    MemoryRequest: z.string(),
    MemoryLimit: z.string(),
  }).optional(),
})

const ConditionSchema = z.object({
  Type: z.string(),
  Status: z.string(),
  Reason: z.string(),
  Message: z.string(),
  LastTransitionTime: z.string().optional(),
})

export const PodSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Phase: z.string(),
  Status: z.string(),
  Ready: z.boolean(),
  Message: z.string(),
  NodeName: z.string(),
  PodIP: z.string(),
  HostIP: z.string(),
  RestartCount: z.number(),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Annotations: z.record(z.string(), z.string()).optional(),
  Containers: z.array(ContainerStatusSchema),
  InitContainers: z.array(ContainerStatusSchema).nullable(),
  Conditions: z.array(ConditionSchema),
  OwnerKind: z.string(),
  OwnerName: z.string(),
  OwnerUID: z.string().optional(),
  QOSClass: z.string().optional(),
  RestartPolicy: z.string().optional(),
  StartTime: z.string().optional(),
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
  YAML: z.string().optional(),
})

export const PodsResponseSchema = z.object({
  items: z.array(PodSchema),
  count: z.number(),
})

export const DeploymentConditionSchema = z.object({
  Type: z.string(),
  Status: z.string(),
  Reason: z.string(),
  Message: z.string(),
  LastTransitionTime: z.string().optional(),
  LastUpdateTime: z.string().optional(),
})

export const DeploymentSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Replicas: z.number(),
  ReadyReplicas: z.number(),
  AvailableReplicas: z.number(),
  UnavailableReplicas: z.number(),
  UpdatedReplicas: z.number(),
  Strategy: z.string(),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Selector: z.record(z.string(), z.string()).optional(),
  Conditions: z.array(DeploymentConditionSchema),
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
})

export const DeploymentsResponseSchema = z.object({
  items: z.array(DeploymentSchema),
  count: z.number(),
})

const ServicePortSchema = z.object({
  Name: z.string(),
  Port: z.number(),
  TargetPort: z.union([z.string(), z.number()]),
  Protocol: z.string(),
  NodePort: z.number(),
})

export const ServiceSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Type: z.string(),
  ClusterIP: z.string(),
  ExternalIPs: z.array(z.string()).nullable(),
  Ports: z.array(ServicePortSchema),
  Selector: z.record(z.string(), z.string()).nullable(),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
})

export const ServicesResponseSchema = z.object({
  items: z.array(ServiceSchema),
  count: z.number(),
})

export const NodeConditionSchema = z.object({
  Type: z.string(),
  Status: z.string(),
  Reason: z.string(),
  Message: z.string(),
  LastHeartbeatTime: z.string().optional(),
  LastTransitionTime: z.string().optional(),
})

const NodeCapacitySchema = z.object({
  CPU: z.string(),
  Memory: z.string(),
  Pods: z.string(),
  EphemeralStorage: z.string().optional(),
})

const TaintSchema = z.object({
  Key: z.string(),
  Value: z.string(),
  Effect: z.string(),
})

export const NodeSchema = z.object({
  Name: z.string(),
  Status: z.string(),
  Roles: z.array(z.string()),
  Version: z.string(),
  OS: z.string(),
  Architecture: z.string(),
  ContainerRuntime: z.string(),
  KernelVersion: z.string(),
  KubeletVersion: z.string(),
  InternalIP: z.string(),
  ExternalIP: z.string(),
  PodCIDR: z.string(),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Taints: z.array(TaintSchema).nullable(),
  Conditions: z.array(NodeConditionSchema),
  Capacity: NodeCapacitySchema,
  Allocatable: NodeCapacitySchema,
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
})

export const NodesResponseSchema = z.object({
  items: z.array(NodeSchema),
  count: z.number(),
})

export const EventSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Type: z.string(),
  Reason: z.string(),
  Message: z.string(),
  Source: z.string(),
  FirstTimestamp: z.string(),
  LastTimestamp: z.string(),
  Count: z.number(),
  InvolvedObject: z.object({
    Kind: z.string(),
    Name: z.string(),
    Namespace: z.string(),
  }),
})

export const EventsResponseSchema = z.object({
  items: z.array(EventSchema),
  count: z.number(),
})

export const ResourceYAMLSchema = z.object({
  yaml: z.string(),
})

export const UpdateResourceResponseSchema = z.object({
  message: z.string(),
})

export type UpdateResourceResponse = z.infer<typeof UpdateResourceResponseSchema>

export const ConfigMapSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Data: z.record(z.string(), z.string()),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
})

export const ConfigMapsResponseSchema = z.object({
  items: z.array(ConfigMapSchema),
  count: z.number(),
})

export const SecretSchema = z.object({
  Name: z.string(),
  Namespace: z.string(),
  Type: z.string(),
  DataKeys: z.array(z.string()),
  CreatedAt: z.string(),
  Labels: z.record(z.string(), z.string()),
  Kind: z.string().optional(),
  APIVersion: z.string().optional(),
  UID: z.string().optional(),
})

export const SecretsResponseSchema = z.object({
  items: z.array(SecretSchema),
  count: z.number(),
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
