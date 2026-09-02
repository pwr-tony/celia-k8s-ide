import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives'
import { Button } from '@/components/primitives'
import { useDeletePod } from '@/api/hooks/useOperations'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'

interface DeletePodDialogProps {
  open: boolean
  onClose: () => void
  namespace: string
  name: string
  onSuccess?: () => void
}

const gracePeriodOptions = [
  { value: undefined, label: 'Default (30s)' },
  { value: 0, label: 'Immediate (force)' },
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '60 seconds' },
]

export function DeletePodDialog({ open, onClose, namespace, name, onSuccess }: DeletePodDialogProps) {
  const [gracePeriod, setGracePeriod] = useState<number | undefined>(undefined)
  const { mutate: deletePod, isPending, isSuccess, reset } = useDeletePod()

  useEffect(() => {
    if (open) {
      setGracePeriod(undefined)
      reset()
    }
  }, [open, reset])

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.()
      onClose()
    }
  }, [isSuccess, onClose, onSuccess])

  const handleDelete = () => {
    deletePod({ namespace, name, ...(gracePeriod !== undefined && { gracePeriod }) })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            Delete Pod
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The pod will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg border border-error/20 bg-error/5 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-error" />
              </div>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-text-tertiary">{namespace}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Grace Period
            </label>
            <select
              value={gracePeriod === undefined ? 'default' : gracePeriod}
              onChange={(e) => {
                const val = e.target.value
                setGracePeriod(val === 'default' ? undefined : parseInt(val))
              }}
              className="w-full px-3 py-2 rounded-md border border-border-subtle bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isPending}
            >
              {gracePeriodOptions.map((opt) => (
                <option key={opt.label} value={opt.value === undefined ? 'default' : opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {gracePeriod === 0 && (
              <p className="text-warning text-xs mt-1">
                Force delete skips graceful shutdown. Use with caution.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Pod'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
