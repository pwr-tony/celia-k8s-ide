import { useNavigate } from 'react-router'
import { useSecrets } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, secretColumns } from '@/components/data'
import { secretDetailPath } from '@/router/routes'
import type { Secret } from '@/api/schemas'

export function SecretListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading, refetch } = useSecrets(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (secret: Secret) => {
    navigate(secretDetailPath(secret.Namespace, secret.Name))
  }

  return (
    <>
      <PageHeader title="Secrets" />
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={secretColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search secrets..."
          resourceType="secrets"
          onRefresh={refetch}
        />
      </main>
    </>
  )
}
