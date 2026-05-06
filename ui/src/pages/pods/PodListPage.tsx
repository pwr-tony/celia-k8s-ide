import { useNavigate } from 'react-router'
import { usePods } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, podColumns } from '@/components/data'
import { podDetailPath } from '@/router/routes'
import type { Pod } from '@/api/schemas'

export function PodListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading } = usePods(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (pod: Pod) => {
    navigate(podDetailPath(pod.namespace, pod.name))
  }

  return (
    <>
      <PageHeader title="Pods" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.pods ?? []}
          columns={podColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search pods..."
          emptyMessage="No pods found"
        />
      </main>
    </>
  )
}
