import { useParams } from 'react-router'
import { useSecret } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab } from '@/components/domain/ResourceDetail'
import { DetailPageSkeleton, EmptyState } from '@/components/data'
import { PageError } from '@/components/error'
import { ROUTES } from '@/router/routes'
import { Tag, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/primitives'
import type { Secret } from '@/api/schemas'

function SecretOverview({ secret }: { secret: Secret }) {
  const labelEntries = Object.entries(secret.Labels || {})
  const dataKeys = Object.keys(secret.Data || {})

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Info</h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Type</span>
              <p className="font-medium">{secret.Type}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Data Keys</span>
              <p className="font-medium">{dataKeys.length}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Created</span>
              <p className="font-medium">{new Date(secret.CreatedAt).toLocaleString()}</p>
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

function SecretDataTab({ secret }: { secret: Secret }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const dataEntries = Object.entries(secret.Data || {})

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (dataEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No data keys
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 overflow-auto">
      {dataEntries.map(([key, dataValue]) => (
        <div key={key} className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-secondary" />
              <span className="font-medium">{key}</span>
              <span className="text-xs text-text-tertiary">({dataValue.Size} bytes)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleReveal(key)}>
              {revealed[key] ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Reveal
                </>
              )}
            </Button>
          </div>
          <div className="p-4">
            {revealed[key] ? (
              dataValue.Value ? (
                <pre className="text-sm font-mono bg-bg-tertiary p-3 rounded overflow-x-auto">
                  {dataValue.Value}
                </pre>
              ) : (
                <p className="text-warning text-sm">
                  Value is masked. Check the YAML tab for the base64-encoded value.
                </p>
              )
            ) : (
              <p className="text-text-tertiary text-sm">
                {dataValue.Masked ? 'Value is masked' : 'Click "Reveal" to show value'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SecretDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const { data: secret, isLoading, error, refetch } = useSecret(namespace!, name!)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <PageError error={error as Error} onRetry={() => refetch()} />
  }

  if (!secret) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Lock}
          title="Secret not found"
          description={`The secret "${name}" was not found in namespace "${namespace}".`}
        />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <SecretOverview secret={secret} /> },
    { id: 'data', label: 'Data', content: <SecretDataTab secret={secret} /> },
    { id: 'yaml', label: 'YAML', content: <ResourceYAMLTab kind="Secret" namespace={namespace!} name={name!} /> },
  ]

  return (
    <ResourceDetailLayout
      kind="Secret"
      name={secret.Name}
      namespace={secret.Namespace}
      status={secret.Type}
      statusType="neutral"
      breadcrumbs={[
        { label: 'Secrets', href: ROUTES.SECRETS },
        { label: secret.Name },
      ]}
      tabs={tabs}
    />
  )
}
