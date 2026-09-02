import { z } from 'zod'

export const OperationResultSchema = z.object({
  action_id: z.string(),
  success: z.boolean(),
  message: z.string(),
})

export const PurgedPodSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  reason: z.string(),
  error: z.string().optional(),
})

export const PurgeResultSchema = z.object({
  action_id: z.string(),
  namespace: z.string(),
  states: z.array(z.string()),
  deleted_pods: z.array(PurgedPodSchema),
  failed_pods: z.array(PurgedPodSchema),
  total_deleted: z.number(),
  total_failed: z.number(),
})

export const ActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  resource_kind: z.string(),
  namespace: z.string(),
  resource_name: z.string(),
  status: z.string(),
  message: z.string(),
  error: z.string().optional(),
  parameters: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  started_at: z.string(),
  completed_at: z.string(),
  undone_by: z.string().optional(),
  can_undo: z.boolean(),
})

export const UndoResultSchema = z.object({
  action_id: z.string(),
  success: z.boolean(),
  message: z.string(),
  undo_action_id: z.string(),
})

export const ActionHistoryResponseSchema = z.object({
  count: z.number(),
  actions: z.array(ActionSchema),
})

export type OperationResult = z.infer<typeof OperationResultSchema>
export type PurgeResult = z.infer<typeof PurgeResultSchema>
export type Action = z.infer<typeof ActionSchema>
export type ActionHistoryResponse = z.infer<typeof ActionHistoryResponseSchema>
export type UndoResult = z.infer<typeof UndoResultSchema>
