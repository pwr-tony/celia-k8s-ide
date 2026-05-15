import { useNavigate } from 'react-router'
import { useDeployments } from '@/api/hooks'
import { useUIStore } from '@/stores/ui'
import { ResourceTable, PageHeader, deploymentColumns } from '@/components/data'
import { deploymentDetailPath } from '@/router/routes'
import type { Deployment } from '@/api/schemas'

export function DeploymentListPage() {
  const namespace = useUIStore((s) => s.selectedNamespace)
  const { data, isLoading } = useDeployments(namespace ?? undefined)
  const navigate = useNavigate()

  const handleRowClick = (deployment: Deployment) => {
    navigate(deploymentDetailPath(deployment.Namespace, deployment.Name))
  }

  return (
    <>
      <PageHeader title="Deployments" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.items ?? []}
          columns={deploymentColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search deployments..."
          emptyMessage="No deployments found"
        />
      </main>
    </>
  )
}
