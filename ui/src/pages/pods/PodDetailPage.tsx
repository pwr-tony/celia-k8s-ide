import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePod } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { PodOverview, PodContainersTab, PodLogsTab, PodMetricsTab } from '@/components/domain/pods'
import { DeletePodDialog } from '@/components/operations'
import { Button, Kbd } from '@/components/primitives'
import { getPodStatus, DetailPageSkeleton } from '@/components/data'
import { ROUTES } from '@/router/routes'
import { Trash2 } from 'lucide-react'

export function PodDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: pod, isLoading } = usePod(namespace!, name!)
  const [showDelete, setShowDelete] = useState(false)
  const navigate = useNavigate()

  const openDelete = useCallback(() => setShowDelete(true), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key.toLowerCase() === 'x') {
        e.preventDefault()
        openDelete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openDelete])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!pod) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Pod not found
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <PodOverview pod={pod} /> },
    { id: 'containers', label: 'Containers', content: <PodContainersTab pod={pod} /> },
    { id: 'metrics', label: 'Metrics', content: <PodMetricsTab namespace={namespace!} podName={name!} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Pod" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Pod" /> },
    { id: 'logs', label: 'Logs', content: <PodLogsTab namespace={namespace!} podName={name!} containers={pod.Containers} /> },
  ]

  const actions = (
    <Button variant="danger" size="sm" onClick={openDelete}>
      <Trash2 className="h-4 w-4 mr-1" />
      Delete
      <Kbd className="ml-2">X</Kbd>
    </Button>
  )

  return (
    <>
      <ResourceDetailLayout
        kind="Pod"
        name={pod.Name}
        namespace={pod.Namespace}
        status={pod.Status || pod.Phase}
        statusType={getPodStatus(pod.Phase, pod.Status)}
        breadcrumbs={[
          { label: 'Pods', href: ROUTES.PODS },
          { label: pod.Name },
        ]}
        tabs={tabs}
        actions={actions}
      />

      <DeletePodDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        namespace={namespace!}
        name={name!}
        onSuccess={() => navigate(ROUTES.PODS)}
      />
    </>
  )
}
