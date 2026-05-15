import { z } from 'zod'

export const ContextSchema = z.object({
  Name: z.string(),
  Cluster: z.string(),
  User: z.string(),
  Namespace: z.string(),
  IsCurrent: z.boolean(),
  IsConnected: z.boolean(),
})

export const ContextsResponseSchema = z.array(ContextSchema)

export const ConnectionSchema = z.object({
  ContextName: z.string(),
  State: z.string(),
  ConnectedAt: z.string(),
  Namespace: z.string(),
  ServerURL: z.string(),
  Error: z.string(),
})

export const ConnectResponseSchema = z.object({
  context: z.string(),
  status: z.string(),
})

export const NamespacesResponseSchema = z.object({
  namespaces: z.array(z.string()),
})

export const ClusterHealthSchema = z.object({
  status: z.string(),
  nodes: z.object({
    total: z.number(),
    ready: z.number(),
    not_ready: z.number(),
  }),
  pods: z.object({
    total: z.number(),
    running: z.number(),
    pending: z.number(),
    failed: z.number(),
    succeeded: z.number(),
  }),
  components: z.array(
    z.object({
      name: z.string(),
      healthy: z.boolean(),
      message: z.string(),
    })
  ),
})

export type Context = z.infer<typeof ContextSchema>
export type ContextsResponse = z.infer<typeof ContextsResponseSchema>
export type Connection = z.infer<typeof ConnectionSchema>
export type ConnectResponse = z.infer<typeof ConnectResponseSchema>
export type NamespacesResponse = z.infer<typeof NamespacesResponseSchema>
export type ClusterHealth = z.infer<typeof ClusterHealthSchema>
