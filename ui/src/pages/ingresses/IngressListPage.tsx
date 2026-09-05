import { useNavigate } from 'react-router'
import { useIngresses } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, ingressColumns } from '@/components/data'
import { ingressDetailPath } from '@/router/routes'
import type { Ingress } from '@/api/schemas'

export function IngressListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading, refetch } = useIngresses(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (ingress: Ingress) => {
    navigate(ingressDetailPath(ingress.Namespace, ingress.Name))
  }

  return (
    <>
      <PageHeader title="Ingresses" />
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={ingressColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search ingresses..."
          resourceType="ingresses"
          onRefresh={refetch}
        />
      </main>
    </>
  )
}
