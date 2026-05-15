import { useParams } from 'react-router'
import { usePod } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab, ResourceEventsTab } from '@/components/domain/ResourceDetail'
import { PodOverview, PodContainersTab, PodLogsTab } from '@/components/domain/pods'
import { getPodStatus } from '@/components/data'
import { ROUTES } from '@/router/routes'
import { Loader2 } from 'lucide-react'

export function PodDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: pod, isLoading } = usePod(namespace!, name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
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
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Pod" namespace={namespace!} name={name!} /> },
    { id: 'events', label: 'Events', content: <ResourceEventsTab namespace={namespace!} resourceName={name!} resourceKind="Pod" /> },
    { id: 'logs', label: 'Logs', content: <PodLogsTab namespace={namespace!} podName={name!} containers={pod.Containers} /> },
  ]

  return (
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
    />
  )
}
