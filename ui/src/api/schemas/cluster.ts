import { z } from 'zod'

export const ContextSchema = z.object({
  name: z.string(),
  cluster: z.string(),
  namespace: z.string(),
  is_current: z.boolean(),
})

export const ContextsResponseSchema = z.object({
  contexts: z.array(ContextSchema),
  current: z.string(),
})

export const ConnectionSchema = z.object({
  connected: z.boolean(),
  context: z.string(),
  namespace: z.string(),
  cluster: z.string(),
  server: z.string(),
})

export const NamespacesResponseSchema = z.object({
  namespaces: z.array(z.string()),
  current: z.string(),
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
export type NamespacesResponse = z.infer<typeof NamespacesResponseSchema>
export type ClusterHealth = z.infer<typeof ClusterHealthSchema>
