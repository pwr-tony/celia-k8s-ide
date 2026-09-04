import { useNavigate } from 'react-router'
import { usePods } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, podColumns } from '@/components/data'
import { podDetailPath } from '@/router/routes'
import type { Pod } from '@/api/schemas'

export function PodListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading, refetch } = usePods(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (pod: Pod) => {
    navigate(podDetailPath(pod.Namespace, pod.Name))
  }

  return (
    <>
      <PageHeader title="Pods" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={podColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search pods..."
          resourceType="pods"
          onRefresh={refetch}
        />
      </main>
    </>
  )
}
