import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/primitives'
import { AlertTriangle } from 'lucide-react'

interface YAMLConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  resourceKind: string
  resourceName: string
  isLoading?: boolean
}

export function YAMLConfirmDialog({
  open,
  onConfirm,
  onCancel,
  resourceKind,
  resourceName,
  isLoading,
}: YAMLConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Apply Changes?
          </DialogTitle>
          <DialogDescription>
            You are about to apply changes to{' '}
            <span className="font-medium text-text-primary">
              {resourceKind}/{resourceName}
            </span>
            . This will update the resource in your cluster.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Applying...' : 'Apply Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
