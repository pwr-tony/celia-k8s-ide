import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives'
import { Button } from '@/components/primitives'
import { usePurgePods } from '@/api/hooks/useOperations'
import { useNamespaces } from '@/api/hooks/useCluster'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'

interface PurgePodsDialogProps {
  open: boolean
  onClose: () => void
  defaultNamespace?: string
}

const podStates = [
  { value: 'Failed', label: 'Failed', description: 'Pods that have terminated with an error' },
  { value: 'Succeeded', label: 'Succeeded', description: 'Completed pods (e.g., Jobs)' },
  { value: 'Evicted', label: 'Evicted', description: 'Pods evicted by the scheduler' },
]

export function PurgePodsDialog({ open, onClose, defaultNamespace }: PurgePodsDialogProps) {
  const [namespace, setNamespace] = useState<string>(defaultNamespace || '')
  const [selectedStates, setSelectedStates] = useState<string[]>(['Failed'])
  const { data: namespacesData } = useNamespaces()
  const { mutate: purge, isPending, isSuccess, data: result, reset } = usePurgePods()

  useEffect(() => {
    if (open) {
      setNamespace(defaultNamespace || '')
      setSelectedStates(['Failed'])
      reset()
    }
  }, [open, defaultNamespace, reset])

  const handlePurge = () => {
    purge({
      ...(namespace && { namespace }),
      ...(selectedStates.length > 0 && { states: selectedStates }),
    })
  }

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    )
  }

  if (isSuccess && result) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              Purge Complete
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-center">
              <p className="text-3xl font-bold text-success">{result.total_deleted}</p>
              <p className="text-sm text-text-secondary mt-1">pods deleted</p>
            </div>

            {result.deleted_pods && result.deleted_pods.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium text-text-secondary mb-2">Deleted pods:</p>
                <div className="space-y-1">
                  {result.deleted_pods.slice(0, 20).map((pod) => (
                    <p key={`${pod.namespace}/${pod.name}`} className="text-xs text-text-tertiary font-mono">
                      {pod.namespace}/{pod.name}
                    </p>
                  ))}
                  {result.deleted_pods.length > 20 && (
                    <p className="text-xs text-text-tertiary">
                      ...and {result.deleted_pods.length - 20} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {result.total_failed > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-error mb-2">
                  {result.total_failed} pod(s) failed to delete
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            Purge Pods
          </DialogTitle>
          <DialogDescription>
            Delete multiple pods matching the selected criteria.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Namespace
            </label>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border-subtle bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isPending}
            >
              <option value="">All namespaces</option>
              {namespacesData?.namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Pod States to Delete
            </label>
            <div className="space-y-2">
              {podStates.map((state) => (
                <label
                  key={state.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:bg-bg-tertiary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state.value)}
                    onChange={() => toggleState(state.value)}
                    className="mt-0.5"
                    disabled={isPending}
                  />
                  <div>
                    <p className="font-medium text-sm">{state.label}</p>
                    <p className="text-xs text-text-tertiary">{state.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedStates.length === 0 && (
            <p className="text-warning text-sm">Select at least one pod state</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handlePurge}
            disabled={isPending || selectedStates.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Purging...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Purge Pods
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
