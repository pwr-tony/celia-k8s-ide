import { useParams } from 'react-router'
import { useConfigMap } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab } from '@/components/domain/ResourceDetail'
import { ROUTES } from '@/router/routes'
import { Loader2, Tag, FileText } from 'lucide-react'
import type { ConfigMap } from '@/api/schemas'

function ConfigMapOverview({ configMap }: { configMap: ConfigMap }) {
  const labelEntries = Object.entries(configMap.labels || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Info</h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Data Keys</span>
              <p className="font-medium">{Object.keys(configMap.data || {}).length}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Created</span>
              <p className="font-medium">{new Date(configMap.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {labelEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Labels
          </h3>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">
              {labelEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-bg-tertiary border border-border-subtle"
                >
                  <span className="text-text-secondary">{key}:</span>
                  <span className="ml-1 text-text-primary">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ConfigMapDataTab({ configMap }: { configMap: ConfigMap }) {
  const dataEntries = Object.entries(configMap.data || {})

  if (dataEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No data keys
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 overflow-auto">
      {dataEntries.map(([key, value]) => (
        <div key={key} className="card">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-tertiary">
            <FileText className="h-4 w-4 text-text-secondary" />
            <span className="font-medium">{key}</span>
          </div>
          <pre className="p-4 text-sm font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all">
            {value}
          </pre>
        </div>
      ))}
    </div>
  )
}

export function ConfigMapDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: configMap, isLoading } = useConfigMap(namespace!, name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (!configMap) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        ConfigMap not found
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <ConfigMapOverview configMap={configMap} /> },
    { id: 'data', label: 'Data', content: <ConfigMapDataTab configMap={configMap} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="ConfigMap" namespace={namespace!} name={name!} /> },
  ]

  return (
    <ResourceDetailLayout
      kind="ConfigMap"
      name={configMap.name}
      namespace={configMap.namespace}
      breadcrumbs={[
        { label: 'ConfigMaps', href: ROUTES.CONFIGMAPS },
        { label: configMap.name },
      ]}
      tabs={tabs}
    />
  )
}
