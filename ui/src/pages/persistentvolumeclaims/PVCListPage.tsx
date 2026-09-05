import { useNavigate } from 'react-router'
import { usePersistentVolumeClaims } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, persistentVolumeClaimColumns } from '@/components/data'
import { pvcDetailPath } from '@/router/routes'
import type { PersistentVolumeClaim } from '@/api/schemas'

export function PVCListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading, refetch } = usePersistentVolumeClaims(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (pvc: PersistentVolumeClaim) => {
    navigate(pvcDetailPath(pvc.Namespace, pvc.Name))
  }

  return (
    <>
      <PageHeader title="Persistent Volume Claims" />
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={persistentVolumeClaimColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search PVCs..."
          resourceType="persistent volume claims"
          onRefresh={refetch}
        />
      </main>
    </>
  )
}
