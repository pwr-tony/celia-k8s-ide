import { useNavigate } from 'react-router'
import { usePersistentVolumes } from '@/api/hooks'
import { ResourceTable, PageHeader, persistentVolumeColumns } from '@/components/data'
import { pvDetailPath } from '@/router/routes'
import type { PersistentVolume } from '@/api/schemas'

export function PVListPage() {
  const { data, isLoading, refetch } = usePersistentVolumes()
  const navigate = useNavigate()

  const handleRowClick = (pv: PersistentVolume) => {
    navigate(pvDetailPath(pv.Name))
  }

  return (
    <>
      <PageHeader title="Persistent Volumes" />
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={persistentVolumeColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search persistent volumes..."
          resourceType="persistent volumes"
          onRefresh={refetch}
        />
      </main>
    </>
  )
}
