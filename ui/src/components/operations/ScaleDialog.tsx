import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives'
import { Button } from '@/components/primitives'
import { useScaleDeployment } from '@/api/hooks/useOperations'
import { Loader2, Minus, Plus } from 'lucide-react'

interface ScaleDialogProps {
  open: boolean
  onClose: () => void
  namespace: string
  name: string
  currentReplicas: number
}

export function ScaleDialog({ open, onClose, namespace, name, currentReplicas }: ScaleDialogProps) {
  const [replicas, setReplicas] = useState(currentReplicas)
  const { mutate: scale, isPending, isSuccess, reset } = useScaleDeployment()

  useEffect(() => {
    if (open) {
      setReplicas(currentReplicas)
      reset()
    }
  }, [open, currentReplicas, reset])

  useEffect(() => {
    if (isSuccess) {
      onClose()
    }
  }, [isSuccess, onClose])

  const handleScale = () => {
    scale({ namespace, name, replicas })
  }

  const increment = () => setReplicas((r) => r + 1)
  const decrement = () => setReplicas((r) => Math.max(0, r - 1))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scale Deployment</DialogTitle>
          <DialogDescription>
            Adjust the number of replicas for <span className="font-medium text-text-primary">{name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={decrement}
              disabled={replicas === 0 || isPending}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <input
                type="number"
                min={0}
                value={replicas}
                onChange={(e) => setReplicas(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-center text-3xl font-bold bg-transparent border-b-2 border-border-subtle focus:border-accent focus:outline-none"
                disabled={isPending}
              />
              <p className="text-sm text-text-tertiary mt-2">
                {currentReplicas} → {replicas} replicas
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={increment}
              disabled={isPending}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {replicas === 0 && (
            <p className="text-warning text-sm text-center mt-4">
              Setting replicas to 0 will stop all pods for this deployment
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleScale}
            disabled={isPending || replicas === currentReplicas}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scaling...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
