import { useParams } from 'react-router'
import { useSecret } from '@/api/hooks'
import { ResourceDetailLayout, ResourceYAMLTab } from '@/components/domain/ResourceDetail'
import { ROUTES } from '@/router/routes'
import { Loader2, Tag, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/primitives'
import type { Secret } from '@/api/schemas'

function SecretOverview({ secret }: { secret: Secret }) {
  const labelEntries = Object.entries(secret.labels || {})

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Info</h3>
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-text-tertiary">Type</span>
              <p className="font-medium">{secret.type}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Data Keys</span>
              <p className="font-medium">{secret.data_keys?.length ?? 0}</p>
            </div>
            <div>
              <span className="text-sm text-text-tertiary">Created</span>
              <p className="font-medium">{new Date(secret.created_at).toLocaleString()}</p>
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

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!secret.data_keys?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No data keys
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 overflow-auto">
      {secret.data_keys.map((key) => (
        <div key={key} className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-secondary" />
              <span className="font-medium">{key}</span>
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
              <p className="text-warning text-sm">
                Secret values are not available in list view for security reasons.
                Check the YAML tab for the base64-encoded value.
              </p>
            ) : (
              <p className="text-text-tertiary text-sm">
                Click "Reveal" to show warning about secret data visibility
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
  const { data: secret, isLoading } = useSecret(namespace!, name!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (!secret) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Secret not found
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
      name={secret.name}
      namespace={secret.namespace}
      status={secret.type}
      statusType="neutral"
      breadcrumbs={[
        { label: 'Secrets', href: ROUTES.SECRETS },
        { label: secret.name },
      ]}
      tabs={tabs}
    />
  )
}
