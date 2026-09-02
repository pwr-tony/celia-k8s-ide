import { useEffect } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { useRolloutRestart } from '@/api/hooks/useOperations'
import { RefreshCw } from 'lucide-react'

interface RestartDialogProps {
  open: boolean
  onClose: () => void
  kind: string
  namespace: string
  name: string
}

export function RestartDialog({ open, onClose, kind, namespace, name }: RestartDialogProps) {
  const { mutate: restart, isPending, isSuccess, reset } = useRolloutRestart()

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  useEffect(() => {
    if (isSuccess) {
      onClose()
    }
  }, [isSuccess, onClose])

  const handleRestart = () => {
    restart({ kind, namespace, name })
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleRestart}
      title="Rollout Restart"
      description={`This will trigger a rolling restart of all pods in this ${kind.toLowerCase()}.`}
      confirmLabel="Restart"
      isLoading={isPending}
    >
      <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-text-tertiary">{namespace}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-text-secondary mt-4">
        Pods will be restarted one by one according to the deployment strategy.
        This operation may cause brief interruptions.
      </p>
    </ConfirmDialog>
  )
}
