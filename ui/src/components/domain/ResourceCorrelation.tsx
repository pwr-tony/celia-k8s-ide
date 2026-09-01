import { useNavigate } from 'react-router'
import { ROUTES } from '@/router/routes'
import { ChevronRight, Layers, Box, Server, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceRef {
  kind: string
  name: string
  namespace?: string
}

interface ResourceCorrelationProps {
  chain: ResourceRef[]
  currentResource?: string
}

function getResourceIcon(kind: string) {
  switch (kind.toLowerCase()) {
    case 'deployment':
      return Layers
    case 'replicaset':
      return Settings
    case 'pod':
      return Box
    case 'node':
      return Server
    default:
      return Box
  }
}

function getResourceRoute(kind: string, namespace: string | undefined, name: string): string | null {
  switch (kind.toLowerCase()) {
    case 'deployment':
      return namespace ? `${ROUTES.DEPLOYMENTS}/${namespace}/${name}` : null
    case 'pod':
      return namespace ? `${ROUTES.PODS}/${namespace}/${name}` : null
    case 'node':
      return `${ROUTES.NODES}/${name}`
    case 'service':
      return namespace ? `${ROUTES.SERVICES}/${namespace}/${name}` : null
    default:
      return null
  }
}

function getKindColor(kind: string): string {
  switch (kind.toLowerCase()) {
    case 'deployment':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'replicaset':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    case 'pod':
      return 'bg-green-500/10 text-green-400 border-green-500/30'
    case 'node':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
}

export function ResourceCorrelation({ chain, currentResource }: ResourceCorrelationProps) {
  const navigate = useNavigate()

  if (chain.length === 0) {
    return (
      <div className="text-sm text-text-tertiary">
        No owner references
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chain.map((resource, index) => {
        const Icon = getResourceIcon(resource.kind)
        const route = getResourceRoute(resource.kind, resource.namespace, resource.name)
        const isCurrent = resource.name === currentResource
        const isClickable = route && !isCurrent

        return (
          <div key={`${resource.kind}-${resource.name}`} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            )}
            <button
              onClick={() => isClickable && navigate(route)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                getKindColor(resource.kind),
                isClickable && 'hover:scale-105 cursor-pointer',
                isCurrent && 'ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-primary',
                !isClickable && !isCurrent && 'opacity-70'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div className="text-xs opacity-70">{resource.kind}</div>
                <div className="text-sm font-medium truncate max-w-[150px]">
                  {resource.name}
                </div>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function buildCorrelationChain(
  ownerKind: string | undefined,
  ownerName: string | undefined,
  currentKind: string,
  currentName: string,
  namespace?: string
): ResourceRef[] {
  const chain: ResourceRef[] = []
  const ns = namespace || undefined

  if (ownerKind === 'ReplicaSet' && ownerName) {
    const deploymentName = extractDeploymentName(ownerName)
    if (deploymentName) {
      chain.push({ kind: 'Deployment', name: deploymentName, ...(ns && { namespace: ns }) })
    }
    chain.push({ kind: 'ReplicaSet', name: ownerName, ...(ns && { namespace: ns }) })
  } else if (ownerKind && ownerName) {
    chain.push({ kind: ownerKind, name: ownerName, ...(ns && { namespace: ns }) })
  }

  chain.push({ kind: currentKind, name: currentName, ...(ns && { namespace: ns }) })

  return chain
}

function extractDeploymentName(replicaSetName: string): string | null {
  const match = replicaSetName.match(/^(.+)-[a-z0-9]+$/)
  return match ? match[1] : null
}
