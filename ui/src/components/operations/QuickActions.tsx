import { useState } from 'react'
import { Button } from '@/components/primitives'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/primitives'
import { ScaleDialog } from './ScaleDialog'
import { RestartDialog } from './RestartDialog'
import { PurgePodsDialog } from './PurgePodsDialog'
import { useDeployments } from '@/api/hooks/useResources'
import { ArrowUpDown, RefreshCw, Trash2, Loader2, Search } from 'lucide-react'
import type { Deployment } from '@/api/schemas'

type ActionType = 'scale' | 'restart' | 'purge' | null

export function QuickActions() {
  const [action, setAction] = useState<ActionType>(null)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: deploymentsData, isLoading } = useDeployments()

  const filteredDeployments = deploymentsData?.items.filter((d) =>
    d.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Namespace.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

  const handleSelectDeployment = (deployment: Deployment) => {
    setSelectedDeployment(deployment)
  }

  const handleCloseAction = () => {
    setAction(null)
    setSelectedDeployment(null)
    setSearchTerm('')
  }

  const needsDeploymentPicker = (action === 'scale' || action === 'restart') && !selectedDeployment

  return (
    <>
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4 space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => setAction('scale')}
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Scale Deployment
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => setAction('restart')}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rollout Restart
        </Button>
        <Button
          variant="danger"
          className="w-full justify-start"
          onClick={() => setAction('purge')}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Purge Failed Pods
        </Button>
      </div>

      <Dialog open={needsDeploymentPicker} onOpenChange={(open) => !open && handleCloseAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'scale' ? 'Select Deployment to Scale' : 'Select Deployment to Restart'}
            </DialogTitle>
            <DialogDescription>
              Choose a deployment from the list below
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search deployments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-border-subtle bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
                </div>
              ) : filteredDeployments.length === 0 ? (
                <p className="text-center text-text-tertiary py-8">No deployments found</p>
              ) : (
                filteredDeployments.slice(0, 50).map((deployment) => (
                  <button
                    key={`${deployment.Namespace}/${deployment.Name}`}
                    onClick={() => handleSelectDeployment(deployment)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-tertiary transition-colors"
                  >
                    <p className="font-medium text-sm">{deployment.Name}</p>
                    <p className="text-xs text-text-tertiary">
                      {deployment.Namespace} • {deployment.ReadyReplicas}/{deployment.Replicas} ready
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedDeployment && action === 'scale' && (
        <ScaleDialog
          open={true}
          onClose={handleCloseAction}
          namespace={selectedDeployment.Namespace}
          name={selectedDeployment.Name}
          currentReplicas={selectedDeployment.Replicas}
        />
      )}

      {selectedDeployment && action === 'restart' && (
        <RestartDialog
          open={true}
          onClose={handleCloseAction}
          kind="Deployment"
          namespace={selectedDeployment.Namespace}
          name={selectedDeployment.Name}
        />
      )}

      <PurgePodsDialog
        open={action === 'purge'}
        onClose={handleCloseAction}
      />
    </>
  )
}
