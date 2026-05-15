import { useNavigate } from 'react-router'
import { useConfigMaps } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, configMapColumns } from '@/components/data'
import { configMapDetailPath } from '@/router/routes'
import type { ConfigMap } from '@/api/schemas'

export function ConfigMapListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading } = useConfigMaps(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (configMap: ConfigMap) => {
    navigate(configMapDetailPath(configMap.Namespace, configMap.Name))
  }

  return (
    <>
      <PageHeader title="ConfigMaps" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={configMapColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search configmaps..."
          emptyMessage="No configmaps found"
        />
      </main>
    </>
  )
}
