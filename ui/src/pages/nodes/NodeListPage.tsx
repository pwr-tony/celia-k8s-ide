import { useNavigate } from 'react-router'
import { useNodes } from '@/api/hooks'
import { ResourceTable, PageHeader, nodeColumns } from '@/components/data'
import { nodeDetailPath } from '@/router/routes'
import type { Node } from '@/api/schemas'

export function NodeListPage() {
  const { data, isLoading } = useNodes()
  const navigate = useNavigate()

  const handleRowClick = (node: Node) => {
    navigate(nodeDetailPath(node.name))
  }

  return (
    <>
      <PageHeader title="Nodes" />
      <main className="flex-1 overflow-hidden p-6">
        <ResourceTable
          data={data?.nodes ?? []}
          columns={nodeColumns}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          searchPlaceholder="Search nodes..."
          emptyMessage="No nodes found"
        />
      </main>
    </>
  )
}
