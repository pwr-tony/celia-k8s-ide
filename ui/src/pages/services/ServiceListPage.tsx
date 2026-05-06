import { useNavigate } from 'react-router'
import { useServices } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, serviceColumns } from '@/components/data'
import { serviceDetailPath } from '@/router/routes'
import type { Service } from '@/api/schemas'

export function ServiceListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading } = useServices(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (service: Service) => {
    navigate(serviceDetailPath(service.namespace, service.name))
  }

  return (
    <>
      <PageHeader title="Services" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.services ?? []}
          columns={serviceColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search services..."
          emptyMessage="No services found"
        />
      </main>
    </>
  )
}
